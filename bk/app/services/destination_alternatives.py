"""Select similar active destinations with lower regional forecast pressure."""

from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.pressure.artifact import load_artifact
from app.ml.pressure.inference import (
    ForecastContextUnavailableError,
    predict_regional_pressure_from_artifact,
    pressure_band,
)
from app.models.destination import Destination
from app.schemas.alternatives import (
    AlternativeDestination,
    AlternativeReason,
    DestinationAlternativesResponse,
    RegionalPressureSummary,
)
from app.schemas.destination import DestinationResponse
from app.schemas.pressure import PressureBand, PressureBandThresholds
from app.services.destination_similarity import (
    destination_cosine_similarities,
    straight_line_distance_km,
)
from app.services.destinations import destination_load_options
from app.services.sustainability import (
    SustainabilityFactorScores,
    SustainabilityWeightConfiguration,
    calculate_sustainability_score,
)


def suggest_alternatives(
    db: Session,
    source: Destination,
    *,
    month: str,
    artifact_dir: Path,
    thresholds: PressureBandThresholds,
    sustainability_weights: SustainabilityWeightConfiguration,
) -> DestinationAlternativesResponse:
    artifact = load_artifact(artifact_dir)
    source_rate, version = predict_regional_pressure_from_artifact(
        artifact, region=source.region, month=month
    )
    source_band = pressure_band(source_rate, thresholds)
    source_pressure = RegionalPressureSummary(
        region=source.region,
        predicted_occupancy_rate=source_rate,
        band=source_band,
        model_version=version,
    )
    response_fields = {
        "source_destination_id": source.id,
        "source_destination_slug": source.slug,
        "month": month,
        "source_pressure": source_pressure,
    }
    if source_band != PressureBand.HIGH:
        return DestinationAlternativesResponse(
            **response_fields, status="SOURCE_NOT_HIGH_PRESSURE", alternatives=[]
        )

    candidates = list(
        db.scalars(
            select(Destination)
            .where(Destination.is_active.is_(True), Destination.id != source.id)
            .options(*destination_load_options())
            .order_by(Destination.id)
        )
    )
    similarities = destination_cosine_similarities(source, candidates)
    regional_forecasts: dict[str, float | None] = {source.region: source_rate}
    alternatives: list[AlternativeDestination] = []
    for candidate, similarity in zip(candidates, similarities, strict=True):
        if similarity <= 0 or candidate.factor is None:
            continue
        if candidate.region not in regional_forecasts:
            try:
                rate, _ = predict_regional_pressure_from_artifact(
                    artifact, region=candidate.region, month=month
                )
                regional_forecasts[candidate.region] = rate
            except ForecastContextUnavailableError:
                regional_forecasts[candidate.region] = None
        rate = regional_forecasts[candidate.region]
        if rate is None or rate >= source_rate:
            continue
        factor = candidate.factor
        sustainability = calculate_sustainability_score(
            SustainabilityFactorScores(
                environmental=factor.environmental_score,
                community=factor.community_benefit_score,
                crowd=factor.crowd_score,
                infrastructure=factor.infrastructure_score,
                suitability=factor.tourist_suitability_score,
            ),
            sustainability_weights,
        )
        alternatives.append(
            AlternativeDestination(
                destination=DestinationResponse.model_validate(candidate),
                similarity_score=similarity,
                similarity_percentage=similarity * 100,
                pressure=RegionalPressureSummary(
                    region=candidate.region,
                    predicted_occupancy_rate=rate,
                    band=pressure_band(rate, thresholds),
                    model_version=version,
                ),
                sustainability_score=sustainability.total_score,
                sustainability_configuration_version=sustainability.configuration_version,
                reason=AlternativeReason(
                    same_landscape=(
                        source.landscape_type.casefold()
                        == candidate.landscape_type.casefold()
                    ),
                    shared_activities=sorted(
                        {item.slug for item in source.activities}
                        & {item.slug for item in candidate.activities}
                    ),
                    pressure_reduction_percentage_points=source_rate - rate,
                    straight_line_distance_km=straight_line_distance_km(
                        source, candidate
                    ),
                ),
            )
        )
    # Design decision: similarity leads once lower pressure is guaranteed.
    # Lower occupancy, shorter straight-line distance, then ID break ties.
    alternatives.sort(
        key=lambda item: (
            -item.similarity_score,
            item.pressure.predicted_occupancy_rate,
            item.reason.straight_line_distance_km,
            item.destination.id,
        )
    )
    return DestinationAlternativesResponse(
        **response_fields,
        status="ALTERNATIVES_FOUND" if alternatives else "NO_ELIGIBLE_ALTERNATIVES",
        alternatives=alternatives,
    )
