from copy import deepcopy
from typing import Any

import pytest
from httpx2 import AsyncClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.destination import Destination
from app.models.user import User
from tests.conftest import login_headers

pytestmark = pytest.mark.anyio

# These values exist only to exercise validation and are not research data.
EXAMPLE_DESTINATION: dict[str, Any] = {
    "slug": "example-coastal-trail",
    "name": "Example Coastal Trail",
    "district": "Example District",
    "region": "Southern",
    "description": "Example destination used only by automated tests.",
    "image_url": "https://images.example.com/coastal-trail.jpg",
    "latitude": "6.123456",
    "longitude": "80.123456",
    "landscape_type": "coastal",
    "typical_budget": "12500.00",
    "recommended_min_trip_duration": 1,
    "recommended_max_trip_duration": 3,
    "is_active": True,
    "activities": ["nature", "hiking"],
    "factor": {
        "environmental_score": "50.25",
        "community_benefit_score": 50,
        "crowd_score": 50,
        "infrastructure_score": 50,
        "tourist_suitability_score": 50,
        "data_source": "Automated test fixture; not research data",
        "confidence_level": "LOW",
        "value_type": "PROXY",
        "last_updated": "2026-01-01T00:00:00Z",
    },
}


async def admin_headers(client: AsyncClient, admin_user: User) -> dict[str, str]:
    return await login_headers(client, admin_user.email, "admin-password")


async def tourist_headers(client: AsyncClient) -> dict[str, str]:
    registration = {
        "name": "Destination Tourist",
        "email": "destination-tourist@example.com",
        "password": "tourist-password",
    }
    response = await client.post("/api/v1/auth/register", json=registration)
    assert response.status_code == 201
    return await login_headers(client, registration["email"], registration["password"])


async def create_example_destination(
    client: AsyncClient,
    admin_user: User,
    payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    response = await client.post(
        "/api/v1/admin/destinations",
        json=payload or EXAMPLE_DESTINATION,
        headers=await admin_headers(client, admin_user),
    )
    assert response.status_code == 201, response.text
    return response.json()


async def test_destination_creation_by_admin(
    client: AsyncClient,
    admin_user: User,
    db_session: Session,
) -> None:
    response_data = await create_example_destination(client, admin_user)

    assert response_data["slug"] == EXAMPLE_DESTINATION["slug"]
    assert response_data["activities"] == ["nature", "hiking"]
    assert response_data["image_url"] == EXAMPLE_DESTINATION["image_url"]
    assert response_data["factor"]["value_type"] == "PROXY"
    stored = db_session.scalar(select(Destination))
    assert stored is not None
    assert stored.factor is not None
    assert str(stored.factor.environmental_score) == "50.25"


async def test_destination_creation_is_rejected_for_tourist(
    client: AsyncClient,
) -> None:
    response = await client.post(
        "/api/v1/admin/destinations",
        json=EXAMPLE_DESTINATION,
        headers=await tourist_headers(client),
    )

    assert response.status_code == 403


async def test_destination_listing_requires_authentication(
    client: AsyncClient,
) -> None:
    response = await client.get("/api/v1/destinations")

    assert response.status_code == 401


async def test_destination_listing(
    client: AsyncClient,
    admin_user: User,
) -> None:
    await create_example_destination(client, admin_user)

    response = await client.get(
        "/api/v1/destinations",
        headers=await admin_headers(client, admin_user),
    )

    assert response.status_code == 200
    assert [item["slug"] for item in response.json()] == [EXAMPLE_DESTINATION["slug"]]
    assert float(response.json()[0]["sustainability"]["total_score"]) == 50.05


async def test_destination_retrieval_by_id_and_slug(
    client: AsyncClient,
    admin_user: User,
) -> None:
    created = await create_example_destination(client, admin_user)
    headers = await admin_headers(client, admin_user)

    by_id = await client.get(
        f"/api/v1/destinations/{created['id']}",
        headers=headers,
    )
    by_slug = await client.get(
        f"/api/v1/destinations/{created['slug']}",
        headers=headers,
    )

    assert by_id.status_code == 200
    assert by_slug.status_code == 200
    assert by_id.json()["id"] == by_slug.json()["id"]


async def test_destination_filtering(
    client: AsyncClient,
    admin_user: User,
) -> None:
    await create_example_destination(client, admin_user)
    second = deepcopy(EXAMPLE_DESTINATION)
    second.update(
        {
            "slug": "example-hill-retreat",
            "name": "Example Hill Retreat",
            "district": "Second District",
            "region": "Central",
            "landscape_type": "mountain",
            "activities": ["nature", "relaxation"],
        }
    )
    await create_example_destination(client, admin_user, second)
    headers = await admin_headers(client, admin_user)

    region = await client.get(
        "/api/v1/destinations?region=central",
        headers=headers,
    )
    landscape = await client.get(
        "/api/v1/destinations?landscape=coastal",
        headers=headers,
    )
    activity = await client.get(
        "/api/v1/destinations?activity=relaxation",
        headers=headers,
    )

    assert [item["slug"] for item in region.json()] == ["example-hill-retreat"]
    assert [item["slug"] for item in landscape.json()] == ["example-coastal-trail"]
    assert [item["slug"] for item in activity.json()] == ["example-hill-retreat"]


async def test_invalid_factor_score_is_rejected(
    client: AsyncClient,
    admin_user: User,
) -> None:
    payload = deepcopy(EXAMPLE_DESTINATION)
    payload["factor"]["environmental_score"] = 101

    response = await client.post(
        "/api/v1/admin/destinations",
        json=payload,
        headers=await admin_headers(client, admin_user),
    )

    assert response.status_code == 422


async def test_duplicate_slug_is_rejected(
    client: AsyncClient,
    admin_user: User,
) -> None:
    await create_example_destination(client, admin_user)

    response = await client.post(
        "/api/v1/admin/destinations",
        json=EXAMPLE_DESTINATION,
        headers=await admin_headers(client, admin_user),
    )

    assert response.status_code == 409


async def test_inactive_destination_behavior(
    client: AsyncClient,
    admin_user: User,
) -> None:
    created = await create_example_destination(client, admin_user)
    headers = await admin_headers(client, admin_user)
    deactivated = await client.delete(
        f"/api/v1/admin/destinations/{created['id']}",
        headers=headers,
    )

    default_listing = await client.get("/api/v1/destinations", headers=headers)
    inactive_listing = await client.get(
        "/api/v1/destinations?active=false",
        headers=headers,
    )
    retrieval = await client.get(
        f"/api/v1/destinations/{created['slug']}",
        headers=headers,
    )

    assert deactivated.status_code == 204
    assert default_listing.json() == []
    assert [item["id"] for item in inactive_listing.json()] == [created["id"]]
    assert retrieval.status_code == 404


async def test_update_authorization_and_admin_update(
    client: AsyncClient,
    admin_user: User,
) -> None:
    created = await create_example_destination(client, admin_user)

    tourist_response = await client.patch(
        f"/api/v1/admin/destinations/{created['id']}",
        json={"name": "Unauthorized change"},
        headers=await tourist_headers(client),
    )
    admin_response = await client.patch(
        f"/api/v1/admin/destinations/{created['id']}",
        json={"name": "Updated Example Destination"},
        headers=await admin_headers(client, admin_user),
    )

    assert tourist_response.status_code == 403
    assert admin_response.status_code == 200
    assert admin_response.json()["name"] == "Updated Example Destination"


async def test_deactivation_authorization(
    client: AsyncClient,
    admin_user: User,
) -> None:
    created = await create_example_destination(client, admin_user)

    tourist_response = await client.delete(
        f"/api/v1/admin/destinations/{created['id']}",
        headers=await tourist_headers(client),
    )

    assert tourist_response.status_code == 403
