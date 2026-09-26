"""TreeSHAP attribution of a single regional pressure prediction."""

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np
import shap
from lightgbm import LGBMRegressor
from sklearn.compose import ColumnTransformer

from app.ml.pressure.artifact import (
    MissingPressureModelError,
    PressureArtifact,
    artifact_paths,
    load_artifact,
)
from app.ml.pressure.inference import (
    forecast_features,
    predict_visitor_pressure_from_artifact,
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
    "canonical_region": "Tourism region",
    "month": "Forecast month",
    "month_sin": "Seasonality (sine component)",
    "month_cos": "Seasonality (cosine component)",
    "arrivals_lag_2": "Tourist arrivals two months ago",
    "arrivals_lag_3": "Tourist arrivals three months ago",
    "arrivals_growth_lagged": "Recent tourist arrival growth",
    "arrivals_change_lag_1": "Recent change in tourist arrivals",
    "occupancy_rolling_3": "Recent three-month occupancy average",
    "occupancy_change_lag_1": "Recent occupancy change",
    "occupancy_change_lag_2": "Earlier occupancy change",
}
FEATURE_LABELS.update(
    {
        "occupancy_lag_1": "Previous month's occupancy",
        "occupancy_lag_2": "Occupancy two months ago",
        "occupancy_lag_3": "Occupancy three months ago",
        "arrivals_lag_1": "Previous month's tourist arrivals",
    }
)
ADDIVITY_TOLERANCE = 1e-6


@dataclass(frozen=True)
class PressureExplainer:
    artifact: PressureArtifact
    tree_explainer: shap.TreeExplainer


@lru_cache(maxsize=8)
def _cached_explainer(
    directory: Path,
    stamps: tuple[tuple[int, int], ...],
) -> PressureExplainer:
    del stamps
    artifact = load_artifact(directory)
    regressor = artifact.model.named_steps["regressor"]
    if not isinstance(regressor, LGBMRegressor):
        raise TypeError("Pressure artifact is not a LightGBM regressor")
    return PressureExplainer(artifact, shap.TreeExplainer(regressor))


def load_explainer(directory: Path) -> PressureExplainer:
    """Reuse explainers until the deployed model or metadata file changes."""
    model_path, metadata_path, explanation_path = artifact_paths(directory)
    if not model_path.is_file() or not metadata_path.is_file():
        raise MissingPressureModelError(
            "Regional pressure model artifact is unavailable"
        )
    paths = [model_path, metadata_path]
    if explanation_path is not None and explanation_path.is_file():
        paths.append(explanation_path)
    return _cached_explainer(
        directory.resolve(),
        tuple((path.stat().st_mtime_ns, path.stat().st_size) for path in paths),
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


def _v2_feature_contributions(
    artifact: PressureArtifact,
    preprocessing: ColumnTransformer,
    shap_values: np.ndarray,
    input_values: dict[str, str | int | float],
) -> list[PressureFeatureContribution]:
    transformed_names = preprocessing.get_feature_names_out()
    if len(transformed_names) != len(shap_values):
        raise ValueError("SHAP values do not align with transformed model features")
    grouped = {name: 0.0 for name in artifact.feature_names}
    for transformed_name, value in zip(transformed_names, shap_values, strict=True):
        original_name = (
            "canonical_region"
            if transformed_name.startswith("canonical_region_")
            else str(transformed_name)
        )
        if original_name not in grouped:
            raise ValueError(
                f"Unknown transformed pressure feature: {transformed_name}"
            )
        grouped[original_name] += float(value)
    return [
        PressureFeatureContribution(
            feature_name=name,
            feature=name,
            display_name=FEATURE_LABELS[name],
            input_value=input_values[name],
            feature_value=input_values[name],
            shap_value=value,
            direction=(
                "increase" if value > 0 else "decrease" if value < 0 else "neutral"
            ),
        )
        for name, value in grouped.items()
    ]


def residual_explanation_text(
    predicted_residual: float,
    contributions: list[PressureFeatureContribution],
) -> str:
    """Deterministic and deliberately non-causal visitor-facing wording."""
    trend = (
        "rise"
        if predicted_residual > 0
        else "fall"
        if predicted_residual < 0
        else "remain unchanged"
    )
    ranked = sorted(
        (item for item in contributions if abs(item.shap_value) > 1e-9),
        key=lambda item: (-abs(item.shap_value), item.feature_name),
    )
    labels: list[str] = []
    for item in ranked:
        label = (
            "Seasonality"
            if item.feature_name in {"month_sin", "month_cos"}
            else item.display_name
        )
        if label not in labels:
            labels.append(label)
        if len(labels) == 2:
            break
    driver_text = (
        f"{', '.join(labels)} contributed most to the model adjustment."
        if labels
        else "No individual feature materially shifted the residual prediction."
    )
    return (
        f"Visitor pressure is forecast to {trend} compared with the previous month. "
        f"{driver_text} SHAP values describe how inputs pushed the predicted "
        "residual upward or downward; they do not establish causation."
    )


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
    preprocessing_name = (
        "preprocessing" if bundle.artifact.target_type == "residual" else "features"
    )
    preprocessing = model.named_steps[preprocessing_name]
    if not isinstance(preprocessing, ColumnTransformer):
        raise TypeError("Pressure artifact lacks the expected feature transformer")
    transformed = preprocessing.transform(features)
    if hasattr(transformed, "toarray"):
        transformed = transformed.toarray()
    shap_result = bundle.tree_explainer.shap_values(transformed)
    values = np.asarray(shap_result, dtype=float).reshape(-1)
    base_value = float(np.asarray(bundle.tree_explainer.expected_value).reshape(-1)[0])
    raw_prediction = float(model.predict(features)[0])
    contributions = (
        _v2_feature_contributions(bundle.artifact, preprocessing, values, input_values)
        if bundle.artifact.target_type == "residual"
        else _original_feature_contributions(preprocessing, values, input_values)
    )
    if not np.isclose(
        base_value + sum(item.shap_value for item in contributions),
        raw_prediction,
        rtol=0.0,
        atol=ADDIVITY_TOLERANCE,
    ):
        raise ValueError("SHAP contributions do not reconstruct the model prediction")
    prediction = predict_visitor_pressure_from_artifact(
        bundle.artifact, region=region, month=month
    )
    forecast = prediction.predicted_occupancy
    explanation_text = (
        residual_explanation_text(raw_prediction, contributions)
        if bundle.artifact.target_type == "residual"
        else plain_language_explanation(
            region=region,
            month=month,
            forecast=forecast,
            base_value=base_value,
            contributions=contributions,
        )
    )
    ordered = sorted(
        contributions, key=lambda item: (-abs(item.shap_value), item.feature_name)
    )
    return DestinationPressureExplanationResponse(
        destination_id=destination_id,
        destination_slug=destination_slug,
        region=prediction.region,
        month=month,
        predicted_regional_occupancy_rate=forecast,
        band=pressure_band(forecast, thresholds),
        model_version=str(bundle.artifact.metadata["model_version"]),
        prediction_type=prediction.prediction_type,
        forecast_mode=prediction.forecast_mode,
        forecast_month=month,
        previous_occupancy=prediction.previous_occupancy,
        predicted_residual=prediction.predicted_residual,
        predicted_occupancy=forecast,
        pressure_band=pressure_band(forecast, thresholds),
        raw_model_prediction=raw_prediction,
        base_value=base_value,
        base_residual=base_value if bundle.artifact.target_type == "residual" else None,
        input_features=input_values,
        feature_contributions=ordered,
        top_positive_factors=[item for item in ordered if item.shap_value > 0][:3],
        top_negative_factors=[item for item in ordered if item.shap_value < 0][:3],
        plain_language_explanation=explanation_text,
        explanation_text=explanation_text,
    )


explain_visitor_pressure = explain_regional_pressure
