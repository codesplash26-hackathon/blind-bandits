"""Current environmental data with explicit provenance and freshness."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from app.models.environment import ObservationType


class EnvironmentalObservationResponse(BaseModel):
    id: int
    destination_id: int
    observation_type: ObservationType
    values: dict[str, str | int | float]
    source: str
    source_location: str
    observed_at: datetime
    fetched_at: datetime
    age_minutes: float = Field(ge=0)
    is_stale: bool


class EnvironmentalSnapshotResponse(BaseModel):
    destination_id: int
    weather: EnvironmentalObservationResponse | None
    air_quality: EnvironmentalObservationResponse | None


class RefreshStatus(str, Enum):
    UPDATED = "UPDATED"
    UNCHANGED = "UNCHANGED"
    FALLBACK = "FALLBACK"
    UNAVAILABLE = "UNAVAILABLE"


class EnvironmentalRefreshResponse(BaseModel):
    status: RefreshStatus
    observation: EnvironmentalObservationResponse | None
    fallback_reason: str | None = None
