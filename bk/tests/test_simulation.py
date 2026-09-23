"""All scenario policy values here are illustrative automated-test fixtures."""

import json
from collections.abc import Iterator
from decimal import Decimal

import pytest
from httpx2 import AsyncClient
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.destination import Destination
from app.models.user import User
from app.schemas.simulation import SimulationScenario
from app.services.sustainability import SustainabilityFactorScores
from app.services.what_if import SimulationPolicy, apply_scenario
from tests.test_destinations import (
    EXAMPLE_DESTINATION,
    admin_headers,
    create_example_destination,
)

BASELINE_SCENARIO = {
    "expected_visitor_level": 50,
    "waste_management_level": 50,
    "infrastructure_level": 50,
}


@pytest.fixture
def simulation_settings(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    monkeypatch.setenv(
        "SIMULATION_POLICY",
        json.dumps(
            {
                "version": "illustrative-test-policy-v1",
                "waste_reference_level": 50,
                "environmental_points_per_waste_level": 1,
            }
        ),
    )
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_factor_transformations_are_bounded_and_leave_unaffected_factors() -> None:
    current = SustainabilityFactorScores(
        environmental=95,
        community=40,
        crowd=60,
        infrastructure=30,
        suitability=70,
    )
    scenario = SimulationScenario(
        expected_visitor_level=80,
        waste_management_level=100,
        infrastructure_level=90,
    )
    policy = SimulationPolicy(
        version="illustrative-test-policy-v1",
        waste_reference_level=50,
        environmental_points_per_waste_level=1,
    )
    simulated = apply_scenario(current, scenario, policy)
    assert simulated.environmental == 100
    assert simulated.crowd == 20
    assert simulated.infrastructure == 90
    assert simulated.community == current.community
    assert simulated.suitability == current.suitability
    assert current.environmental == 95
    with pytest.raises(ValueError):
        SimulationPolicy(
            version="bad",
            waste_reference_level=50,
            environmental_points_per_waste_level=-1,
        )


@pytest.mark.anyio
async def test_baseline_scenario_keeps_score_and_factors_unchanged(
    client: AsyncClient,
    admin_user: User,
    simulation_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    response = await client.post(
        f"/api/v1/destinations/{destination['id']}/simulate",
        json=BASELINE_SCENARIO,
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["destination_id"] == destination["id"]
    assert {
        field: Decimal(value) for field, value in body["baseline_scenario"].items()
    } == {field: Decimal(value) for field, value in BASELINE_SCENARIO.items()}
    assert Decimal(body["original_score"]) == Decimal("50.05")
    assert body["simulated_score"] == body["original_score"]
    assert Decimal(body["score_delta"]) == 0
    assert body["changed_factors"] == {}
    assert body["original_factors"] == body["simulated_factors"]
    assert body["simulation_policy_version"] == "illustrative-test-policy-v1"
    assert body["sustainability_configuration_version"] == "temporary-test-weights-v1"
    assert "temporary calculation" in body["explanation"]


@pytest.mark.anyio
async def test_higher_visitor_level_lowers_crowd_and_score(
    client: AsyncClient,
    admin_user: User,
    simulation_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    scenario = {**BASELINE_SCENARIO, "expected_visitor_level": 80}
    response = await client.post(
        f"/api/v1/destinations/{destination['id']}/simulate",
        json=scenario,
        headers=await admin_headers(client, admin_user),
    )
    body = response.json()
    assert response.status_code == 200
    assert Decimal(body["simulated_factors"]["crowd"]) == 20
    assert Decimal(body["score_delta"]) == Decimal("-6.00")
    assert set(body["changed_factors"]) == {"crowd"}
    assert Decimal(body["changed_factors"]["crowd"]["delta"]) == -30


@pytest.mark.anyio
async def test_waste_management_changes_environmental_score(
    client: AsyncClient,
    admin_user: User,
    simulation_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    response = await client.post(
        f"/api/v1/destinations/{destination['id']}/simulate",
        json={**BASELINE_SCENARIO, "waste_management_level": 70},
        headers=await admin_headers(client, admin_user),
    )
    body = response.json()
    assert response.status_code == 200
    assert Decimal(body["simulated_factors"]["environmental"]) == Decimal("70.25")
    assert Decimal(body["score_delta"]) == Decimal("4.00")
    assert set(body["changed_factors"]) == {"environmental"}


@pytest.mark.anyio
async def test_infrastructure_level_changes_infrastructure_score(
    client: AsyncClient,
    admin_user: User,
    simulation_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    response = await client.post(
        f"/api/v1/destinations/{destination['id']}/simulate",
        json={**BASELINE_SCENARIO, "infrastructure_level": 80},
        headers=await admin_headers(client, admin_user),
    )
    body = response.json()
    assert response.status_code == 200
    assert Decimal(body["simulated_factors"]["infrastructure"]) == 80
    assert Decimal(body["score_delta"]) == Decimal("6.00")
    assert set(body["changed_factors"]) == {"infrastructure"}


@pytest.mark.anyio
async def test_simulation_is_deterministic_and_does_not_write_to_database(
    client: AsyncClient,
    admin_user: User,
    db_session: Session,
    simulation_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    stored = db_session.get(Destination, destination["id"])
    assert stored is not None and stored.factor is not None
    original_factor_values = (
        stored.factor.environmental_score,
        stored.factor.crowd_score,
        stored.factor.infrastructure_score,
        stored.updated_at,
    )
    scenario = {
        "expected_visitor_level": 90,
        "waste_management_level": 70,
        "infrastructure_level": 80,
    }
    url = f"/api/v1/destinations/{destination['id']}/simulate"
    headers = await admin_headers(client, admin_user)
    first = await client.post(url, json=scenario, headers=headers)
    second = await client.post(url, json=scenario, headers=headers)
    assert first.status_code == 200
    assert first.json() == second.json()
    db_session.refresh(stored)
    db_session.refresh(stored.factor)
    assert (
        stored.factor.environmental_score,
        stored.factor.crowd_score,
        stored.factor.infrastructure_score,
        stored.updated_at,
    ) == original_factor_values


@pytest.mark.anyio
async def test_invalid_scenario_values_are_rejected(
    client: AsyncClient,
    admin_user: User,
    simulation_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    url = f"/api/v1/destinations/{destination['id']}/simulate"
    headers = await admin_headers(client, admin_user)
    for field, value in (
        ("expected_visitor_level", -1),
        ("expected_visitor_level", 101),
        ("waste_management_level", -1),
        ("waste_management_level", 101),
        ("infrastructure_level", -1),
        ("infrastructure_level", 101),
    ):
        response = await client.post(
            url,
            json={**BASELINE_SCENARIO, field: value},
            headers=headers,
        )
        assert response.status_code == 422
    assert (
        await client.post(
            url, json={**BASELINE_SCENARIO, "unknown": 1}, headers=headers
        )
    ).status_code == 422


@pytest.mark.anyio
async def test_simulation_requires_auth_and_existing_factor_data(
    client: AsyncClient,
    admin_user: User,
    simulation_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    url = f"/api/v1/destinations/{destination['id']}/simulate"
    assert (await client.post(url, json=BASELINE_SCENARIO)).status_code == 401
    headers = await admin_headers(client, admin_user)
    assert (
        await client.post(
            "/api/v1/destinations/999999/simulate",
            json=BASELINE_SCENARIO,
            headers=headers,
        )
    ).status_code == 404
    without_factor = dict(EXAMPLE_DESTINATION)
    without_factor.update(slug="example-without-factor", factor=None)
    missing_factor_destination = await create_example_destination(
        client, admin_user, without_factor
    )
    assert (
        await client.post(
            f"/api/v1/destinations/{missing_factor_destination['id']}/simulate",
            json=BASELINE_SCENARIO,
            headers=headers,
        )
    ).status_code == 404


@pytest.mark.anyio
async def test_missing_simulation_policy_returns_service_unavailable(
    client: AsyncClient,
    admin_user: User,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("SIMULATION_POLICY", raising=False)
    get_settings.cache_clear()
    try:
        destination = await create_example_destination(client, admin_user)
        response = await client.post(
            f"/api/v1/destinations/{destination['id']}/simulate",
            json=BASELINE_SCENARIO,
            headers=await admin_headers(client, admin_user),
        )
        assert response.status_code == 503
    finally:
        get_settings.cache_clear()
