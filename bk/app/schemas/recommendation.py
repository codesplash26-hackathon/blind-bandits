from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.destination import ActivitySlug, DestinationResponse
from app.services.sustainability import SustainabilityFactorScores


class CrowdPreference(str, Enum):
    QUIET = "QUIET"
    BALANCED = "BALANCED"
    LIVELY = "LIVELY"


class SustainabilityPreference(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class RecommendationRequest(BaseModel):
    budget: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    trip_duration: int = Field(gt=0, le=365)
    interests: list[ActivitySlug] = Field(min_length=1, max_length=20)
    crowd_preference: CrowdPreference
    sustainability_preference: SustainabilityPreference

    model_config = ConfigDict(extra="forbid")

    @field_validator("interests")
    @classmethod
    def unique_interests(cls, values: list[str]) -> list[str]:
        return list(dict.fromkeys(values))


class PreferenceMatchResponse(BaseModel):
    matched_interests: list[str]
    unmatched_interests: list[str]
    interest_match_score: Decimal
    crowd_match_score: Decimal
    ranking_score: Decimal


class RecommendationItemResponse(BaseModel):
    rank: int
    destination: DestinationResponse
    sustainability_score: Decimal
    factor_scores: SustainabilityFactorScores
    preference_match: PreferenceMatchResponse


class RecommendationResponse(BaseModel):
    results: list[RecommendationItemResponse]

