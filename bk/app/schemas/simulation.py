"""Validated what-if inputs and a frontend-ready comparison response."""

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.services.sustainability import SustainabilityFactorScores


class SimulationScenario(BaseModel):
    expected_visitor_level: Decimal = Field(ge=0, le=100)
    waste_management_level: Decimal = Field(ge=0, le=100)
    infrastructure_level: Decimal = Field(ge=0, le=100)

    model_config = ConfigDict(extra="forbid", frozen=True)


class SimulatedFactorChange(BaseModel):
    original: Decimal
    simulated: Decimal
    delta: Decimal


class DestinationSimulationResponse(BaseModel):
    destination_id: int
    destination_slug: str
    scenario: SimulationScenario
    baseline_scenario: SimulationScenario
    original_score: Decimal
    simulated_score: Decimal
    score_delta: Decimal
    original_factors: SustainabilityFactorScores
    simulated_factors: SustainabilityFactorScores
    changed_factors: dict[str, SimulatedFactorChange]
    sustainability_configuration_version: str
    simulation_policy_version: str
    explanation: str
