"""All environmental provider responses here are controlled example fixtures."""

from collections.abc import AsyncGenerator
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx
import pytest
from httpx2 import AsyncClient, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.routes import environment
from app.core.config import get_settings
from app.main import app
from app.models.environment import EnvironmentalObservation, ObservationType
from app.models.user import User
from app.services.environment import observation_response
from tests.conftest import login_headers
from tests.test_destinations import create_example_destination, tourist_headers

pytestmark = pytest.mark.anyio


def mock_http(handler: httpx.MockTransport) -> None:
    async def override() -> AsyncGenerator[httpx.AsyncClient]:
        async with httpx.AsyncClient(transport=handler) as provider_client:
            yield provider_client

    app.dependency_overrides[environment.get_environment_http_client] = override


def weather_payload(when: str = "2026-09-24T10:00") -> dict[str, Any]:
    return {
        "current": {
            "time": when,
            "temperature_2m": 29.5,
            "relative_humidity_2m": 72,
            "precipitation": 0.2,
            "weather_code": 3,
        },
        "current_units": {
            "temperature_2m": "°C",
            "relative_humidity_2m": "%",
            "precipitation": "mm",
        },
    }


async def refresh(
    client: AsyncClient, destination_id: int, headers: dict[str, str], kind: str
) -> Response:
    return await client.post(
        f"/api/v1/admin/destinations/{destination_id}/environment/refresh",
        params={"type": kind},
        headers=headers,
    )


async def test_weather_success_persistence_and_history(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    destination = await create_example_destination(client, admin_user)
    requested: list[str] = []
    current_time = "2026-09-24T10:00"

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/v1/forecast"
        assert request.url.params["timezone"] == "GMT"
        assert request.url.params["current"] == (
            "temperature_2m,relative_humidity_2m,precipitation,weather_code"
        )
        requested.append(str(request.url))
        return httpx.Response(200, json=weather_payload(current_time))

    mock_http(httpx.MockTransport(handler))
    headers = await login_headers(client, admin_user.email, "admin-password")
    first = await refresh(client, destination["id"], headers, "WEATHER")
    assert first.status_code == 200, first.text
    first_data = first.json()
    assert first_data["status"] == "UPDATED"
    assert first_data["observation"]["values"]["temperature_c"] == 29.5
    assert first_data["observation"]["source"] == "Open-Meteo"
    assert first_data["observation"]["source_location"].count(",") == 1
    assert first_data["observation"]["observed_at"].endswith("Z")
    assert len(requested) == 1

    same = await refresh(client, destination["id"], headers, "WEATHER")
    assert same.status_code == 200
    assert same.json()["status"] == "UNCHANGED"
    assert db_session.scalar(select(func.count(EnvironmentalObservation.id))) == 1

    current_time = "2026-09-24T10:15"
    newer = await refresh(client, destination["id"], headers, "WEATHER")
    assert newer.status_code == 200
    assert newer.json()["status"] == "UPDATED"
    assert db_session.scalar(select(func.count(EnvironmentalObservation.id))) == 2
    read = await client.get(
        f"/api/v1/destinations/{destination['id']}/environment", headers=headers
    )
    assert read.status_code == 200
    assert read.json()["weather"]["id"] == newer.json()["observation"]["id"]
    assert read.json()["air_quality"] is None


async def test_openaq_success_uses_nearest_station_and_preserves_units(
    client: AsyncClient,
    admin_user: User,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    destination = await create_example_destination(client, admin_user)
    monkeypatch.setenv("OPENAQ_API_KEY", "test-only-openaq-key")
    get_settings.cache_clear()

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["X-API-Key"] == "test-only-openaq-key"
        if request.url.path == "/v3/locations":
            assert request.url.params["parameters_id"] == "2"
            assert request.url.params["radius"] == "25000"
            return httpx.Response(
                200,
                json={
                    "results": [
                        {
                            "id": 99,
                            "name": "Further test station",
                            "coordinates": {"latitude": 6.2, "longitude": 80.2},
                            "sensors": [
                                {
                                    "id": 991,
                                    "parameter": {"name": "pm25", "units": "µg/m³"},
                                }
                            ],
                        },
                        {
                            "id": 42,
                            "name": "Nearby test station",
                            "coordinates": {"latitude": 6.124, "longitude": 80.124},
                            "sensors": [
                                {
                                    "id": 421,
                                    "parameter": {"name": "pm25", "units": "µg/m³"},
                                }
                            ],
                        },
                    ]
                },
            )
        assert request.url.path == "/v3/locations/42/latest"
        return httpx.Response(
            200,
            json={
                "results": [
                    {
                        "datetime": {"utc": "2026-09-24T09:00:00Z"},
                        "value": 11.4,
                        "sensorsId": 421,
                        "locationsId": 42,
                    }
                ]
            },
        )

    mock_http(httpx.MockTransport(handler))
    response = await refresh(
        client,
        destination["id"],
        await login_headers(client, admin_user.email, "admin-password"),
        "AIR_QUALITY",
    )
    assert response.status_code == 200, response.text
    data = response.json()["observation"]
    assert data["source"] == "OpenAQ"
    assert data["source_location"] == "42"
    assert data["values"]["pm25"] == 11.4
    assert data["values"]["unit"] == "µg/m³"
    assert data["values"]["station_name"] == "Nearby test station"
    assert data["values"]["station_distance_m"] > 0
    stored = db_session.scalar(select(EnvironmentalObservation))
    assert stored is not None
    assert stored.observation_type == ObservationType.AIR_QUALITY
    get_settings.cache_clear()


async def test_optional_open_meteo_key_uses_environment_configuration(
    client: AsyncClient, admin_user: User, monkeypatch: pytest.MonkeyPatch
) -> None:
    destination = await create_example_destination(client, admin_user)
    monkeypatch.setenv("OPEN_METEO_API_KEY", "test-only-commercial-key")
    get_settings.cache_clear()

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["apikey"] == "test-only-commercial-key"
        return httpx.Response(200, json=weather_payload())

    mock_http(httpx.MockTransport(handler))
    response = await refresh(
        client,
        destination["id"],
        await login_headers(client, admin_user.email, "admin-password"),
        "WEATHER",
    )
    assert response.status_code == 200
    get_settings.cache_clear()


async def test_provider_failure_falls_back_to_stored_observation(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    destination = await create_example_destination(client, admin_user)
    stored = EnvironmentalObservation(
        destination_id=destination["id"],
        observation_type=ObservationType.WEATHER,
        values={"temperature_c": 25.0},
        source="Open-Meteo",
        source_location="6.123456,80.123456",
        observed_at=datetime(2026, 1, 1, tzinfo=UTC),
        fetched_at=datetime(2026, 1, 1, tzinfo=UTC),
    )
    db_session.add(stored)
    db_session.commit()

    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(503, json={"error": "temporary outage"})

    mock_http(httpx.MockTransport(handler))
    response = await refresh(
        client,
        destination["id"],
        await login_headers(client, admin_user.email, "admin-password"),
        "WEATHER",
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "FALLBACK"
    assert data["fallback_reason"] == "provider_unavailable"
    assert data["observation"]["id"] == stored.id
    assert data["observation"]["is_stale"] is True
    assert data["observation"]["age_minutes"] > 0
    assert db_session.scalar(select(func.count(EnvironmentalObservation.id))) == 1


async def test_missing_provider_data_without_fallback_returns_503(
    client: AsyncClient, admin_user: User
) -> None:
    destination = await create_example_destination(client, admin_user)
    mock_http(httpx.MockTransport(lambda _request: httpx.Response(503)))
    response = await refresh(
        client,
        destination["id"],
        await login_headers(client, admin_user.email, "admin-password"),
        "WEATHER",
    )
    assert response.status_code == 503


async def test_malformed_response_is_not_persisted_and_uses_fallback(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    destination = await create_example_destination(client, admin_user)
    stored = EnvironmentalObservation(
        destination_id=destination["id"],
        observation_type=ObservationType.WEATHER,
        values={"temperature_c": 24.0},
        source="Open-Meteo",
        source_location="6.123456,80.123456",
        observed_at=datetime(2026, 2, 1, tzinfo=UTC),
        fetched_at=datetime(2026, 2, 1, tzinfo=UTC),
    )
    db_session.add(stored)
    db_session.commit()
    malformed = weather_payload()
    malformed["current"]["relative_humidity_2m"] = 150
    mock_http(httpx.MockTransport(lambda _request: httpx.Response(200, json=malformed)))
    response = await refresh(
        client,
        destination["id"],
        await login_headers(client, admin_user.email, "admin-password"),
        "WEATHER",
    )
    assert response.status_code == 200
    assert response.json()["status"] == "FALLBACK"
    assert response.json()["fallback_reason"] == "malformed_provider_response"
    assert db_session.scalar(select(func.count(EnvironmentalObservation.id))) == 1


async def test_freshness_uses_observation_time_not_fetch_time(
    db_session: Session, admin_user: User
) -> None:
    _ = admin_user
    now = datetime(2026, 9, 24, 12, tzinfo=UTC)
    observation = EnvironmentalObservation(
        id=17,
        destination_id=2,
        observation_type=ObservationType.AIR_QUALITY,
        values={"pm25": 12.0, "unit": "µg/m³"},
        source="OpenAQ",
        source_location="42",
        observed_at=now - timedelta(hours=4),
        fetched_at=now - timedelta(minutes=1),
    )
    data = observation_response(observation, now=now, stale_after_minutes=180)
    assert data.age_minutes == 240.0
    assert data.is_stale is True
    assert data.fetched_at == now - timedelta(minutes=1)


async def test_read_and_refresh_authorization_and_empty_dataset(
    client: AsyncClient, admin_user: User
) -> None:
    destination = await create_example_destination(client, admin_user)
    path = f"/api/v1/destinations/{destination['id']}/environment"
    assert (await client.get(path)).status_code == 401
    tourist = await tourist_headers(client)
    read = await client.get(path, headers=tourist)
    assert read.status_code == 200
    assert read.json()["weather"] is None
    assert read.json()["air_quality"] is None
    assert (
        await refresh(client, destination["id"], tourist, "WEATHER")
    ).status_code == 403
    assert (await refresh(client, destination["id"], {}, "WEATHER")).status_code == 401
    assert (
        await client.get("/api/v1/destinations/9999/environment", headers=tourist)
    ).status_code == 404


async def test_openaq_missing_key_or_station_does_not_invent_air_quality(
    client: AsyncClient,
    admin_user: User,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    destination = await create_example_destination(client, admin_user)
    monkeypatch.delenv("OPENAQ_API_KEY", raising=False)
    get_settings.cache_clear()
    called = False

    def handler(_request: httpx.Request) -> httpx.Response:
        nonlocal called
        called = True
        return httpx.Response(200, json={"results": []})

    mock_http(httpx.MockTransport(handler))
    headers = await login_headers(client, admin_user.email, "admin-password")
    missing_key = await refresh(client, destination["id"], headers, "AIR_QUALITY")
    assert missing_key.status_code == 503
    assert called is False

    monkeypatch.setenv("OPENAQ_API_KEY", "test-only-openaq-key")
    get_settings.cache_clear()
    no_station = await refresh(client, destination["id"], headers, "AIR_QUALITY")
    assert no_station.status_code == 503
    assert called is True
    assert db_session.scalar(select(func.count(EnvironmentalObservation.id))) == 0
    get_settings.cache_clear()


async def test_openaq_no_nearby_station_falls_back_to_stored_measurement(
    client: AsyncClient,
    admin_user: User,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    destination = await create_example_destination(client, admin_user)
    old = EnvironmentalObservation(
        destination_id=destination["id"],
        observation_type=ObservationType.AIR_QUALITY,
        values={"pm25": 18.0, "unit": "µg/m³", "station_name": "Old test station"},
        source="OpenAQ",
        source_location="42",
        observed_at=datetime(2026, 1, 1, tzinfo=UTC),
        fetched_at=datetime(2026, 1, 1, tzinfo=UTC),
    )
    db_session.add(old)
    db_session.commit()
    monkeypatch.setenv("OPENAQ_API_KEY", "test-only-openaq-key")
    get_settings.cache_clear()
    mock_http(
        httpx.MockTransport(lambda _request: httpx.Response(200, json={"results": []}))
    )
    response = await refresh(
        client,
        destination["id"],
        await login_headers(client, admin_user.email, "admin-password"),
        "AIR_QUALITY",
    )
    assert response.status_code == 200
    assert response.json()["status"] == "FALLBACK"
    assert response.json()["fallback_reason"] == "no_provider_data"
    assert response.json()["observation"]["id"] == old.id
    get_settings.cache_clear()
