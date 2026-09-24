"""TreeSHAP attribution of a single regional pressure prediction."""

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np
import shap
from lightgbm import LGBMRegressor
from sklearn.compose import ColumnTransformer

from app.ml.pressure.artifact import (
    METADATA_FILE,
    MODEL_FILE,
    MissingPressureModelError,
    PressureArtifact,
    load_artifact,
)
from app.ml.pressure.inference import (
    bounded_occupancy_rate,
    forecast_features,
    pressure_band,
)
from app.schemas.pressure import (
    DestinationPressureExplanationResponse,
    PressureBandThresholds,
    PressureFeatureContribution,
)

FEATURE_LABELS = {
    "month_number": "forecast month",
    "region": "region",
    "occupancy_lag_1": "occupancy last month",
    "occupancy_lag_2": "occupancy two months ago",
    "occupancy_lag_3": "occupancy three months ago",
    "arrivals_lag_1": "tourist arrivals last month",
    "arrival_trend": "recent tourist-arrival trend",
    "is_holiday": "holiday indicator",
    "is_peak_season": "peak-season indicator",
}


@dataclass(frozen=True)
class PressureExplainer:
    artifact: PressureArtifact
    tree_explainer: shap.TreeExplainer


@lru_cache(maxsize=8)
def _cached_explainer(
    directory: Path,
    model_stamp: tuple[int, int],
    metadata_stamp: tuple[int, int],
) -> PressureExplainer:
    artifact = load_artifact(directory)
    regressor = artifact.model.named_steps["regressor"]
    if not isinstance(regressor, LGBMRegressor):
        raise TypeError("Pressure artifact is not a LightGBM regressor")
    return PressureExplainer(artifact, shap.TreeExplainer(regressor))


def load_explainer(directory: Path) -> PressureExplainer:
    """Reuse explainers until the deployed model or metadata file changes."""
    model_path = directory / MODEL_FILE
    metadata_path = directory / METADATA_FILE
    if not model_path.is_file() or not metadata_path.is_file():
        raise MissingPressureModelError(
            "Regional pressure model artifact is unavailable"
        )
    model_stat = model_path.stat()
    metadata_stat = metadata_path.stat()
    return _cached_explainer(
        directory.resolve(),
        (model_stat.st_mtime_ns, model_stat.st_size),
        (metadata_stat.st_mtime_ns, metadata_stat.st_size),
    )


def _original_feature_contributions(
    preprocessing: ColumnTransformer,
    shap_values: np.ndarray,
    input_values: dict[str, str | int | float],
) -> list[PressureFeatureContribution]:
    transformed_names = preprocessing.get_feature_names_out()
    if len(transformed_names) != len(shap_values):
        raise ValueError("SHAP values do not align with transformed model features")
    grouped = {name: 0.0 for name in input_values}
    for transformed_name, value in zip(transformed_names, shap_values, strict=True):
        if transformed_name.startswith("region__"):
            original_name = "region"
        elif transformed_name.startswith("remainder__"):
            original_name = transformed_name.removeprefix("remainder__")
        else:
            raise ValueError(
                f"Unknown transformed pressure feature: {transformed_name}"
            )
        if original_name not in grouped:
            raise ValueError(
                f"SHAP feature is absent from model inputs: {original_name}"
            )
        grouped[original_name] += float(value)
    return [
        PressureFeatureContribution(
            feature_name=name,
            display_name=FEATURE_LABELS.get(name, name.replace("_", " ")),
            input_value=value,
            shap_value=grouped[name],
            direction=(
                "INCREASES"
                if grouped[name] > 0
                else "DECREASES"
                if grouped[name] < 0
                else "NEUTRAL"
            ),
        )
        for name, value in input_values.items()
    ]


def plain_language_explanation(
    *,
    region: str,
    month: str,
    forecast: float,
    base_value: float,
    contributions: list[PressureFeatureContribution],
) -> str:
    """Deterministic template; SHAP values describe the model, not causality."""
    ranked = sorted(
        (item for item in contributions if abs(item.shap_value) > 1e-9),
        key=lambda item: (-abs(item.shap_value), item.feature_name),
    )[:2]
    if ranked:
        drivers = "; ".join(
            f"{item.display_name} {'raises' if item.shap_value > 0 else 'lowers'} "
            f"the raw model prediction by {abs(item.shap_value):.1f} points"
            for item in ranked
        )
    else:
        drivers = "no individual input materially shifts the raw model prediction"
    return (
        f"The model forecasts {forecast:.1f}% regional occupancy for {region} "
        f"in {month}. Relative to its expected value of {base_value:.1f}%, "
        f"{drivers}. These are model explanations, not causal effects or "
        "exact Sustainability Index contributions. They explain the raw model "
        "output before the 0–100% display bound."
    )


def explain_regional_pressure(
    directory: Path,
    *,
    destination_id: int,
    destination_slug: str,
    region: str,
    month: str,
    thresholds: PressureBandThresholds,
) -> DestinationPressureExplanationResponse:
    bundle = load_explainer(directory)
    model = bundle.artifact.model
    features, input_values = forecast_features(
        bundle.artifact, region=region, month=month
    )
    preprocessing = model.named_steps["features"]
    if not isinstance(preprocessing, ColumnTransformer):
        raise TypeError("Pressure artifact lacks the expected feature transformer")
    transformed = preprocessing.transform(features)
    if hasattr(transformed, "toarray"):
        transformed = transformed.toarray()
    shap_result = bundle.tree_explainer.shap_values(transformed)
    values = np.asarray(shap_result, dtype=float).reshape(-1)
    base_value = float(np.asarray(bundle.tree_explainer.expected_value).reshape(-1)[0])
    raw_prediction = float(model.predict(features)[0])
    contributions = _original_feature_contributions(preprocessing, values, input_values)
    if not np.isclose(
        base_value + sum(item.shap_value for item in contributions),
        raw_prediction,
        atol=1e-5,
    ):
        raise ValueError("SHAP contributions do not reconstruct the model prediction")
    forecast = bounded_occupancy_rate(raw_prediction)
    return DestinationPressureExplanationResponse(
        destination_id=destination_id,
        destination_slug=destination_slug,
        region=region,
        month=month,
        predicted_regional_occupancy_rate=forecast,
        band=pressure_band(forecast, thresholds),
        model_version=str(bundle.artifact.metadata["model_version"]),
        raw_model_prediction=raw_prediction,
        base_value=base_value,
        input_features=input_values,
        feature_contributions=sorted(
            contributions, key=lambda item: (-abs(item.shap_value), item.feature_name)
        ),
        plain_language_explanation=plain_language_explanation(
            region=region,
            month=month,
            forecast=forecast,
            base_value=base_value,
            contributions=contributions,
        ),
    )
