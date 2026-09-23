"""Admin dashboard aggregation over existing map, pressure, and index services."""

from pathlib import Path

from sqlalchemy.orm import Session

from app.schemas.dashboard import (
    AdminDashboardResponse,
    DashboardPressureCounts,
    DashboardPressureDestination,
    DashboardRecommendedAction,
    DashboardSustainabilitySummary,
)
from app.schemas.map_data import MapDestination
from app.schemas.pressure import PressureBand, PressureBandThresholds
from app.services.map_data import get_map_destinations
from app.services.sustainability import SustainabilityWeightConfiguration

HIGHEST_PRESSURE_LIMIT = 5


def _average(values: list[float]) -> float | None:
    return sum(values) / len(values) if values else None


def _recommended_action(
    counts: DashboardPressureCounts,
    high_destinations: list[int],
) -> DashboardRecommendedAction:
    if counts.high:
        return DashboardRecommendedAction(
            code="REVIEW_HIGH_PRESSURE",
            priority="HIGH",
            message=(
                f"Review visitor management and lower-pressure alternatives for "
                f"{counts.high} high-pressure destination(s)."
            ),
            destination_ids=high_destinations,
        )
    if counts.medium:
        return DashboardRecommendedAction(
            code="MONITOR_MEDIUM_PRESSURE",
            priority="MEDIUM",
            message=f"Monitor conditions at {counts.medium} medium-pressure destination(s).",
            destination_ids=[],
        )
    if counts.low:
        return DashboardRecommendedAction(
            code="MAINTAIN_MONITORING",
            priority="LOW",
            message="Maintain routine monitoring; no medium- or high-pressure forecasts are available.",
            destination_ids=[],
        )
    return DashboardRecommendedAction(
        code="NO_FORECAST_DATA",
        priority="INFO",
        message="No regional pressure forecasts are available for active destinations in this month.",
        destination_ids=[],
    )


def _sustainability_summary(
    destinations: list[MapDestination],
) -> DashboardSustainabilitySummary:
    scores = [
        item.sustainability_score
        for item in destinations
        if item.sustainability_score is not None
    ]
    environmental = [
        item.environmental_score
        for item in destinations
        if item.environmental_score is not None
    ]
    community = [
        item.community_score
        for item in destinations
        if item.community_score is not None
    ]
    return DashboardSustainabilitySummary(
        scored_destinations=len(scores),
        average_score=_average(scores),
        minimum_score=min(scores) if scores else None,
        maximum_score=max(scores) if scores else None,
        average_environmental_score=_average(environmental),
        average_community_score=_average(community),
    )


def build_admin_dashboard(
    db: Session,
    *,
    month: str,
    artifact_dir: Path,
    thresholds: PressureBandThresholds | None,
    sustainability_weights: SustainabilityWeightConfiguration,
) -> AdminDashboardResponse:
    map_data = get_map_destinations(
        db,
        month=month,
        region=None,
        pressure_filter=None,
        artifact_dir=artifact_dir,
        thresholds=thresholds,
        sustainability_weights=sustainability_weights,
    )
    active = map_data.destinations
    monitored = [
        item
        for item in active
        if item.tourism_pressure_level is not None
        and item.tourism_pressure_value is not None
    ]
    counts = DashboardPressureCounts(
        low=sum(item.tourism_pressure_level == PressureBand.LOW for item in monitored),
        medium=sum(
            item.tourism_pressure_level == PressureBand.MEDIUM for item in monitored
        ),
        high=sum(
            item.tourism_pressure_level == PressureBand.HIGH for item in monitored
        ),
    )
    ranked = sorted(
        monitored,
        key=lambda item: (-item.tourism_pressure_value, item.id),
    )
    highest = [
        DashboardPressureDestination(
            id=item.id,
            slug=item.slug,
            name=item.name,
            region=item.region,
            pressure_level=item.tourism_pressure_level,
            predicted_regional_occupancy_rate=item.tourism_pressure_value,
            sustainability_score=item.sustainability_score,
        )
        for item in ranked[:HIGHEST_PRESSURE_LIMIT]
    ]
    high_ids = [
        item.id for item in ranked if item.tourism_pressure_level == PressureBand.HIGH
    ]
    return AdminDashboardResponse(
        month=month,
        pressure_model_version=map_data.pressure_model_version,
        total_active_destinations=len(active),
        monitored_destinations=len(monitored),
        without_pressure_forecast=len(active) - len(monitored),
        pressure_counts=counts,
        highest_pressure_destinations=highest,
        sustainability=_sustainability_summary(active),
        recommended_action=_recommended_action(counts, high_ids),
    )
