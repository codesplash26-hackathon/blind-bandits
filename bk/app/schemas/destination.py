from datetime import datetime
from decimal import Decimal
from typing import Annotated, Any

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    field_validator,
    model_validator,
)

from app.models.destination import ConfidenceLevel, FactorValueType
from app.schemas.sustainability import DestinationSustainabilityResponse

Slug = Annotated[
    str,
    StringConstraints(
        min_length=1,
        max_length=150,
        pattern=r"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$",
    ),
]
ActivitySlug = Annotated[
    str,
    StringConstraints(
        min_length=1,
        max_length=100,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    ),
]
Score = Annotated[
    Decimal,
    Field(ge=0, le=100, max_digits=5, decimal_places=2),
]


class DestinationFactorInput(BaseModel):
    environmental_score: Score
    community_benefit_score: Score
    crowd_score: Score
    infrastructure_score: Score
    tourist_suitability_score: Score
    data_source: str = Field(min_length=1, max_length=500)
    confidence_level: ConfidenceLevel
    value_type: FactorValueType
    last_updated: datetime

    model_config = ConfigDict(extra="forbid")

    @field_validator("data_source")
    @classmethod
    def strip_data_source(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Data source cannot be blank")
        return value

class DestinationFactorResponse(DestinationFactorInput):
    id: int
    destination_id: int

    model_config = ConfigDict(from_attributes=True)


class DestinationBase(BaseModel):
    slug: Slug
    name: str = Field(min_length=1, max_length=255)
    district: str = Field(min_length=1, max_length=100)
    region: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1)
    image_url: str | None = Field(default=None, min_length=1, max_length=2048)
    latitude: Decimal = Field(ge=-90, le=90, max_digits=9, decimal_places=6)
    longitude: Decimal = Field(ge=-180, le=180, max_digits=10, decimal_places=6)
    landscape_type: str = Field(min_length=1, max_length=100)
    typical_budget: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    recommended_min_trip_duration: int = Field(gt=0)
    recommended_max_trip_duration: int = Field(gt=0)
    is_active: bool = True

    model_config = ConfigDict(extra="forbid")

    @field_validator("name", "district", "region", "description", "landscape_type")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Value cannot be blank")
        return value

    @field_validator("image_url")
    @classmethod
    def strip_image_url(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Image URL cannot be blank")
        return value

    @model_validator(mode="after")
    def validate_trip_duration(self) -> "DestinationBase":
        if self.recommended_max_trip_duration < self.recommended_min_trip_duration:
            raise ValueError(
                "recommended_max_trip_duration must be greater than or equal to "
                "recommended_min_trip_duration"
            )
        return self


class DestinationCreate(DestinationBase):
    activities: list[ActivitySlug] = Field(default_factory=list)
    factor: DestinationFactorInput | None = None

    @field_validator("activities")
    @classmethod
    def unique_activities(cls, values: list[str]) -> list[str]:
        return list(dict.fromkeys(values))


class DestinationUpdate(BaseModel):
    slug: Slug | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    district: str | None = Field(default=None, min_length=1, max_length=100)
    region: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, min_length=1)
    image_url: str | None = Field(default=None, min_length=1, max_length=2048)
    latitude: Decimal | None = Field(
        default=None,
        ge=-90,
        le=90,
        max_digits=9,
        decimal_places=6,
    )
    longitude: Decimal | None = Field(
        default=None,
        ge=-180,
        le=180,
        max_digits=10,
        decimal_places=6,
    )
    landscape_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    typical_budget: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    recommended_min_trip_duration: int | None = Field(default=None, gt=0)
    recommended_max_trip_duration: int | None = Field(default=None, gt=0)
    is_active: bool | None = None
    activities: list[ActivitySlug] | None = None
    factor: DestinationFactorInput | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("name", "district", "region", "description", "landscape_type")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Value cannot be blank")
        return value

    @field_validator("image_url")
    @classmethod
    def strip_optional_image_url(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Image URL cannot be blank")
        return value

    @field_validator("activities")
    @classmethod
    def unique_optional_activities(
        cls,
        values: list[str] | None,
    ) -> list[str] | None:
        if values is None:
            return values
        return list(dict.fromkeys(values))

    @model_validator(mode="after")
    def validate_provided_trip_duration(self) -> "DestinationUpdate":
        if (
            self.recommended_min_trip_duration is not None
            and self.recommended_max_trip_duration is not None
            and self.recommended_max_trip_duration < self.recommended_min_trip_duration
        ):
            raise ValueError(
                "recommended_max_trip_duration must be greater than or equal to "
                "recommended_min_trip_duration"
            )
        return self


class DestinationResponse(DestinationBase):
    id: int
    activities: list[str]
    factor: DestinationFactorResponse | None
    created_at: datetime
    updated_at: datetime
    sustainability: DestinationSustainabilityResponse | None = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("activities", mode="before")
    @classmethod
    def activity_models_to_slugs(cls, value: Any) -> list[str]:
        return [item.slug if hasattr(item, "slug") else str(item) for item in value]
