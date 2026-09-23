from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.engagement import InteractionType, RecommendationSearch
from app.schemas.destination import DestinationResponse
from app.schemas.recommendation import RecommendationRequest


class RecommendationHistoryItem(BaseModel):
    id: int
    request: RecommendationRequest
    result_destination_ids: list[int]
    sustainability_config_version: str
    ranking_version: str
    created_at: datetime


class SavedDestinationResponse(BaseModel):
    id: int
    destination: DestinationResponse
    saved_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InteractionEventRequest(BaseModel):
    destination_id: int = Field(gt=0)
    event_type: InteractionType
    recommendation_search_id: int | None = Field(default=None, gt=0)
    source_destination_id: int | None = Field(default=None, gt=0)
    pressure_month: str | None = Field(default=None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$")

    model_config = ConfigDict(extra="forbid")

    @field_validator("pressure_month")
    @classmethod
    def valid_pressure_year(cls, value: str | None) -> str | None:
        if value is not None and value.startswith("0000"):
            raise ValueError("Invalid pressure month")
        return value

    @model_validator(mode="after")
    def validate_selection_context(self) -> "InteractionEventRequest":
        if self.event_type == InteractionType.DESTINATION_SAVED:
            raise ValueError("Save destinations through /api/v1/saved/{destination_id}")
        if (
            self.event_type
            in {
                InteractionType.RECOMMENDATION_SELECTED,
                InteractionType.ALTERNATIVE_SELECTED,
            }
            and self.recommendation_search_id is None
        ):
            raise ValueError("Selection events require recommendation_search_id")
        if self.event_type == InteractionType.ALTERNATIVE_SELECTED:
            if (self.source_destination_id is None) != (self.pressure_month is None):
                raise ValueError(
                    "Alternative context requires both source_destination_id and pressure_month"
                )
        elif self.source_destination_id is not None or self.pressure_month is not None:
            raise ValueError(
                "Pressure context is only valid for alternative selections"
            )
        return self


class InteractionEventResponse(BaseModel):
    id: int
    destination_id: int
    event_type: InteractionType
    recommendation_search_id: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


def history_item_from_record(
    record: RecommendationSearch,
) -> RecommendationHistoryItem:
    return RecommendationHistoryItem(
        id=record.id,
        request=RecommendationRequest.model_validate(record.request_data),
        result_destination_ids=record.result_destination_ids,
        sustainability_config_version=record.sustainability_config_version,
        ranking_version=record.ranking_version,
        created_at=record.created_at,
    )
