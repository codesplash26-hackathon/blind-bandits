"""Frontend-facing lower-pressure alternative destination cards."""

from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.destination import DestinationResponse
from app.schemas.pressure import PressureBand


class RegionalPressureSummary(BaseModel):
    scope: Literal["REGIONAL"] = "REGIONAL"
    region: str
    predicted_occupancy_rate: float = Field(ge=0, le=100)
    band: PressureBand
    model_version: str


class AlternativeReason(BaseModel):
    same_landscape: bool
    shared_activities: list[str]
    pressure_reduction_percentage_points: float = Field(gt=0)
    straight_line_distance_km: float = Field(ge=0)


class AlternativeDestination(BaseModel):
    destination: DestinationResponse
    similarity_score: float = Field(gt=0, le=1)
    similarity_percentage: float = Field(gt=0, le=100)
    pressure: RegionalPressureSummary
    sustainability_score: Decimal = Field(ge=0, le=100)
    sustainability_configuration_version: str
    reason: AlternativeReason


class DestinationAlternativesResponse(BaseModel):
    source_destination_id: int
    source_destination_slug: str
    month: str
    source_pressure: RegionalPressureSummary
    status: Literal[
        "ALTERNATIVES_FOUND",
        "SOURCE_NOT_HIGH_PRESSURE",
        "NO_ELIGIBLE_ALTERNATIVES",
    ]
    alternatives: list[AlternativeDestination]
