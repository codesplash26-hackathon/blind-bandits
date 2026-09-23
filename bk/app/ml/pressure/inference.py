"""Regional forecast inference from a previously trained artifact."""

from pathlib import Path

import pandas as pd

from app.ml.pressure.artifact import PressureArtifact, load_artifact
from app.schemas.pressure import PressureBand, PressureBandThresholds


class ForecastContextUnavailableError(LookupError):
    """The artifact has no reviewed next-month context for this region/month."""


def pressure_band(score: float, thresholds: PressureBandThresholds) -> PressureBand:
    if score <= thresholds.low_max:
        return PressureBand.LOW
    if score <= thresholds.medium_max:
        return PressureBand.MEDIUM
    return PressureBand.HIGH


def bounded_occupancy_rate(raw_prediction: float) -> float:
    """Bound the unconstrained regressor output for percentage display."""
    return min(100.0, max(0.0, raw_prediction))


def forecast_features(
    artifact: PressureArtifact,
    *,
    region: str,
    month: str,
) -> tuple[pd.DataFrame, dict[str, str | int | float]]:
    context = next(
        (
            item
            for item in artifact.metadata.get("forecast_inputs", [])
            if item["region"] == region and item["month"] == month
        ),
        None,
    )
    if context is None:
        raise ForecastContextUnavailableError(
            "No regional forecast context for the requested month"
        )
    names = artifact.metadata["feature_names"]
    return pd.DataFrame([context])[names], {name: context[name] for name in names}


def predict_regional_pressure(
    directory: Path,
    *,
    region: str,
    month: str,
) -> tuple[float, str]:
    artifact = load_artifact(directory)
    features, _ = forecast_features(artifact, region=region, month=month)
    score = bounded_occupancy_rate(float(artifact.model.predict(features)[0]))
    return score, str(artifact.metadata["model_version"])
