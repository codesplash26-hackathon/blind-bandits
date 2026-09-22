from collections.abc import Iterable
from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.destination import Destination, DestinationFactor
from app.schemas.destination import DestinationResponse
from app.schemas.recommendation import (
    CrowdPreference,
    PreferenceMatchResponse,
    RecommendationItemResponse,
    RecommendationRequest,
    RecommendationResponse,
    SustainabilityPreference,
)
from app.services.destinations import destination_load_options
from app.services.sustainability import (
    SustainabilityFactorScores,
    SustainabilityResult,
    SustainabilityWeightConfiguration,
    calculate_sustainability_score,
)

# Project design decision: recommendation cards currently return five results.
# This can be made client-configurable if product requirements later call for it.
DEFAULT_RECOMMENDATION_LIMIT = 5

# Project design decision: sustainability preference controls how strongly the
# Sustainability Index affects ranking. These transparent multipliers are an
# initial policy and can be tuned after user research without changing the
# underlying Sustainability Index formula.
SUSTAINABILITY_PREFERENCE_MULTIPLIERS = {
    SustainabilityPreference.LOW: Decimal("0.25"),
    SustainabilityPreference.MEDIUM: Decimal("0.50"),
    SustainabilityPreference.HIGH: Decimal("1.00"),
}


@dataclass(frozen=True)
class RankedCandidate:
    destination: Destination
    sustainability: SustainabilityResult
    matched_interests: tuple[str, ...]
    unmatched_interests: tuple[str, ...]
    interest_match_score: Decimal
    crowd_match_score: Decimal
    ranking_score: Decimal


def _factor_scores(factor: DestinationFactor) -> SustainabilityFactorScores:
    return SustainabilityFactorScores(
        environmental=factor.environmental_score,
        community=factor.community_benefit_score,
        crowd=factor.crowd_score,
        infrastructure=factor.infrastructure_score,
        suitability=factor.tourist_suitability_score,
    )


def _destination_interests(destination: Destination) -> set[str]:
    landscape = destination.landscape_type.strip().lower().replace(" ", "-")
    return {activity.slug for activity in destination.activities} | {landscape}


def _interest_match(
    destination: Destination,
    requested_interests: list[str],
) -> tuple[tuple[str, ...], tuple[str, ...], Decimal]:
    available = _destination_interests(destination)
    matched = tuple(item for item in requested_interests if item in available)
    unmatched = tuple(item for item in requested_interests if item not in available)
    score = Decimal(len(matched)) / Decimal(len(requested_interests)) * Decimal(100)
    return matched, unmatched, score


def _crowd_match(score: Decimal, preference: CrowdPreference) -> Decimal:
    # A high crowd-condition score is treated as low crowd pressure. BALANCED
    # peaks at 50, while LIVELY intentionally favors lower condition scores.
    if preference == CrowdPreference.QUIET:
        return score
    if preference == CrowdPreference.LIVELY:
        return Decimal(100) - score
    return Decimal(100) - abs(score - Decimal(50)) * Decimal(2)


def _is_eligible(
    destination: Destination,
    request: RecommendationRequest,
) -> bool:
    # Initial filtering policy: typical_budget is treated as the expected total
    # destination cost, and duration must fit the full recommended interval.
    return (
        destination.is_active
        and destination.factor is not None
        and destination.typical_budget <= request.budget
        and destination.recommended_min_trip_duration
        <= request.trip_duration
        <= destination.recommended_max_trip_duration
    )


def rank_destinations(
    destinations: Iterable[Destination],
    request: RecommendationRequest,
    sustainability_configuration: SustainabilityWeightConfiguration,
    *,
    limit: int = DEFAULT_RECOMMENDATION_LIMIT,
) -> RecommendationResponse:
    candidates: list[RankedCandidate] = []
    sustainability_multiplier = SUSTAINABILITY_PREFERENCE_MULTIPLIERS[
        request.sustainability_preference
    ]

    for destination in destinations:
        if not _is_eligible(destination, request):
            continue
        factor = destination.factor
        if factor is None:  # Narrow the type after the eligibility check.
            continue
        sustainability = calculate_sustainability_score(
            _factor_scores(factor),
            sustainability_configuration,
        )
        matched, unmatched, interest_score = _interest_match(
            destination,
            request.interests,
        )
        crowd_score = _crowd_match(
            sustainability.factor_scores.crowd,
            request.crowd_preference,
        )
        # Project design decision: interests and crowd fit contribute on their
        # native 0-100 scales; the user-selected multiplier controls the third
        # sustainability component. This is deliberately simple and auditable.
        ranking_score = (
            interest_score
            + crowd_score
            + sustainability.total_score * sustainability_multiplier
        )
        candidates.append(
            RankedCandidate(
                destination=destination,
                sustainability=sustainability,
                matched_interests=matched,
                unmatched_interests=unmatched,
                interest_match_score=interest_score,
                crowd_match_score=crowd_score,
                ranking_score=ranking_score,
            )
        )

    ordered = sorted(
        candidates,
        key=lambda candidate: (
            -candidate.ranking_score,
            -candidate.interest_match_score,
            -candidate.crowd_match_score,
            -candidate.sustainability.total_score,
            candidate.destination.slug,
            candidate.destination.id or 0,
        ),
    )[:limit]

    return RecommendationResponse(
        results=[
            RecommendationItemResponse(
                rank=rank,
                destination=DestinationResponse.model_validate(candidate.destination),
                sustainability_score=candidate.sustainability.total_score,
                factor_scores=candidate.sustainability.factor_scores,
                preference_match=PreferenceMatchResponse(
                    matched_interests=list(candidate.matched_interests),
                    unmatched_interests=list(candidate.unmatched_interests),
                    interest_match_score=candidate.interest_match_score,
                    crowd_match_score=candidate.crowd_match_score,
                    ranking_score=candidate.ranking_score,
                ),
            )
            for rank, candidate in enumerate(ordered, start=1)
        ]
    )


def recommend_destinations(
    db: Session,
    request: RecommendationRequest,
    sustainability_configuration: SustainabilityWeightConfiguration,
) -> RecommendationResponse:
    statement = (
        select(Destination)
        .where(Destination.is_active.is_(True))
        .options(*destination_load_options())
    )
    destinations = db.scalars(statement).unique().all()
    return rank_destinations(destinations, request, sustainability_configuration)
