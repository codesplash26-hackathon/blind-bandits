"""Small deterministic, non-persistent what-if factor transformations."""

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.simulation import (
    DestinationSimulationResponse,
    SimulatedFactorChange,
    SimulationScenario,
)
from app.services.sustainability import (
    SustainabilityFactorScores,
    SustainabilityWeightConfiguration,
    calculate_sustainability_score,
)


class SimulationPolicy(BaseModel):
    """Versioned policy; values must be reviewed before production configuration."""

    version: str = Field(min_length=1, max_length=100)
    waste_reference_level: Decimal = Field(ge=0, le=100)
    environmental_points_per_waste_level: Decimal = Field(ge=0)

    model_config = ConfigDict(extra="forbid", frozen=True)


def _bounded_factor(value: Decimal) -> Decimal:
    return min(Decimal(100), max(Decimal(0), value))


def _preserve_unchanged(original: Decimal, simulated: Decimal) -> Decimal:
    return original if simulated == original else simulated


def apply_scenario(
    current: SustainabilityFactorScores,
    scenario: SimulationScenario,
    policy: SimulationPolicy,
) -> SustainabilityFactorScores:
    """Map visitor level to crowd, waste delta to environment, infrastructure directly.

    The current crowd factor is the inverse of the normalized visitor-level proxy.
    Waste has no stored baseline, so only deviation from the configured reference
    adjusts the current environmental factor. Community and suitability are held
    constant; this policy does not claim to model secondary effects.
    """
    environmental = _bounded_factor(
        current.environmental
        + (scenario.waste_management_level - policy.waste_reference_level)
        * policy.environmental_points_per_waste_level
    )
    return SustainabilityFactorScores(
        environmental=_preserve_unchanged(current.environmental, environmental),
        community=current.community,
        crowd=_preserve_unchanged(
            current.crowd, Decimal(100) - scenario.expected_visitor_level
        ),
        infrastructure=_preserve_unchanged(
            current.infrastructure, scenario.infrastructure_level
        ),
        suitability=current.suitability,
    )


def simulate_destination(
    *,
    destination_id: int,
    destination_slug: str,
    current: SustainabilityFactorScores,
    scenario: SimulationScenario,
    policy: SimulationPolicy,
    sustainability_weights: SustainabilityWeightConfiguration,
) -> DestinationSimulationResponse:
    """Calculate a hypothetical score without mutating ORM objects or storage."""
    baseline = SimulationScenario(
        expected_visitor_level=Decimal(100) - current.crowd,
        waste_management_level=policy.waste_reference_level,
        infrastructure_level=current.infrastructure,
    )
    simulated = apply_scenario(current, scenario, policy)
    original_result = calculate_sustainability_score(current, sustainability_weights)
    simulated_result = calculate_sustainability_score(simulated, sustainability_weights)
    changes = {
        name: SimulatedFactorChange(
            original=original_value,
            simulated=simulated_value,
            delta=simulated_value - original_value,
        )
        for name, original_value in current.model_dump().items()
        if (simulated_value := getattr(simulated, name)) != original_value
    }
    score_delta = simulated_result.total_score - original_result.total_score
    if changes:
        factor_summary = "; ".join(
            f"{name.replace('_', ' ')} changes from {change.original} to {change.simulated}"
            for name, change in changes.items()
        )
        explanation = (
            f"Illustrative what-if: {factor_summary}. "
            f"The Sustainability Index changes by {score_delta:+} points. "
            "This is a temporary calculation, not a forecast or a stored update."
        )
    else:
        explanation = (
            "This scenario matches the current factor values, so the Sustainability "
            "Index is unchanged. This is a temporary calculation, not a stored update."
        )
    return DestinationSimulationResponse(
        destination_id=destination_id,
        destination_slug=destination_slug,
        scenario=scenario,
        baseline_scenario=baseline,
        original_score=original_result.total_score,
        simulated_score=simulated_result.total_score,
        score_delta=score_delta,
        original_factors=current,
        simulated_factors=simulated,
        changed_factors=changes,
        sustainability_configuration_version=original_result.configuration_version,
        simulation_policy_version=policy.version,
        explanation=explanation,
    )
