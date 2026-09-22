from typing import Any

import pytest
from httpx2 import AsyncClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.engagement import (
    InteractionEvent,
    InteractionType,
    RecommendationSearch,
    SavedDestination,
)
from app.models.user import User
from tests.conftest import login_headers
from tests.test_destinations import create_example_destination, tourist_headers

pytestmark = pytest.mark.anyio


def recommendation_payload(*, budget: str = "20000.00") -> dict[str, Any]:
    return {
        "budget": budget,
        "trip_duration": 2,
        "interests": ["nature", "hiking"],
        "crowd_preference": "BALANCED",
        "sustainability_preference": "HIGH",
    }


async def create_search(
    client: AsyncClient, headers: dict[str, str], *, budget: str = "20000.00"
) -> None:
    response = await client.post(
        "/api/v1/recommendations",
        json=recommendation_payload(budget=budget),
        headers=headers,
    )
    assert response.status_code == 200, response.text


async def test_recommendation_search_is_stored_with_ranked_ids_and_versions(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    destination = await create_example_destination(client, admin_user)
    await create_search(
        client, await login_headers(client, admin_user.email, "admin-password")
    )

    record = db_session.scalar(select(RecommendationSearch))
    assert record is not None
    assert record.user_id == admin_user.id
    assert record.request_data["interests"] == ["nature", "hiking"]
    assert record.request_data["budget"] == "20000.00"
    assert record.result_destination_ids == [destination["id"]]
    assert record.sustainability_config_version == "temporary-test-weights-v1"
    assert record.ranking_version == "rules-v1"
    assert record.created_at is not None


async def test_empty_recommendation_result_is_stored(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    await create_search(
        client,
        await login_headers(client, admin_user.email, "admin-password"),
        budget="1.00",
    )

    record = db_session.scalar(select(RecommendationSearch))
    assert record is not None
    assert record.result_destination_ids == []


async def test_history_is_scoped_to_current_user(
    client: AsyncClient, admin_user: User
) -> None:
    destination = await create_example_destination(client, admin_user)
    admin_headers = await login_headers(client, admin_user.email, "admin-password")
    tourist = await tourist_headers(client)
    await create_search(client, admin_headers)

    admin_history = await client.get(
        "/api/v1/recommendations/history", headers=admin_headers
    )
    tourist_history = await client.get(
        "/api/v1/recommendations/history", headers=tourist
    )

    assert admin_history.status_code == 200
    assert len(admin_history.json()) == 1
    assert admin_history.json()[0]["result_destination_ids"] == [destination["id"]]
    assert admin_history.json()[0]["request"]["interests"] == ["nature", "hiking"]
    assert tourist_history.status_code == 200
    assert tourist_history.json() == []


async def test_user_cannot_attach_event_to_another_users_history(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    destination = await create_example_destination(client, admin_user)
    await create_search(
        client, await login_headers(client, admin_user.email, "admin-password")
    )
    search = db_session.scalar(select(RecommendationSearch))
    assert search is not None

    response = await client.post(
        "/api/v1/interactions",
        json={
            "destination_id": destination["id"],
            "event_type": "RECOMMENDATION_SELECTED",
            "recommendation_search_id": search.id,
        },
        headers=await tourist_headers(client),
    )

    assert response.status_code == 404
    assert db_session.scalars(select(InteractionEvent)).all() == []


async def test_save_and_list_destinations_are_user_scoped(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    destination = await create_example_destination(client, admin_user)
    admin_headers = await login_headers(client, admin_user.email, "admin-password")
    saved = await client.post(
        f"/api/v1/saved/{destination['id']}", headers=admin_headers
    )
    admin_list = await client.get("/api/v1/saved", headers=admin_headers)
    tourist_list = await client.get(
        "/api/v1/saved", headers=await tourist_headers(client)
    )

    assert saved.status_code == 201
    assert saved.json()["destination"]["id"] == destination["id"]
    assert saved.json()["saved_at"]
    assert [item["destination"]["id"] for item in admin_list.json()] == [
        destination["id"]
    ]
    assert tourist_list.json() == []
    records = db_session.scalars(select(SavedDestination)).all()
    assert len(records) == 1
    assert records[0].user_id == admin_user.id


async def test_duplicate_save_is_rejected_without_duplicate_event(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    destination = await create_example_destination(client, admin_user)
    headers = await login_headers(client, admin_user.email, "admin-password")
    first = await client.post(f"/api/v1/saved/{destination['id']}", headers=headers)
    second = await client.post(f"/api/v1/saved/{destination['id']}", headers=headers)

    assert first.status_code == 201
    assert second.status_code == 409
    assert len(db_session.scalars(select(SavedDestination)).all()) == 1
    events = db_session.scalars(select(InteractionEvent)).all()
    assert len(events) == 1
    assert events[0].event_type == InteractionType.DESTINATION_SAVED


async def test_remove_saved_destination_respects_ownership(
    client: AsyncClient, admin_user: User
) -> None:
    destination = await create_example_destination(client, admin_user)
    admin_headers = await login_headers(client, admin_user.email, "admin-password")
    tourist = await tourist_headers(client)
    await client.post(f"/api/v1/saved/{destination['id']}", headers=admin_headers)

    foreign_delete = await client.delete(
        f"/api/v1/saved/{destination['id']}", headers=tourist
    )
    own_delete = await client.delete(
        f"/api/v1/saved/{destination['id']}", headers=admin_headers
    )
    remaining = await client.get("/api/v1/saved", headers=admin_headers)

    assert foreign_delete.status_code == 404
    assert own_delete.status_code == 204
    assert remaining.json() == []


async def test_users_can_save_the_same_destination_independently(
    client: AsyncClient, admin_user: User
) -> None:
    destination = await create_example_destination(client, admin_user)
    admin_headers = await login_headers(client, admin_user.email, "admin-password")
    tourist = await tourist_headers(client)

    admin_save = await client.post(
        f"/api/v1/saved/{destination['id']}", headers=admin_headers
    )
    tourist_save = await client.post(
        f"/api/v1/saved/{destination['id']}", headers=tourist
    )
    admin_remove = await client.delete(
        f"/api/v1/saved/{destination['id']}", headers=admin_headers
    )
    tourist_list = await client.get("/api/v1/saved", headers=tourist)

    assert admin_save.status_code == 201
    assert tourist_save.status_code == 201
    assert admin_remove.status_code == 204
    assert [item["destination"]["id"] for item in tourist_list.json()] == [
        destination["id"]
    ]


async def test_view_and_selection_events_are_logged(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    destination = await create_example_destination(client, admin_user)
    headers = await login_headers(client, admin_user.email, "admin-password")
    await create_search(client, headers)
    search = db_session.scalar(select(RecommendationSearch))
    assert search is not None

    viewed = await client.post(
        "/api/v1/interactions",
        json={"destination_id": destination["id"], "event_type": "DESTINATION_VIEWED"},
        headers=headers,
    )
    selected = await client.post(
        "/api/v1/interactions",
        json={
            "destination_id": destination["id"],
            "event_type": "RECOMMENDATION_SELECTED",
            "recommendation_search_id": search.id,
        },
        headers=headers,
    )

    assert viewed.status_code == 201
    assert selected.status_code == 201
    assert selected.json()["recommendation_search_id"] == search.id
    assert [
        event.event_type for event in db_session.scalars(select(InteractionEvent))
    ] == [
        InteractionType.DESTINATION_VIEWED,
        InteractionType.RECOMMENDATION_SELECTED,
    ]


async def test_alternative_selection_and_invalid_recommendation_selection(
    client: AsyncClient, admin_user: User, db_session: Session
) -> None:
    recommended = await create_example_destination(client, admin_user)
    alternative_data = {
        "slug": "example-alternative",
        "name": "Example Alternative",
        "district": "Example District",
        "region": "Southern",
        "description": "An example destination used by tests.",
        "latitude": "6.123456",
        "longitude": "80.123456",
        "landscape_type": "coastal",
        "typical_budget": "50000.00",
        "recommended_min_trip_duration": 1,
        "recommended_max_trip_duration": 3,
        "activities": ["nature"],
    }
    alternative = await create_example_destination(client, admin_user, alternative_data)
    headers = await login_headers(client, admin_user.email, "admin-password")
    await create_search(client, headers)
    search = db_session.scalar(select(RecommendationSearch))
    assert search is not None
    assert search.result_destination_ids == [recommended["id"]]

    wrong_selection = await client.post(
        "/api/v1/interactions",
        json={
            "destination_id": alternative["id"],
            "event_type": "RECOMMENDATION_SELECTED",
            "recommendation_search_id": search.id,
        },
        headers=headers,
    )
    alternative_selection = await client.post(
        "/api/v1/interactions",
        json={
            "destination_id": alternative["id"],
            "event_type": "ALTERNATIVE_SELECTED",
            "recommendation_search_id": search.id,
        },
        headers=headers,
    )

    assert wrong_selection.status_code == 422
    assert alternative_selection.status_code == 201
    assert alternative_selection.json()["event_type"] == "ALTERNATIVE_SELECTED"


@pytest.mark.parametrize(
    ("method", "path", "body"),
    [
        ("GET", "/api/v1/recommendations/history", None),
        ("GET", "/api/v1/saved", None),
        ("POST", "/api/v1/saved/1", None),
        ("DELETE", "/api/v1/saved/1", None),
        (
            "POST",
            "/api/v1/interactions",
            {"destination_id": 1, "event_type": "DESTINATION_VIEWED"},
        ),
    ],
)
async def test_personal_endpoints_require_authentication(
    client: AsyncClient, method: str, path: str, body: dict[str, Any] | None
) -> None:
    response = await client.request(method, path, json=body)

    assert response.status_code == 401
