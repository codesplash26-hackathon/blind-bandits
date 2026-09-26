from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

import pytest
from httpx2 import AsyncClient

from app.models.destination import (
    Activity,
    ConfidenceLevel,
    Destination,
    DestinationFactor,
    FactorValueType,
)
from app.models.user import User
from app.schemas.recommendation import RecommendationRequest
from app.services.recommendations import rank_destinations
from app.services.sustainability import SustainabilityWeightConfiguration
from tests.conftest import login_headers
from tests.test_destinations import create_example_destination, tourist_headers

TEMPORARY_TEST_WEIGHTS = SustainabilityWeightConfiguration.model_validate(
    {
        "version": "temporary-recommendation-test-v1",
        "weights": {
            "environmental": "0.20",
            "community": "0.20",
            "crowd": "0.20",
            "infrastructure": "0.20",
            "suitability": "0.20",
        },
    }
)


def recommendation_request(**changes: Any) -> RecommendationRequest:
    values: dict[str, Any] = {
        "budget": "20000.00",
        "trip_duration": 2,
        "interests": ["nature"],
        "crowd_preference": "BALANCED",
        "sustainability_preference": "MEDIUM",
    }
    values.update(changes)
    return RecommendationRequest.model_validate(values)


def destination_fixture(
    identifier: int,
    slug: str,
    *,
    budget: str = "10000.00",
    min_duration: int = 1,
    max_duration: int = 3,
    interests: tuple[str, ...] = ("nature",),
    crowd_score: str = "50.00",
    other_factor_score: str = "50.00",
    is_active: bool = True,
    with_factor: bool = True,
) -> Destination:
    timestamp = datetime(2026, 1, 1, tzinfo=UTC)
    destination = Destination(
        id=identifier,
        slug=slug,
        name=slug.replace("-", " ").title(),
        district="Test District",
        region="Test Region",
        description="Controlled recommendation test fixture.",
        latitude=Decimal("6.000000"),
        longitude=Decimal("80.000000"),
        landscape_type="test-landscape",
        typical_budget=Decimal(budget),
        recommended_min_trip_duration=min_duration,
        recommended_max_trip_duration=max_duration,
        is_active=is_active,
        created_at=timestamp,
        updated_at=timestamp,
    )
    destination.activities = [
        Activity(id=identifier * 100 + index, slug=interest, name=interest.title())
        for index, interest in enumerate(interests, start=1)
    ]
    if with_factor:
        factor_value = Decimal(other_factor_score)
        destination.factor = DestinationFactor(
            id=identifier,
            destination_id=identifier,
            environmental_score=factor_value,
            community_benefit_score=factor_value,
            crowd_score=Decimal(crowd_score),
            infrastructure_score=factor_value,
            tourist_suitability_score=factor_value,
            data_source="Controlled automated test fixture",
            confidence_level=ConfidenceLevel.LOW,
            value_type=FactorValueType.PROXY,
            last_updated=timestamp,
        )
    return destination


def result_slugs(destinations: list[Destination], request: RecommendationRequest) -> list[str]:
    response = rank_destinations(destinations, request, TEMPORARY_TEST_WEIGHTS)
    return [item.destination.slug for item in response.results]


def test_budget_filtering() -> None:
    cheap = destination_fixture(1, "cheap-destination", budget="10000.00")
    expensive = destination_fixture(2, "expensive-destination", budget="30000.00")

    assert result_slugs([cheap, expensive], recommendation_request()) == [
        "cheap-destination"
    ]


def test_duration_filtering() -> None:
    short_trip = destination_fixture(
        1,
        "short-trip",
        min_duration=1,
        max_duration=2,
    )
    long_trip = destination_fixture(
        2,
        "long-trip",
        min_duration=4,
        max_duration=7,
    )

    assert result_slugs([long_trip, short_trip], recommendation_request()) == [
        "short-trip"
    ]


def test_interest_matching_affects_ranking() -> None:
    nature = destination_fixture(1, "nature-match", interests=("nature",))
    culture = destination_fixture(2, "culture-only", interests=("culture",))

    response = rank_destinations(
        [culture, nature],
        recommendation_request(interests=["nature"]),
        TEMPORARY_TEST_WEIGHTS,
    )

    assert [item.destination.slug for item in response.results] == [
        "nature-match",
        "culture-only",
    ]
    assert response.results[0].preference_match.matched_interests == ["nature"]
    assert response.results[0].preference_match.interest_match_score == Decimal(100)
    assert response.results[1].preference_match.unmatched_interests == ["nature"]


def test_crowd_preference_behavior() -> None:
    quiet = destination_fixture(1, "quiet-place", crowd_score="90.00")
    lively = destination_fixture(2, "lively-place", crowd_score="10.00")

    quiet_order = result_slugs(
        [lively, quiet],
        recommendation_request(crowd_preference="QUIET"),
    )
    lively_order = result_slugs(
        [lively, quiet],
        recommendation_request(crowd_preference="LIVELY"),
    )

    assert quiet_order == ["quiet-place", "lively-place"]
    assert lively_order == ["lively-place", "quiet-place"]


def test_sustainability_preference_behavior() -> None:
    stronger_interest_match = destination_fixture(
        1,
        "stronger-interest-match",
        interests=("nature", "beach"),
        crowd_score="50.00",
        other_factor_score="10.00",
    )
    stronger_sustainability = destination_fixture(
        2,
        "stronger-sustainability",
        interests=("nature",),
        crowd_score="50.00",
        other_factor_score="100.00",
    )
    destinations = [stronger_sustainability, stronger_interest_match]

    low_order = result_slugs(
        destinations,
        recommendation_request(
            interests=["nature", "beach"],
            sustainability_preference="LOW",
        ),
    )
    high_order = result_slugs(
        destinations,
        recommendation_request(
            interests=["nature", "beach"],
            sustainability_preference="HIGH",
        ),
    )

    assert low_order[0] == "stronger-interest-match"
    assert high_order[0] == "stronger-sustainability"


def test_inactive_destinations_are_excluded() -> None:
    active = destination_fixture(1, "active-destination")
    inactive = destination_fixture(2, "inactive-destination", is_active=False)

    assert result_slugs([inactive, active], recommendation_request()) == [
        "active-destination"
    ]


def test_ranking_is_deterministic() -> None:
    alpha = destination_fixture(1, "alpha-destination")
    beta = destination_fixture(2, "beta-destination")
    request = recommendation_request()

    first = result_slugs([beta, alpha], request)
    second = result_slugs([alpha, beta], request)

    assert first == second == ["alpha-destination", "beta-destination"]


def test_only_top_five_results_are_returned() -> None:
    destinations = [
        destination_fixture(index, f"destination-{index}")
        for index in range(1, 7)
    ]

    response = rank_destinations(
        destinations,
        recommendation_request(),
        TEMPORARY_TEST_WEIGHTS,
    )

    assert len(response.results) == 5
    assert [item.rank for item in response.results] == [1, 2, 3, 4, 5]


def test_no_suitable_results() -> None:
    over_budget = destination_fixture(1, "over-budget", budget="50000.00")
    missing_factors = destination_fixture(2, "missing-factors", with_factor=False)

    response = rank_destinations(
        [over_budget, missing_factors],
        recommendation_request(),
        TEMPORARY_TEST_WEIGHTS,
    )

    assert response.results == []


@pytest.mark.anyio
async def test_valid_recommendation_request(
    client: AsyncClient,
    admin_user: User,
) -> None:
    destination = await create_example_destination(client, admin_user)

    response = await client.post(
        "/api/v1/recommendations",
        json={
            "budget": "20000.00",
            "trip_duration": 2,
            "interests": ["nature", "beach"],
            "crowd_preference": "BALANCED",
            "sustainability_preference": "HIGH",
        },
        headers=await tourist_headers(client),
    )

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body["recommendation_search_id"], int)
    assert len(body["results"]) == 1
    assert body["results"][0]["rank"] == 1
    assert body["results"][0]["destination"]["id"] == destination["id"]
    assert set(body["results"][0]["factor_scores"]) == {
        "environmental",
        "community",
        "crowd",
        "infrastructure",
        "suitability",
    }
    assert body["results"][0]["preference_match"]["matched_interests"] == [
        "nature"
    ]


@pytest.mark.anyio
async def test_recommendation_authentication_is_required(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/recommendations",
        json={
            "budget": "20000.00",
            "trip_duration": 2,
            "interests": ["nature"],
            "crowd_preference": "BALANCED",
            "sustainability_preference": "MEDIUM",
        },
    )

    assert response.status_code == 401


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("field", "invalid_value"),
    [
        ("budget", 0),
        ("trip_duration", 0),
        ("interests", []),
        ("crowd_preference", "UNKNOWN"),
        ("sustainability_preference", "UNKNOWN"),
    ],
)
async def test_invalid_recommendation_request_validation(
    client: AsyncClient,
    admin_user: User,
    field: str,
    invalid_value: Any,
) -> None:
    payload: dict[str, Any] = {
        "budget": "20000.00",
        "trip_duration": 2,
        "interests": ["nature"],
        "crowd_preference": "BALANCED",
        "sustainability_preference": "MEDIUM",
    }
    payload[field] = invalid_value

    response = await client.post(
        "/api/v1/recommendations",
        json=payload,
        headers=await login_headers(client, admin_user.email, "admin-password"),
    )

    assert response.status_code == 422
