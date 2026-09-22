from copy import deepcopy
from decimal import Decimal

import pytest
from httpx2 import AsyncClient
from pydantic import ValidationError

from app.models.user import User
from app.services.sustainability import (
    SustainabilityFactorScores,
    SustainabilityWeightConfiguration,
    calculate_sustainability_score,
)
from tests.conftest import login_headers
from tests.test_destinations import (
    EXAMPLE_DESTINATION,
    create_example_destination,
    tourist_headers,
)


def temporary_weight_configuration() -> SustainabilityWeightConfiguration:
    return SustainabilityWeightConfiguration.model_validate(
        {
            "version": "temporary-unit-test-v1",
            "weights": {
                "environmental": "0.10",
                "community": "0.20",
                "crowd": "0.30",
                "infrastructure": "0.15",
                "suitability": "0.25",
            },
        }
    )


def test_correct_weighted_calculation_and_contributions() -> None:
    scores = SustainabilityFactorScores(
        environmental=80,
        community=70,
        crowd=60,
        infrastructure=90,
        suitability=75,
    )

    result = calculate_sustainability_score(
        scores,
        temporary_weight_configuration(),
    )

    assert result.total_score == Decimal("72.25")
    assert result.weighted_contributions.environmental == Decimal("8.00")
    assert result.weighted_contributions.community == Decimal("14.00")
    assert result.weighted_contributions.crowd == Decimal("18.00")
    assert result.weighted_contributions.infrastructure == Decimal("13.50")
    assert result.weighted_contributions.suitability == Decimal("18.75")
    assert result.factor_scores == scores
    assert result.configuration_version == "temporary-unit-test-v1"


@pytest.mark.parametrize("invalid_score", [Decimal("-0.01"), Decimal("100.01")])
def test_invalid_factor_range_is_rejected(invalid_score: Decimal) -> None:
    with pytest.raises(ValidationError):
        SustainabilityFactorScores(
            environmental=invalid_score,
            community=50,
            crowd=50,
            infrastructure=50,
            suitability=50,
        )


def test_missing_weight_is_rejected() -> None:
    with pytest.raises(ValidationError):
        SustainabilityWeightConfiguration.model_validate(
            {
                "version": "temporary-incomplete-test-v1",
                "weights": {
                    "environmental": "0.25",
                    "community": "0.25",
                    "crowd": "0.25",
                    "infrastructure": "0.25",
                },
            }
        )


def test_weights_not_summing_to_one_are_rejected() -> None:
    with pytest.raises(ValidationError, match="must sum to 1.0"):
        SustainabilityWeightConfiguration.model_validate(
            {
                "version": "temporary-invalid-sum-test-v1",
                "weights": {
                    "environmental": "0.10",
                    "community": "0.10",
                    "crowd": "0.10",
                    "infrastructure": "0.10",
                    "suitability": "0.10",
                },
            }
        )


def test_calculation_is_deterministic() -> None:
    scores = SustainabilityFactorScores(
        environmental="81.25",
        community="62.50",
        crowd="73.75",
        infrastructure="54.25",
        suitability="90.00",
    )
    configuration = temporary_weight_configuration()

    first = calculate_sustainability_score(scores, configuration)
    second = calculate_sustainability_score(scores, configuration)

    assert first == second
    assert first.model_dump() == second.model_dump()


@pytest.mark.anyio
async def test_sustainability_endpoint_requires_authentication_and_returns_schema(
    client: AsyncClient,
    admin_user: User,
) -> None:
    destination = await create_example_destination(client, admin_user)

    unauthenticated = await client.get(
        f"/api/v1/destinations/{destination['id']}/sustainability"
    )
    authenticated = await client.get(
        f"/api/v1/destinations/{destination['id']}/sustainability",
        headers=await tourist_headers(client),
    )

    assert unauthenticated.status_code == 401
    assert authenticated.status_code == 200
    body = authenticated.json()
    assert body["destination_id"] == destination["id"]
    assert body["destination_slug"] == destination["slug"]
    assert body["total_score"] == "50.0500"
    assert body["factor_scores"]["environmental"] == "50.25"
    assert body["configured_weights"]["environmental"] == "0.20"
    assert body["weighted_contributions"]["environmental"] == "10.0500"
    assert body["configuration_version"] == "temporary-test-weights-v1"


@pytest.mark.anyio
async def test_sustainability_endpoint_rejects_missing_factor_data(
    client: AsyncClient,
    admin_user: User,
) -> None:
    payload = deepcopy(EXAMPLE_DESTINATION)
    payload["slug"] = "example-without-factors"
    payload["factor"] = None
    destination = await create_example_destination(client, admin_user, payload)

    response = await client.get(
        f"/api/v1/destinations/{destination['id']}/sustainability",
        headers=await login_headers(client, admin_user.email, "admin-password"),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Sustainability factor data not found"
