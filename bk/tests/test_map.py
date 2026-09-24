"""Map markers use synthetic test values, not project research data."""

import json
from collections.abc import Iterator
from copy import deepcopy
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest
from httpx2 import AsyncClient
from sqlalchemy import event
from sqlalchemy.orm import Session

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
def map_settings(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> Iterator[None]:
    monkeypatch.setenv("PRESSURE_MODEL_ARTIFACT_DIR", str(tmp_path / "pressure"))
    monkeypatch.setenv(
        "PRESSURE_BAND_THRESHOLDS", json.dumps({"low_max": 40, "medium_max": 70})
    )
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def map_forecasts(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    calls: list[str] = []
    artifact = SimpleNamespace(metadata={"model_version": "synthetic-map-v1"})
    monkeypatch.setattr(map_data, "load_artifact", lambda _: artifact)

    def predict(_artifact: object, *, region: str, month: str) -> tuple[float, str]:
        calls.append(region)
        if month != "2026-01" or region not in {"Southern", "Central"}:
            raise ForecastContextUnavailableError("No regional forecast context")
        return {"Southern": 55.0, "Central": 85.0}[region], "synthetic-map-v1"

    monkeypatch.setattr(map_data, "predict_regional_pressure_from_artifact", predict)
    return calls


async def create_map_destination(
    client: AsyncClient,
    admin_user: User,
    *,
    slug: str,
    region: str,
    latitude: str = "6.123456",
    longitude: str = "80.123456",
    active: bool = True,
    with_factor: bool = True,
) -> dict[str, Any]:
    payload = deepcopy(EXAMPLE_DESTINATION)
    payload.update(
        slug=slug,
        name=slug.replace("-", " ").title(),
        region=region,
        latitude=latitude,
        longitude=longitude,
        is_active=active,
    )
    if not with_factor:
        payload["factor"] = None
    return await create_example_destination(client, admin_user, payload)


@pytest.mark.anyio
async def test_map_fields_coordinates_and_one_query_for_destinations(
    client: AsyncClient,
    admin_user: User,
    db_session: Session,
    map_settings: None,
    map_forecasts: list[str],
) -> None:
    first = await create_map_destination(
        client, admin_user, slug="southern-first", region="Southern"
    )
    second = await create_map_destination(
        client,
        admin_user,
        slug="southern-second",
        region="Southern",
        latitude="5.987654",
        longitude="81.234567",
    )
    await create_map_destination(
        client, admin_user, slug="inactive-central", region="Central", active=False
    )
    headers = await tourist_headers(client)
    statements: list[str] = []

    def count_sql(
        _connection: object, _cursor: object, statement: str, *_: object
    ) -> None:
        if "FROM destinations" in statement:
            statements.append(statement)

    engine = db_session.get_bind()
    event.listen(engine, "before_cursor_execute", count_sql)
    try:
        response = await client.get(
            "/api/v1/map/destinations?month=2026-01", headers=headers
        )
    finally:
        event.remove(engine, "before_cursor_execute", count_sql)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["month"] == "2026-01"
    assert body["pressure_scope"] == "REGIONAL"
    assert body["pressure_model_version"] == "synthetic-map-v1"
    assert len(statements) == 1
    assert "destination_factors" in statements[0]
    assert map_forecasts == ["Southern"]
    markers = body["destinations"]
    assert [marker["id"] for marker in markers] == [first["id"], second["id"]]
    assert set(markers[0]) == {
        "id",
        "slug",
        "name",
        "region",
        "latitude",
        "longitude",
        "sustainability_score",
        "tourism_pressure_level",
        "tourism_pressure_value",
        "environmental_score",
        "community_score",
    }
    assert markers[0]["latitude"] == pytest.approx(6.123456)
    assert markers[0]["longitude"] == pytest.approx(80.123456)
    assert isinstance(markers[0]["latitude"], float)
    assert markers[1]["latitude"] == pytest.approx(5.987654)
    assert markers[1]["longitude"] == pytest.approx(81.234567)
    assert markers[0]["sustainability_score"] == pytest.approx(50.05)
    assert markers[0]["environmental_score"] == pytest.approx(50.25)
    assert markers[0]["community_score"] == pytest.approx(50)
    assert markers[0]["tourism_pressure_level"] == "MEDIUM"
    assert markers[0]["tourism_pressure_value"] == 55


@pytest.mark.anyio
async def test_map_pressure_and_region_filtering(
    client: AsyncClient,
    admin_user: User,
    map_settings: None,
    map_forecasts: list[str],
) -> None:
    southern = await create_map_destination(
        client, admin_user, slug="southern-place", region="Southern"
    )
    central = await create_map_destination(
        client, admin_user, slug="central-place", region="Central"
    )
    headers = await admin_headers(client, admin_user)
    high = await client.get(
        "/api/v1/map/destinations?month=2026-01&pressure=HIGH", headers=headers
    )
    medium = await client.get(
        "/api/v1/map/destinations?month=2026-01&pressure=MEDIUM", headers=headers
    )
    region = await client.get(
        "/api/v1/map/destinations?month=2026-01&region=southern", headers=headers
    )
    assert [item["id"] for item in high.json()["destinations"]] == [central["id"]]
    assert [item["id"] for item in medium.json()["destinations"]] == [southern["id"]]
    assert [item["id"] for item in region.json()["destinations"]] == [southern["id"]]
    assert high.json()["destinations"][0]["tourism_pressure_level"] == "HIGH"


@pytest.mark.anyio
async def test_map_keeps_active_markers_with_missing_context_or_factor(
    client: AsyncClient,
    admin_user: User,
    map_settings: None,
    map_forecasts: list[str],
) -> None:
    no_factor = await create_map_destination(
        client,
        admin_user,
        slug="southern-no-factor",
        region="Southern",
        with_factor=False,
    )
    no_forecast = await create_map_destination(
        client, admin_user, slug="northern-place", region="Northern"
    )
    headers = await admin_headers(client, admin_user)
    response = await client.get(
        "/api/v1/map/destinations?month=2026-01", headers=headers
    )
    assert response.status_code == 200
    markers = {item["id"]: item for item in response.json()["destinations"]}
    assert markers[no_factor["id"]]["sustainability_score"] is None
    assert markers[no_factor["id"]]["environmental_score"] is None
    assert markers[no_factor["id"]]["community_score"] is None
    assert markers[no_factor["id"]]["tourism_pressure_level"] == "MEDIUM"
    assert markers[no_forecast["id"]]["tourism_pressure_level"] is None
    assert markers[no_forecast["id"]]["tourism_pressure_value"] is None
    high = await client.get(
        "/api/v1/map/destinations?month=2026-01&pressure=HIGH", headers=headers
    )
    assert high.json()["destinations"] == []


@pytest.mark.anyio
async def test_empty_map_does_not_require_model(
    client: AsyncClient,
    admin_user: User,
    map_settings: None,
) -> None:
    headers = await admin_headers(client, admin_user)
    response = await client.get(
        "/api/v1/map/destinations?month=2026-01", headers=headers
    )
    assert response.status_code == 200
    assert response.json() == {
        "month": "2026-01",
        "pressure_scope": "REGIONAL",
        "pressure_model_version": None,
        "destinations": [],
    }


@pytest.mark.anyio
async def test_map_requires_auth_and_valid_filters(
    client: AsyncClient,
    admin_user: User,
    map_settings: None,
    map_forecasts: list[str],
) -> None:
    await create_map_destination(
        client, admin_user, slug="southern-place", region="Southern"
    )
    url = "/api/v1/map/destinations?month=2026-01"
    assert (await client.get(url)).status_code == 401
    headers = await admin_headers(client, admin_user)
    assert (
        await client.get("/api/v1/map/destinations?month=2026-13", headers=headers)
    ).status_code == 422
    assert (
        await client.get("/api/v1/map/destinations?month=0000-01", headers=headers)
    ).status_code == 422
    assert (
        await client.get(
            "/api/v1/map/destinations?month=2026-01&pressure=OTHER", headers=headers
        )
    ).status_code == 422
    assert (
        await client.get("/api/v1/map/destinations", headers=headers)
    ).status_code == 422


@pytest.mark.anyio
async def test_nonempty_map_missing_model_returns_503(
    client: AsyncClient,
    admin_user: User,
    map_settings: None,
) -> None:
    await create_map_destination(
        client, admin_user, slug="southern-place", region="Southern"
    )
    response = await client.get(
        "/api/v1/map/destinations?month=2026-01",
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 503
