"""Synthetic destinations and pressure values are examples, not research data."""

import json
from collections.abc import Iterator
from copy import deepcopy
from decimal import Decimal
from pathlib import Path
from typing import Any

import pandas as pd
import pytest
from httpx2 import AsyncClient

from app.core.config import get_settings
from app.ml.pressure.inference import (
    ForecastContextUnavailableError,
    predict_regional_pressure,
)
from app.ml.pressure.training import train_pressure_model
from app.models.destination import Activity, Destination
from app.models.user import User
from app.services import destination_alternatives
from app.services.destination_similarity import (
    destination_cosine_similarities,
    destination_feature_vectors,
    straight_line_distance_km,
)
from tests.test_destinations import (
    EXAMPLE_DESTINATION,
    admin_headers,
    create_example_destination,
    tourist_headers,
)


def similarity_destination(
    destination_id: int,
    landscape: str,
    activities: list[str],
) -> Destination:
    destination = Destination(
        id=destination_id,
        slug=f"example-{destination_id}",
        name=f"Example {destination_id}",
        district="Example District",
        region="Example Region",
        description="Automated test only",
        latitude=Decimal("6.1"),
        longitude=Decimal("80.1"),
        landscape_type=landscape,
        typical_budget=Decimal(1000),
        recommended_min_trip_duration=1,
        recommended_max_trip_duration=2,
    )
    destination.activities = [Activity(slug=slug, name=slug) for slug in activities]
    return destination


def test_destination_cosine_similarity_ranks_attribute_matches() -> None:
    source = similarity_destination(1, "coastal", ["nature", "hiking"])
    exact = similarity_destination(2, "coastal", ["nature", "hiking"])
    partial = similarity_destination(3, "coastal", ["nature"])
    unrelated = similarity_destination(4, "mountain", ["wildlife"])
    vectors, names = destination_feature_vectors([source, exact, partial, unrelated])
    similarities = destination_cosine_similarities(source, [exact, partial, unrelated])
    assert vectors.shape == (4, len(names))
    assert names == tuple(sorted(names))
    assert similarities[0] == pytest.approx(1.0)
    assert similarities[1] == pytest.approx(2 / (3 * 2) ** 0.5)
    assert similarities[2] == 0
    assert destination_cosine_similarities(source, []) == []
    assert straight_line_distance_km(source, exact) == pytest.approx(0)


@pytest.fixture
def alternative_settings(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> Iterator[None]:
    monkeypatch.setenv("PRESSURE_MODEL_ARTIFACT_DIR", str(tmp_path / "pressure"))
    monkeypatch.setenv("PRESSURE_BAND_THRESHOLDS", '{"low_max": 40, "medium_max": 70}')
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def example_pressure(monkeypatch: pytest.MonkeyPatch) -> None:
    # Fixed values isolate selection/ranking from the independently tested ML model.
    forecasts = {"Central": 90.0, "Southern": 45.0, "Western": 30.0}
    monkeypatch.setattr(destination_alternatives, "load_artifact", lambda _: object())

    def predict(_artifact: object, *, region: str, month: str) -> tuple[float, str]:
        if region not in forecasts or month != "2026-01":
            raise ForecastContextUnavailableError("No forecast context")
        return forecasts[region], "synthetic-test-v1"

    monkeypatch.setattr(
        destination_alternatives, "predict_regional_pressure_from_artifact", predict
    )


async def create_destination(
    client: AsyncClient,
    admin_user: User,
    *,
    slug: str,
    region: str,
    landscape: str = "coastal",
    activities: list[str] | None = None,
    active: bool = True,
    with_factor: bool = True,
) -> dict[str, Any]:
    payload = deepcopy(EXAMPLE_DESTINATION)
    payload.update(
        slug=slug,
        name=slug.replace("-", " ").title(),
        region=region,
        landscape_type=landscape,
        activities=["nature", "hiking"] if activities is None else activities,
        is_active=active,
    )
    if not with_factor:
        payload["factor"] = None
    return await create_example_destination(client, admin_user, payload)


@pytest.mark.anyio
async def test_high_pressure_alternatives_are_similar_active_and_lower_pressure(
    client: AsyncClient,
    admin_user: User,
    alternative_settings: None,
    example_pressure: None,
) -> None:
    source = await create_destination(
        client, admin_user, slug="source-coast", region="Central"
    )
    exact = await create_destination(
        client, admin_user, slug="similar-south", region="Southern"
    )
    partial = await create_destination(
        client,
        admin_user,
        slug="partial-west",
        region="Western",
        activities=["nature"],
    )
    await create_destination(
        client, admin_user, slug="inactive-south", region="Southern", active=False
    )
    await create_destination(client, admin_user, slug="same-region", region="Central")
    await create_destination(
        client, admin_user, slug="unforecasted-north", region="Northern"
    )
    await create_destination(
        client,
        admin_user,
        slug="unrelated-west",
        region="Western",
        landscape="mountain",
        activities=["wildlife"],
    )
    await create_destination(
        client,
        admin_user,
        slug="no-factor-south",
        region="Southern",
        with_factor=False,
    )
    url = f"/api/v1/destinations/{source['id']}/alternatives?month=2026-01"
    headers = await tourist_headers(client)
    first = await client.get(url, headers=headers)
    second = await client.get(url, headers=headers)
    assert first.status_code == 200, first.text
    assert first.json() == second.json()
    body = first.json()
    assert body["status"] == "ALTERNATIVES_FOUND"
    assert body["source_pressure"]["scope"] == "REGIONAL"
    assert body["source_pressure"]["band"] == "HIGH"
    assert body["source_pressure"]["predicted_occupancy_rate"] == 90
    alternatives = body["alternatives"]
    assert [item["destination"]["id"] for item in alternatives] == [
        exact["id"],
        partial["id"],
    ]
    assert all(item["destination"]["id"] != source["id"] for item in alternatives)
    assert alternatives[0]["similarity_score"] == pytest.approx(1)
    assert alternatives[0]["similarity_percentage"] == pytest.approx(100)
    assert alternatives[0]["similarity_score"] > alternatives[1]["similarity_score"]
    assert alternatives[0]["pressure"]["predicted_occupancy_rate"] == 45
    assert alternatives[0]["pressure"]["band"] == "MEDIUM"
    assert alternatives[0]["pressure"]["model_version"] == "synthetic-test-v1"
    assert Decimal(alternatives[0]["sustainability_score"]) > 0
    assert alternatives[0]["sustainability_configuration_version"] == (
        "temporary-test-weights-v1"
    )
    assert alternatives[0]["reason"]["same_landscape"] is True
    assert alternatives[0]["reason"]["shared_activities"] == ["hiking", "nature"]
    assert alternatives[0]["reason"]["pressure_reduction_percentage_points"] == 45
    assert alternatives[0]["reason"]["straight_line_distance_km"] >= 0


@pytest.mark.anyio
async def test_source_not_high_pressure_returns_no_suggestions(
    client: AsyncClient,
    admin_user: User,
    alternative_settings: None,
    example_pressure: None,
) -> None:
    source = await create_destination(
        client, admin_user, slug="source-south", region="Southern"
    )
    await create_destination(
        client, admin_user, slug="candidate-west", region="Western"
    )
    response = await client.get(
        f"/api/v1/destinations/{source['id']}/alternatives?month=2026-01",
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 200
    assert response.json()["status"] == "SOURCE_NOT_HIGH_PRESSURE"
    assert response.json()["alternatives"] == []


@pytest.mark.anyio
async def test_no_lower_pressure_alternatives_returns_empty_list(
    client: AsyncClient,
    admin_user: User,
    alternative_settings: None,
    example_pressure: None,
) -> None:
    source = await create_destination(
        client, admin_user, slug="source-central", region="Central"
    )
    await create_destination(client, admin_user, slug="same-central", region="Central")
    response = await client.get(
        f"/api/v1/destinations/{source['id']}/alternatives?month=2026-01",
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 200
    assert response.json()["status"] == "NO_ELIGIBLE_ALTERNATIVES"
    assert response.json()["alternatives"] == []


@pytest.mark.anyio
async def test_alternatives_authentication_and_invalid_inputs(
    client: AsyncClient,
    admin_user: User,
    alternative_settings: None,
    example_pressure: None,
) -> None:
    source = await create_destination(
        client, admin_user, slug="source-central", region="Central"
    )
    base = f"/api/v1/destinations/{source['id']}/alternatives"
    headers = await admin_headers(client, admin_user)
    assert (await client.get(f"{base}?month=2026-01")).status_code == 401
    assert (
        await client.get(f"{base}?month=2026-13", headers=headers)
    ).status_code == 422
    assert (
        await client.get(f"{base}?month=0000-01", headers=headers)
    ).status_code == 422
    assert (
        await client.get(f"{base}?month=2026-02", headers=headers)
    ).status_code == 404
    assert (
        await client.get(
            "/api/v1/destinations/999999/alternatives?month=2026-01",
            headers=headers,
        )
    ).status_code == 404


@pytest.mark.anyio
async def test_alternatives_missing_model_returns_service_unavailable(
    client: AsyncClient,
    admin_user: User,
    alternative_settings: None,
) -> None:
    source = await create_destination(
        client, admin_user, slug="source-central", region="Central"
    )
    response = await client.get(
        f"/api/v1/destinations/{source['id']}/alternatives?month=2026-01",
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 503


@pytest.mark.anyio
async def test_alternatives_use_trained_regional_artifact(
    client: AsyncClient,
    admin_user: User,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    # Entirely synthetic monthly history, used only to test service integration.
    observations = []
    for region, offset in (("Central", 45), ("Southern", 0)):
        for index, month in enumerate(
            pd.date_range("2023-01-01", periods=36, freq="MS")
        ):
            observations.append(
                {
                    "month": month.strftime("%Y-%m"),
                    "region": region,
                    "occupancy_rate": float(30 + offset + month.month / 3 + index / 10),
                    "tourist_arrivals": 1000 + offset * 20 + index * 5,
                    "is_holiday": int(month.month == 12),
                    "is_peak_season": int(month.month in (1, 12)),
                }
            )
    calendar = pd.DataFrame(
        [
            {"month": "2026-01", "region": region, "is_holiday": 0, "is_peak_season": 1}
            for region in ("Central", "Southern")
        ]
    )
    artifact_dir = tmp_path / "trained-pressure"
    train_pressure_model(
        pd.DataFrame(observations),
        calendar,
        version="synthetic-integration-v1",
        output_dir=artifact_dir,
    )
    central_rate, _ = predict_regional_pressure(
        artifact_dir, region="Central", month="2026-01"
    )
    southern_rate, _ = predict_regional_pressure(
        artifact_dir, region="Southern", month="2026-01"
    )
    assert central_rate > southern_rate
    monkeypatch.setenv("PRESSURE_MODEL_ARTIFACT_DIR", str(artifact_dir))
    monkeypatch.setenv(
        "PRESSURE_BAND_THRESHOLDS",
        json.dumps({"low_max": 10, "medium_max": (central_rate + southern_rate) / 2}),
    )
    get_settings.cache_clear()
    try:
        source = await create_destination(
            client, admin_user, slug="central-fixture", region="Central"
        )
        candidate = await create_destination(
            client, admin_user, slug="southern-fixture", region="Southern"
        )
        response = await client.get(
            f"/api/v1/destinations/{source['id']}/alternatives?month=2026-01",
            headers=await admin_headers(client, admin_user),
        )
        assert response.status_code == 200, response.text
        body = response.json()
        assert body["source_pressure"]["band"] == "HIGH"
        assert [item["destination"]["id"] for item in body["alternatives"]] == [
            candidate["id"]
        ]
        assert body["alternatives"][0]["pressure"]["predicted_occupancy_rate"] == (
            pytest.approx(southern_rate)
        )
        assert body["alternatives"][0]["pressure"]["model_version"] == (
            "synthetic-integration-v1"
        )
    finally:
        get_settings.cache_clear()
