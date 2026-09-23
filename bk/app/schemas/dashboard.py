"""Structured administrator dashboard cards, table, and action data."""

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.pressure import PressureBand


class DashboardPressureCounts(BaseModel):
    low: int = Field(ge=0)
    medium: int = Field(ge=0)
    high: int = Field(ge=0)


class DashboardSustainabilitySummary(BaseModel):
    scored_destinations: int = Field(ge=0)
    average_score: float | None = Field(default=None, ge=0, le=100)
    minimum_score: float | None = Field(default=None, ge=0, le=100)
    maximum_score: float | None = Field(default=None, ge=0, le=100)
    average_environmental_score: float | None = Field(default=None, ge=0, le=100)
    average_community_score: float | None = Field(default=None, ge=0, le=100)


class DashboardPressureDestination(BaseModel):
    id: int
    slug: str
    name: str
    region: str
    pressure_level: PressureBand
    predicted_regional_occupancy_rate: float = Field(ge=0, le=100)
    sustainability_score: float | None = Field(default=None, ge=0, le=100)


class DashboardRecommendedAction(BaseModel):
    code: Literal[
        "REVIEW_HIGH_PRESSURE",
        "MONITOR_MEDIUM_PRESSURE",
        "MAINTAIN_MONITORING",
        "NO_FORECAST_DATA",
    ]
    priority: Literal["HIGH", "MEDIUM", "LOW", "INFO"]
    message: str
    destination_ids: list[int]


class AdminDashboardResponse(BaseModel):
    month: str
    pressure_scope: Literal["REGIONAL"] = "REGIONAL"
    pressure_model_version: str | None
    total_active_destinations: int = Field(ge=0)
    monitored_destinations: int = Field(ge=0)
    without_pressure_forecast: int = Field(ge=0)
    pressure_counts: DashboardPressureCounts
    highest_pressure_destinations: list[DashboardPressureDestination]
    sustainability: DashboardSustainabilitySummary
    recommended_action: DashboardRecommendedAction
