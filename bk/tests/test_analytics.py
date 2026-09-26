"""Controlled example records only; pressure values are not tourism research data."""

from copy import deepcopy
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

import pytest
from httpx2 import AsyncClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.engagement import (
    AlternativeSelectionContext,
    InteractionEvent,
    InteractionType,
    RecommendationSearch,
)
from app.models.user import User
from tests.conftest import login_headers
from tests.test_destinations import (
    EXAMPLE_DESTINATION,
    create_example_destination,
    tourist_headers,
)

pytestmark = pytest.mark.anyio

WINDOW = {"start_date": "2026-05-01", "end_date": "2026-05-03"}


def at(day: int) -> datetime:
    return datetime(2026, 5, day, 12, tzinfo=UTC)


async def destinations(client: AsyncClient, admin_user: User) -> list[dict[str, Any]]:
    created = []
    for slug, region in (
        ("analytics-source", "Southern"),
        ("analytics-lower", "Central"),
        ("analytics-other", "Eastern"),
    ):
        payload = deepcopy(EXAMPLE_DESTINATION)
        payload.update(
            {
                "slug": slug,
                "name": slug,
                "region": region,
                "pressure_region": {
                    "Southern": "South Coast",
                    "Central": "Hill Country",
                    "Eastern": "East Coast",
                }[region],
            }
        )
        created.append(await create_example_destination(client, admin_user, payload))
    return created


def search(
    db: Session, user_id: int, destination_id: int, day: int, interests: list[str]
) -> RecommendationSearch:
    item = RecommendationSearch(
        user_id=user_id,
        request_data={"interests": interests},
        result_destination_ids=[destination_id],
        sustainability_config_version="test-v1",
        ranking_version="rules-v1",
        created_at=at(day),
    )
    db.add(item)
    db.flush()
    return item


def event(
    db: Session,
    user_id: int,
    destination_id: int,
    kind: InteractionType,
    day: int,
    search_id: int | None = None,
    source_id: int | None = None,
    source_value: str = "85",
    selected_value: str = "35",
    source_band: str = "HIGH",
) -> InteractionEvent:
    item = InteractionEvent(
        user_id=user_id,
        destination_id=destination_id,
        event_type=kind,
        recommendation_search_id=search_id,
        created_at=at(day),
    )
    if source_id is not None:
        item.alternative_context = AlternativeSelectionContext(
            source_destination_id=source_id,
            pressure_month="2026-06",
            source_pressure_value=Decimal(source_value),
            selected_pressure_value=Decimal(selected_value),
            source_pressure_band=source_band,
            selected_pressure_band="LOW",
            model_version="test-model-v1",
        )
    db.add(item)
    db.flush()
    return item


async def test_analytics_aggregations_and_date_range(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    source, lower, other = await destinations(client, admin_user)
    first = search(db_session, admin_user.id, source["id"], 1, ["nature", "hiking"])
    second = search(db_session, admin_user.id, source["id"], 2, ["nature"])
    search(db_session, admin_user.id, source["id"], 4, ["outside"])
    event(
        db_session, admin_user.id, source["id"], InteractionType.DESTINATION_VIEWED, 1
    )
    event(
        db_session, admin_user.id, source["id"], InteractionType.DESTINATION_VIEWED, 1
    )
    event(db_session, admin_user.id, other["id"], InteractionType.DESTINATION_VIEWED, 2)
    event(db_session, admin_user.id, lower["id"], InteractionType.DESTINATION_SAVED, 2)
    event(
        db_session,
        admin_user.id,
        source["id"],
        InteractionType.RECOMMENDATION_SELECTED,
        1,
        first.id,
    )
    event(
        db_session,
        admin_user.id,
        lower["id"],
        InteractionType.ALTERNATIVE_SELECTED,
        2,
        first.id,
        source["id"],
    )
    # Legacy events count as selections but cannot be attributed to pressure.
    event(
        db_session,
        admin_user.id,
        other["id"],
        InteractionType.ALTERNATIVE_SELECTED,
        2,
        second.id,
    )
    event(db_session, admin_user.id, lower["id"], InteractionType.DESTINATION_SAVED, 4)
    db_session.commit()

    headers = await login_headers(client, admin_user.email, "admin-password")
    response = await client.get(
        "/api/v1/admin/analytics", params=WINDOW, headers=headers
    )
    assert response.status_code == 200, response.text
    data = response.json()
    summary = data["summary"]
    assert summary["total_recommendation_searches"] == 2
    assert summary["destination_views"] == 3
    assert summary["destination_save_events"] == 1
    assert summary["recommendations_accepted"] == 1
    assert summary["alternative_destinations_selected"] == 2
    assert summary["alternative_selections_with_pressure_context"] == 1
    assert summary["users_redirected_from_high_pressure_destinations"] == 1
    assert summary["high_pressure_redirection_events"] == 1
    assert summary["lower_pressure_discovery_events"] == 1
    assert summary["distinct_lower_pressure_destinations_discovered"] == 1
    assert summary["alternative_acceptance_rate"] == 1.0
    assert (
        "not an offer-impression rate" in summary["alternative_acceptance_rate_basis"]
    )
    assert data["most_searched_interests"] == [
        {"interest": "nature", "count": 2},
        {"interest": "hiking", "count": 1},
    ]
    assert [(x["slug"], x["count"]) for x in data["most_viewed_destinations"]] == [
        ("analytics-source", 2),
        ("analytics-other", 1),
    ]
    assert data["most_saved_destinations"][0]["destination_id"] == lower["id"]
    assert data["most_saved_destinations"][0]["count"] == 1
    assert [point["recommendation_searches"] for point in data["daily"]] == [1, 1, 0]
    assert [point["high_pressure_redirections"] for point in data["daily"]] == [0, 1, 0]

    narrower = await client.get(
        "/api/v1/admin/analytics",
        params={"start_date": "2026-05-01", "end_date": "2026-05-01"},
        headers=headers,
    )
    assert narrower.status_code == 200
    assert narrower.json()["summary"]["alternative_destinations_selected"] == 0
    assert narrower.json()["summary"]["alternative_acceptance_rate"] == 0.0


async def test_high_pressure_redirection_requires_lower_target_and_deduplicates_users(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    source, lower, other = await destinations(client, admin_user)
    first = search(db_session, admin_user.id, source["id"], 1, [])
    event(
        db_session,
        admin_user.id,
        lower["id"],
        InteractionType.ALTERNATIVE_SELECTED,
        1,
        first.id,
        source["id"],
    )
    event(
        db_session,
        admin_user.id,
        other["id"],
        InteractionType.ALTERNATIVE_SELECTED,
        2,
        first.id,
        source["id"],
        selected_value="40",
    )
    event(
        db_session,
        admin_user.id,
        other["id"],
        InteractionType.ALTERNATIVE_SELECTED,
        2,
        first.id,
        source["id"],
        source_value="20",
        selected_value="40",
        source_band="LOW",
    )
    db_session.commit()

    response = await client.get(
        "/api/v1/admin/analytics",
        params=WINDOW,
        headers=await login_headers(client, admin_user.email, "admin-password"),
    )
    assert response.status_code == 200
    summary = response.json()["summary"]
    assert summary["high_pressure_redirection_events"] == 2
    assert summary["users_redirected_from_high_pressure_destinations"] == 1
    assert summary["lower_pressure_discovery_events"] == 2
    assert summary["distinct_lower_pressure_destinations_discovered"] == 2
    assert summary["alternative_acceptance_rate"] == 1.0


async def test_empty_analytics_and_admin_authorization(
    client: AsyncClient, admin_user: User
) -> None:
    unauthenticated = await client.get("/api/v1/admin/analytics", params=WINDOW)
    tourist = await client.get(
        "/api/v1/admin/analytics",
        params=WINDOW,
        headers=await tourist_headers(client),
    )
    admin = await client.get(
        "/api/v1/admin/analytics",
        params=WINDOW,
        headers=await login_headers(client, admin_user.email, "admin-password"),
    )
    assert unauthenticated.status_code == 401
    assert tourist.status_code == 403
    assert admin.status_code == 200, admin.text
    data = admin.json()
    assert data["summary"]["total_recommendation_searches"] == 0
    assert data["summary"]["alternative_acceptance_rate"] is None
    assert data["most_searched_interests"] == []
    assert data["most_viewed_destinations"] == []
    assert data["most_saved_destinations"] == []
    assert len(data["daily"]) == 3
    assert all(point["destination_views"] == 0 for point in data["daily"])


async def test_alternative_acceptance_rate_counts_searches_not_repeated_events(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    source, lower, _ = await destinations(client, admin_user)
    first = search(db_session, admin_user.id, source["id"], 1, [])
    search(db_session, admin_user.id, source["id"], 2, [])
    event(
        db_session,
        admin_user.id,
        lower["id"],
        InteractionType.ALTERNATIVE_SELECTED,
        1,
        first.id,
    )
    event(
        db_session,
        admin_user.id,
        lower["id"],
        InteractionType.ALTERNATIVE_SELECTED,
        2,
        first.id,
    )
    db_session.commit()

    response = await client.get(
        "/api/v1/admin/analytics",
        params=WINDOW,
        headers=await login_headers(client, admin_user.email, "admin-password"),
    )
    assert response.status_code == 200
    summary = response.json()["summary"]
    assert summary["total_recommendation_searches"] == 2
    assert summary["alternative_destinations_selected"] == 2
    assert summary["alternative_acceptance_rate"] == 0.5


async def test_invalid_analytics_range_is_rejected(
    client: AsyncClient, admin_user: User
) -> None:
    headers = await login_headers(client, admin_user.email, "admin-password")
    for params in (
        {"start_date": "2026-05-03", "end_date": "2026-05-01"},
        {"start_date": "2025-01-01", "end_date": "2026-05-01"},
        {"start_date": "invalid", "end_date": "2026-05-01"},
    ):
        response = await client.get(
            "/api/v1/admin/analytics", params=params, headers=headers
        )
        assert response.status_code == 422


async def test_alternative_event_snapshots_trusted_pressure_context(
    client: AsyncClient,
    admin_user: User,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    source, lower, _ = await destinations(client, admin_user)
    record = search(db_session, admin_user.id, source["id"], 1, ["nature"])
    db_session.commit()

    from app.core.config import get_settings
    from app.services import engagement

    monkeypatch.setenv("PRESSURE_BAND_THRESHOLDS", '{"low_max": 40, "medium_max": 70}')
    get_settings.cache_clear()
    monkeypatch.setattr(engagement, "load_artifact", lambda _directory: object())

    def fake_forecast(
        _artifact: object, *, region: str, month: str
    ) -> tuple[float, str]:
        assert month == "2026-06"
        return (85.0 if region == "South Coast" else 35.0), "test-model-v1"

    monkeypatch.setattr(
        engagement, "predict_regional_pressure_from_artifact", fake_forecast
    )
    headers = await login_headers(client, admin_user.email, "admin-password")
    response = await client.post(
        "/api/v1/interactions",
        json={
            "destination_id": lower["id"],
            "event_type": "ALTERNATIVE_SELECTED",
            "recommendation_search_id": record.id,
            "source_destination_id": source["id"],
            "pressure_month": "2026-06",
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    snapshot = db_session.scalar(select(AlternativeSelectionContext))
    assert snapshot is not None
    assert snapshot.source_destination_id == source["id"]
    assert snapshot.source_pressure_value == Decimal("85.00000")
    assert snapshot.selected_pressure_value == Decimal("35.00000")
    assert snapshot.source_pressure_band == "HIGH"
    assert snapshot.model_version == "test-model-v1"

    invalid = await client.post(
        "/api/v1/interactions",
        json={
            "destination_id": lower["id"],
            "event_type": "ALTERNATIVE_SELECTED",
            "recommendation_search_id": record.id,
            "source_destination_id": lower["id"],
            "pressure_month": "2026-06",
        },
        headers=headers,
    )
    assert invalid.status_code == 422
    get_settings.cache_clear()
