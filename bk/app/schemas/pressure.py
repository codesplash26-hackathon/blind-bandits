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
    prediction_type: str = "regional_monthly_occupancy"
    forecast_mode: str = "one_month_ahead"
    forecast_month: str | None = None
    previous_occupancy: float | None = Field(default=None, ge=0, le=100)
    predicted_residual: float | None = None
    predicted_occupancy: float | None = Field(default=None, ge=0, le=100)
    pressure_band: PressureBand | None = None


class PressureFeatureContribution(BaseModel):
    feature_name: str
    feature: str | None = None
    display_name: str
    input_value: str | int | float
    feature_value: str | int | float | None = None
    shap_value: float
    direction: Literal[
        "increase", "decrease", "neutral", "INCREASES", "DECREASES", "NEUTRAL"
    ]

    @model_validator(mode="after")
    def populate_public_names(self) -> "PressureFeatureContribution":
        if self.feature is None:
            self.feature = self.feature_name
        if self.feature_value is None:
            self.feature_value = self.input_value
        return self


class DestinationPressureExplanationResponse(DestinationPressureResponse):
    explanation_method: Literal["TreeSHAP"] = "TreeSHAP"
    contribution_kind: Literal["model_explanation"] = "model_explanation"
    raw_model_prediction: float
    base_value: float
    input_features: dict[str, str | int | float]
    feature_contributions: list[PressureFeatureContribution]
    plain_language_explanation: str
    base_residual: float | None = None
    top_positive_factors: list[PressureFeatureContribution] = []
    top_negative_factors: list[PressureFeatureContribution] = []
    explanation_text: str | None = None
