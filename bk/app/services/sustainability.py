from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

WEIGHT_SUM_TOLERANCE = Decimal("0.000000001")


class SustainabilityFactorScores(BaseModel):
    environmental: Decimal = Field(ge=0, le=100)
    community: Decimal = Field(ge=0, le=100)
    crowd: Decimal = Field(ge=0, le=100)
    infrastructure: Decimal = Field(ge=0, le=100)
    suitability: Decimal = Field(ge=0, le=100)

    model_config = ConfigDict(extra="forbid", frozen=True)


class SustainabilityWeightValues(BaseModel):
    environmental: Decimal = Field(ge=0, le=1)
    community: Decimal = Field(ge=0, le=1)
    crowd: Decimal = Field(ge=0, le=1)
    infrastructure: Decimal = Field(ge=0, le=1)
    suitability: Decimal = Field(ge=0, le=1)

    model_config = ConfigDict(extra="forbid", frozen=True)

    @model_validator(mode="after")
    def validate_weight_sum(self) -> "SustainabilityWeightValues":
        total = (
            self.environmental
            + self.community
            + self.crowd
            + self.infrastructure
            + self.suitability
        )
        if abs(total - Decimal(1)) > WEIGHT_SUM_TOLERANCE:
            raise ValueError("Sustainability weights must sum to 1.0")
        return self


class SustainabilityWeightConfiguration(BaseModel):
    version: str = Field(min_length=1, max_length=100)
    weights: SustainabilityWeightValues

    model_config = ConfigDict(extra="forbid", frozen=True)


class SustainabilityContributions(BaseModel):
    environmental: Decimal
    community: Decimal
    crowd: Decimal
    infrastructure: Decimal
    suitability: Decimal

    model_config = ConfigDict(extra="forbid", frozen=True)


class SustainabilityResult(BaseModel):
    total_score: Decimal
    factor_scores: SustainabilityFactorScores
    configured_weights: SustainabilityWeightValues
    weighted_contributions: SustainabilityContributions
    configuration_version: str

    model_config = ConfigDict(extra="forbid", frozen=True)


def calculate_sustainability_score(
    factor_scores: SustainabilityFactorScores,
    configuration: SustainabilityWeightConfiguration,
) -> SustainabilityResult:
    weights = configuration.weights
    contributions = SustainabilityContributions(
        environmental=factor_scores.environmental * weights.environmental,
        community=factor_scores.community * weights.community,
        crowd=factor_scores.crowd * weights.crowd,
        infrastructure=factor_scores.infrastructure * weights.infrastructure,
        suitability=factor_scores.suitability * weights.suitability,
    )
    total_score = (
        contributions.environmental
        + contributions.community
        + contributions.crowd
        + contributions.infrastructure
        + contributions.suitability
    )
    return SustainabilityResult(
        total_score=total_score,
        factor_scores=factor_scores,
        configured_weights=weights,
        weighted_contributions=contributions,
        configuration_version=configuration.version,
    )
