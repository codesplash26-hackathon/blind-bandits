"""Dashboard examples use controlled fixtures, not tourism research values."""

import json
from collections.abc import Iterator
from copy import deepcopy
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest
from httpx2 import AsyncClient

from app.core.config import get_settings
from app.ml.pressure.inference import ForecastContextUnavailableError
from app.models.user import User
from app.services import map_data
from tests.test_destinations import (
    EXAMPLE_DESTINATION,
    admin_headers,
    create_example_destination,
    tourist_headers,
)


@pytest.fixture
def dashboard_settings(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> Iterator[None]:
    monkeypatch.setenv("PRESSURE_MODEL_ARTIFACT_DIR", str(tmp_path / "pressure"))
    monkeypatch.setenv(
        "PRESSURE_BAND_THRESHOLDS", json.dumps({"low_max": 40, "medium_max": 70})
    )
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def dashboard_forecasts(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    calls: list[str] = []
    artifact = SimpleNamespace(metadata={"model_version": "synthetic-dashboard-v1"})
    monkeypatch.setattr(map_data, "load_artifact", lambda _: artifact)

    def predict(_artifact: object, *, region: str, month: str) -> tuple[float, str]:
        calls.append(region)
        if month != "2026-01":
            raise ForecastContextUnavailableError("No forecast for this month")
        scores = {"Central": 90.0, "Southern": 60.0, "Western": 20.0}
        if region not in scores:
            raise ForecastContextUnavailableError("No forecast for region")
        return scores[region], "synthetic-dashboard-v1"

    monkeypatch.setattr(map_data, "predict_regional_pressure_from_artifact", predict)
    return calls


async def create_dashboard_destination(
    client: AsyncClient,
    admin_user: User,
    *,
    slug: str,
    region: str,
    active: bool = True,
    environmental_score: int | None = None,
    with_factor: bool = True,
) -> dict[str, Any]:
    payload = deepcopy(EXAMPLE_DESTINATION)
    payload.update(
        slug=slug,
        name=slug.replace("-", " ").title(),
        region=region,
        is_active=active,
    )
    if not with_factor:
        payload["factor"] = None
    elif environmental_score is not None:
        payload["factor"]["environmental_score"] = environmental_score
    return await create_example_destination(client, admin_user, payload)


@pytest.mark.anyio
async def test_dashboard_counts_order_sustainability_and_high_pressure_action(
    client: AsyncClient,
    admin_user: User,
    dashboard_settings: None,
    dashboard_forecasts: list[str],
) -> None:
    high_a = await create_dashboard_destination(
        client, admin_user, slug="central-first", region="Central"
    )
    high_b = await create_dashboard_destination(
        client,
        admin_user,
        slug="central-second",
        region="Central",
        environmental_score=100,
    )
    medium = await create_dashboard_destination(
        client, admin_user, slug="southern-place", region="Southern"
    )
    low = await create_dashboard_destination(
        client, admin_user, slug="western-place", region="Western"
    )
    await create_dashboard_destination(
        client,
        admin_user,
        slug="northern-no-forecast",
        region="Northern",
        with_factor=False,
    )
    await create_dashboard_destination(
        client, admin_user, slug="inactive-central", region="Central", active=False
    )
    response = await client.get(
        "/api/v1/admin/dashboard?month=2026-01",
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["month"] == "2026-01"
    assert body["pressure_scope"] == "REGIONAL"
    assert body["pressure_model_version"] == "synthetic-dashboard-v1"
    assert body["total_active_destinations"] == 5
    assert body["monitored_destinations"] == 4
    assert body["without_pressure_forecast"] == 1
    assert body["pressure_counts"] == {"low": 1, "medium": 1, "high": 2}
    assert [item["id"] for item in body["highest_pressure_destinations"]] == [
        high_a["id"],
        high_b["id"],
        medium["id"],
        low["id"],
    ]
    assert [
        item["predicted_regional_occupancy_rate"]
        for item in body["highest_pressure_destinations"]
    ] == [90, 90, 60, 20]
    assert body["highest_pressure_destinations"][1][
        "sustainability_score"
    ] == pytest.approx(60)
    sustainability = body["sustainability"]
    assert sustainability["scored_destinations"] == 4
    assert sustainability["average_score"] == pytest.approx(52.5375)
    assert sustainability["minimum_score"] == pytest.approx(50.05)
    assert sustainability["maximum_score"] == pytest.approx(60)
    assert sustainability["average_environmental_score"] == pytest.approx(62.6875)
    assert sustainability["average_community_score"] == pytest.approx(50)
    action = body["recommended_action"]
    assert action["code"] == "REVIEW_HIGH_PRESSURE"
    assert action["priority"] == "HIGH"
    assert action["destination_ids"] == [high_a["id"], high_b["id"]]
    assert "2 high-pressure" in action["message"]
    assert dashboard_forecasts == ["Central", "Southern", "Western", "Northern"]


@pytest.mark.anyio
async def test_dashboard_admin_only(
    client: AsyncClient,
    admin_user: User,
    dashboard_settings: None,
    dashboard_forecasts: list[str],
) -> None:
    url = "/api/v1/admin/dashboard?month=2026-01"
    assert (await client.get(url)).status_code == 401
    assert (
        await client.get(url, headers=await tourist_headers(client))
    ).status_code == 403
    assert (
        await client.get(url, headers=await admin_headers(client, admin_user))
    ).status_code == 200


@pytest.mark.anyio
async def test_dashboard_empty_dataset(
    client: AsyncClient,
    admin_user: User,
    dashboard_settings: None,
) -> None:
    response = await client.get(
        "/api/v1/admin/dashboard?month=2026-01",
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["total_active_destinations"] == 0
    assert body["monitored_destinations"] == 0
    assert body["without_pressure_forecast"] == 0
    assert body["pressure_counts"] == {"low": 0, "medium": 0, "high": 0}
    assert body["highest_pressure_destinations"] == []
    assert body["sustainability"]["scored_destinations"] == 0
    assert body["sustainability"]["average_score"] is None
    assert body["pressure_model_version"] is None
    assert body["recommended_action"]["code"] == "NO_FORECAST_DATA"


@pytest.mark.anyio
async def test_dashboard_medium_pressure_action_and_invalid_month(
    client: AsyncClient,
    admin_user: User,
    dashboard_settings: None,
    dashboard_forecasts: list[str],
) -> None:
    await create_dashboard_destination(
        client, admin_user, slug="southern-place", region="Southern"
    )
    headers = await admin_headers(client, admin_user)
    response = await client.get(
        "/api/v1/admin/dashboard?month=2026-01", headers=headers
    )
    assert response.status_code == 200
    assert response.json()["recommended_action"]["code"] == "MONITOR_MEDIUM_PRESSURE"
    assert (
        await client.get("/api/v1/admin/dashboard?month=2026-13", headers=headers)
    ).status_code == 422
    assert (
        await client.get("/api/v1/admin/dashboard?month=0000-01", headers=headers)
    ).status_code == 422


@pytest.mark.anyio
async def test_highest_pressure_table_has_deterministic_five_row_limit(
    client: AsyncClient,
    admin_user: User,
    dashboard_settings: None,
    dashboard_forecasts: list[str],
) -> None:
    created = [
        await create_dashboard_destination(
            client, admin_user, slug=f"central-{index}", region="Central"
        )
        for index in range(6)
    ]
    response = await client.get(
        "/api/v1/admin/dashboard?month=2026-01",
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["monitored_destinations"] == 6
    assert body["pressure_counts"]["high"] == 6
    assert [item["id"] for item in body["highest_pressure_destinations"]] == [
        item["id"] for item in created[:5]
    ]


@pytest.mark.anyio
async def test_nonempty_dashboard_requires_pressure_model(
    client: AsyncClient,
    admin_user: User,
    dashboard_settings: None,
) -> None:
    await create_dashboard_destination(
        client, admin_user, slug="southern-place", region="Southern"
    )
    response = await client.get(
        "/api/v1/admin/dashboard?month=2026-01",
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 503
