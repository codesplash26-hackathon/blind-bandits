"""Compact, numeric destination markers for the Sri Lanka map."""

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.pressure import PressureBand


class MapDestination(BaseModel):
    id: int
    slug: str
    name: str
    region: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    sustainability_score: float | None = Field(default=None, ge=0, le=100)
    tourism_pressure_level: PressureBand | None = None
    tourism_pressure_value: float | None = Field(default=None, ge=0, le=100)
    environmental_score: float | None = Field(default=None, ge=0, le=100)
    community_score: float | None = Field(default=None, ge=0, le=100)


class MapDestinationsResponse(BaseModel):
    month: str
    pressure_scope: Literal["REGIONAL"] = "REGIONAL"
    pressure_model_version: str | None
    destinations: list[MapDestination]
