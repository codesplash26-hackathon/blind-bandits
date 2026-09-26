"""Stored environmental reads and controlled admin refreshes."""

from collections.abc import AsyncGenerator
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.dependencies import AdminUser, CurrentUser
from app.core.config import get_settings
from app.db.session import get_db
from app.models.environment import ObservationType
from app.schemas.environment import (
    EnvironmentalRefreshResponse,
    EnvironmentalSnapshotResponse,
    RefreshStatus,
)
from app.services.destinations import get_destination_by_id
from app.services.environment import current_snapshot, refresh_observation
from app.services.environment_providers import OpenAQProvider, OpenMeteoProvider

read_router = APIRouter(prefix="/destinations", tags=["environment"])
admin_router = APIRouter(prefix="/admin/destinations", tags=["admin environment"])


async def get_environment_http_client() -> AsyncGenerator[httpx.AsyncClient]:
    async with httpx.AsyncClient(
        timeout=get_settings().environment_http_timeout_seconds
    ) as client:
        yield client


@read_router.get(
    "/{destination_id}/environment", response_model=EnvironmentalSnapshotResponse
)
async def read_environment(
    destination_id: int,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> EnvironmentalSnapshotResponse:
    destination = get_destination_by_id(db, destination_id)
    if destination is None or not destination.is_active:
        raise HTTPException(status_code=404, detail="Destination not found")
    return current_snapshot(
        db,
        destination_id,
        stale_after_minutes=get_settings().environment_stale_after_minutes,
    )


@admin_router.post(
    "/{destination_id}/environment/refresh",
    response_model=EnvironmentalRefreshResponse,
)
async def refresh_environment(
    destination_id: int,
    _: AdminUser,
    db: Annotated[Session, Depends(get_db)],
    client: Annotated[httpx.AsyncClient, Depends(get_environment_http_client)],
    observation_type: Annotated[ObservationType, Query(alias="type")],
) -> EnvironmentalRefreshResponse:
    destination = get_destination_by_id(db, destination_id)
    if destination is None or not destination.is_active:
        raise HTTPException(status_code=404, detail="Destination not found")
    settings = get_settings()
    provider = (
        OpenMeteoProvider(
            client,
            settings.open_meteo_url,
            settings.open_meteo_api_key.get_secret_value()
            if settings.open_meteo_api_key
            else None,
        )
        if observation_type == ObservationType.WEATHER
        else OpenAQProvider(
            client,
            settings.openaq_url,
            settings.openaq_api_key.get_secret_value()
            if settings.openaq_api_key
            else None,
            settings.openaq_radius_m,
        )
    )
    result = await refresh_observation(
        db,
        destination,
        provider,
        observation_type,
        stale_after_minutes=settings.environment_stale_after_minutes,
    )
    if result.status == RefreshStatus.UNAVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Provider data unavailable and no stored observation exists",
        )
    return result
