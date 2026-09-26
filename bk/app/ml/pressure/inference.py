"""Regional residual-model inference from a previously trained artifact."""

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from app.ml.pressure.artifact import PressureArtifact, load_artifact
from app.schemas.pressure import PressureBand, PressureBandThresholds


class ForecastContextUnavailableError(LookupError):
    """The artifact has no reviewed next-month context for this region/month."""


class UnknownPressureRegionError(LookupError):
    """The destination region cannot be mapped to a model region."""


REGION_ALIASES = {
    "central": "Hill Country",
    "southern": "South Coast",
    "western": "Greater Colombo",
    "northern": "Northern Region",
    "eastern": "East Coast",
}


@dataclass(frozen=True)
class VisitorPressurePrediction:
    predicted_occupancy: float
    predicted_residual: float | None
    previous_occupancy: float | None
    model_version: str
    region: str
    forecast_month: str
    prediction_type: str
    forecast_mode: str
    pressure_band: PressureBand | None


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
    if artifact.target_type == "residual":
        categories = set(
            artifact.model.named_steps["preprocessing"]
            .named_transformers_["region"]
            .categories_[0]
        )
        canonical_region = (
            region if region in categories else REGION_ALIASES.get(region.lower())
        )
        if canonical_region not in categories:
            raise UnknownPressureRegionError(
                f"Destination region is not mapped to a model region: {region}"
            )
        context = next(
            (
                item
                for item in artifact.metadata.get("forecast_inputs", [])
                if item["canonical_region"] == canonical_region
                and item["forecast_month"] == month
            ),
            None,
        )
        if context is None:
            raise ForecastContextUnavailableError(
                "Insufficient exact lag history for the requested region/month"
            )
        names = list(artifact.feature_names)
        values = {name: context[name] for name in names}
        return pd.DataFrame([values], columns=names), values
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
    names = list(artifact.feature_names)
    return pd.DataFrame([context])[names], {name: context[name] for name in names}


def predict_regional_pressure(
    directory: Path,
    *,
    region: str,
    month: str,
) -> tuple[float, str]:
    artifact = load_artifact(directory)
    return predict_regional_pressure_from_artifact(artifact, region=region, month=month)


def predict_visitor_pressure(
    directory: Path,
    *,
    region: str,
    month: str,
    thresholds: PressureBandThresholds | None = None,
) -> VisitorPressurePrediction:
    return predict_visitor_pressure_from_artifact(
        load_artifact(directory), region=region, month=month, thresholds=thresholds
    )


def predict_visitor_pressure_from_artifact(
    artifact: PressureArtifact,
    *,
    region: str,
    month: str,
    thresholds: PressureBandThresholds | None = None,
) -> VisitorPressurePrediction:
    features, inputs = forecast_features(artifact, region=region, month=month)
    raw = float(artifact.model.predict(features)[0])
    if artifact.target_type == "residual":
        previous = float(inputs["occupancy_lag_1"])
        residual = raw
        occupancy = previous + residual
        result_region = str(inputs["canonical_region"])
        prediction_type = str(
            artifact.metadata.get("prediction_type", "regional_monthly_occupancy")
        )
        forecast_mode = str(
            artifact.metadata.get("forecast_mode", "one_month_ahead_walk_forward")
        )
    else:
        previous = None
        residual = None
        occupancy = bounded_occupancy_rate(raw)
        result_region = region
        prediction_type = "regional_monthly_occupancy"
        forecast_mode = "one_month_ahead"
    return VisitorPressurePrediction(
        predicted_occupancy=occupancy,
        predicted_residual=residual,
        previous_occupancy=previous,
        model_version=str(artifact.metadata["model_version"]),
        region=result_region,
        forecast_month=month,
        prediction_type=prediction_type,
        forecast_mode=forecast_mode,
        pressure_band=pressure_band(occupancy, thresholds) if thresholds else None,
    )


def predict_regional_pressure_from_artifact(
    artifact: PressureArtifact,
    *,
    region: str,
    month: str,
) -> tuple[float, str]:
    """Reuse one loaded artifact across multiple regional comparisons."""
    result = predict_visitor_pressure_from_artifact(
        artifact, region=region, month=month
    )
    return result.predicted_occupancy, result.model_version
