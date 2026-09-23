"""Regional forecast inference from a previously trained artifact."""

from pathlib import Path

import pandas as pd

from app.ml.pressure.artifact import load_artifact
from app.schemas.pressure import PressureBand, PressureBandThresholds


class ForecastContextUnavailableError(LookupError):
    """The artifact has no reviewed next-month context for this region/month."""


def pressure_band(score: float, thresholds: PressureBandThresholds) -> PressureBand:
    if score <= thresholds.low_max:
        return PressureBand.LOW
    if score <= thresholds.medium_max:
        return PressureBand.MEDIUM
    return PressureBand.HIGH


def predict_regional_pressure(
    directory: Path,
    *,
    region: str,
    month: str,
) -> tuple[float, str]:
    artifact = load_artifact(directory)
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
    features = pd.DataFrame([context])[artifact.metadata["feature_names"]]
    # Occupancy is a percentage; the regressor itself is unconstrained.
    score = min(100.0, max(0.0, float(artifact.model.predict(features)[0])))
    return score, str(artifact.metadata["model_version"])
