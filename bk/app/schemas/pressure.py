from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class PressureBand(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class PressureBandThresholds(BaseModel):
    low_max: float = Field(ge=0, le=100)
    medium_max: float = Field(ge=0, le=100)

    @model_validator(mode="after")
    def validate_order(self) -> "PressureBandThresholds":
        if self.low_max >= self.medium_max:
            raise ValueError("low_max must be less than medium_max")
        return self


class DestinationPressureResponse(BaseModel):
    destination_id: int
    destination_slug: str
    scope: str = "REGIONAL"
    region: str
    month: str
    predicted_regional_occupancy_rate: float = Field(ge=0, le=100)
    band: PressureBand
    model_version: str


class PressureFeatureContribution(BaseModel):
    feature_name: str
    display_name: str
    input_value: str | int | float
    shap_value: float
    direction: Literal["INCREASES", "DECREASES", "NEUTRAL"]


class DestinationPressureExplanationResponse(DestinationPressureResponse):
    explanation_method: Literal["TreeSHAP"] = "TreeSHAP"
    contribution_kind: Literal["model_explanation"] = "model_explanation"
    raw_model_prediction: float
    base_value: float
    input_features: dict[str, str | int | float]
    feature_contributions: list[PressureFeatureContribution]
    plain_language_explanation: str
