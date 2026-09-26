"""One-query map marker projection with per-region pressure reuse."""

from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ml.pressure.artifact import load_artifact
from app.ml.pressure.inference import (
    ForecastContextUnavailableError,
    predict_regional_pressure_from_artifact,
    pressure_band,
)
from app.models.destination import Destination, DestinationFactor
from app.schemas.map_data import MapDestination, MapDestinationsResponse
from app.schemas.pressure import PressureBand, PressureBandThresholds
from app.services.sustainability import (
    SustainabilityFactorScores,
    SustainabilityWeightConfiguration,
    calculate_sustainability_score,
)


class MissingPressureThresholdsError(ValueError):
    """Pressure bands have not been configured for a nonempty map."""


def get_map_destinations(
    db: Session,
    *,
    month: str,
    region: str | None,
    pressure_filter: PressureBand | None,
    artifact_dir: Path,
    thresholds: PressureBandThresholds | None,
    sustainability_weights: SustainabilityWeightConfiguration,
) -> MapDestinationsResponse:
    statement = (
        select(
            Destination.id,
            Destination.slug,
            Destination.name,
            Destination.region,
            Destination.pressure_region,
            Destination.latitude,
            Destination.longitude,
            DestinationFactor.environmental_score,
            DestinationFactor.community_benefit_score,
            DestinationFactor.crowd_score,
            DestinationFactor.infrastructure_score,
            DestinationFactor.tourist_suitability_score,
        )
        .outerjoin(
            DestinationFactor, DestinationFactor.destination_id == Destination.id
        )
        .where(Destination.is_active.is_(True))
        .order_by(Destination.id)
    )
    if region is not None:
        statement = statement.where(func.lower(Destination.region) == region.casefold())
    rows = db.execute(statement).all()
    if not rows:
        return MapDestinationsResponse(
            month=month, pressure_model_version=None, destinations=[]
        )
    if thresholds is None:
        raise MissingPressureThresholdsError("Pressure bands are not configured")

    artifact = load_artifact(artifact_dir)
    regional_pressure: dict[str, tuple[float, PressureBand] | None] = {}
    markers: list[MapDestination] = []
    for row in rows:
        if row.pressure_region is not None and row.pressure_region not in regional_pressure:
            try:
                rate, _ = predict_regional_pressure_from_artifact(
                    artifact, region=row.pressure_region, month=month
                )
                regional_pressure[row.pressure_region] = (rate, pressure_band(rate, thresholds))
            except ForecastContextUnavailableError:
                regional_pressure[row.pressure_region] = None
        forecast = regional_pressure.get(row.pressure_region)
        if pressure_filter is not None and (
            forecast is None or forecast[1] != pressure_filter
        ):
            continue

        sustainability_score: float | None = None
        if row.environmental_score is not None:
            factor_scores = SustainabilityFactorScores(
                environmental=row.environmental_score,
                community=row.community_benefit_score,
                crowd=row.crowd_score,
                infrastructure=row.infrastructure_score,
                suitability=row.tourist_suitability_score,
            )
            sustainability_score = float(
                calculate_sustainability_score(
                    factor_scores, sustainability_weights
                ).total_score
            )
        markers.append(
            MapDestination(
                id=row.id,
                slug=row.slug,
                name=row.name,
                region=row.region,
                latitude=float(row.latitude),
                longitude=float(row.longitude),
                sustainability_score=sustainability_score,
                tourism_pressure_level=forecast[1] if forecast else None,
                tourism_pressure_value=forecast[0] if forecast else None,
                environmental_score=(
                    float(row.environmental_score)
                    if row.environmental_score is not None
                    else None
                ),
                community_score=(
                    float(row.community_benefit_score)
                    if row.community_benefit_score is not None
                    else None
                ),
            )
        )
    return MapDestinationsResponse(
        month=month,
        pressure_model_version=str(artifact.metadata["model_version"]),
        destinations=markers,
    )
