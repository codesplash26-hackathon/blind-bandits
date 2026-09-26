"""Persistence, fallback, and freshness for environmental observations."""

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.destination import Destination
from app.models.environment import EnvironmentalObservation, ObservationType
from app.schemas.environment import (
    EnvironmentalObservationResponse,
    EnvironmentalRefreshResponse,
    EnvironmentalSnapshotResponse,
    RefreshStatus,
)
from app.services.environment_providers import EnvironmentalProvider, ProviderError


def _aware_utc(value: datetime) -> datetime:
    # SQLite test databases return naive datetimes despite timezone=True.
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def latest_observation(
    db: Session, destination_id: int, observation_type: ObservationType
) -> EnvironmentalObservation | None:
    return db.scalar(
        select(EnvironmentalObservation)
        .where(
            EnvironmentalObservation.destination_id == destination_id,
            EnvironmentalObservation.observation_type == observation_type,
        )
        .order_by(
            EnvironmentalObservation.observed_at.desc(),
            EnvironmentalObservation.id.desc(),
        )
        .limit(1)
    )


def observation_response(
    observation: EnvironmentalObservation,
    *,
    now: datetime,
    stale_after_minutes: int,
) -> EnvironmentalObservationResponse:
    age_minutes = max(
        0.0,
        (_aware_utc(now) - _aware_utc(observation.observed_at)).total_seconds() / 60,
    )
    return EnvironmentalObservationResponse(
        id=observation.id,
        destination_id=observation.destination_id,
        observation_type=observation.observation_type,
        values=observation.values,
        source=observation.source,
        source_location=observation.source_location,
        observed_at=_aware_utc(observation.observed_at),
        fetched_at=_aware_utc(observation.fetched_at),
        age_minutes=round(age_minutes, 1),
        is_stale=age_minutes > stale_after_minutes,
    )


def current_snapshot(
    db: Session,
    destination_id: int,
    *,
    stale_after_minutes: int,
    now: datetime | None = None,
) -> EnvironmentalSnapshotResponse:
    now = now or datetime.now(UTC)
    weather = latest_observation(db, destination_id, ObservationType.WEATHER)
    air_quality = latest_observation(db, destination_id, ObservationType.AIR_QUALITY)
    return EnvironmentalSnapshotResponse(
        destination_id=destination_id,
        weather=(
            observation_response(
                weather, now=now, stale_after_minutes=stale_after_minutes
            )
            if weather
            else None
        ),
        air_quality=(
            observation_response(
                air_quality, now=now, stale_after_minutes=stale_after_minutes
            )
            if air_quality
            else None
        ),
    )


async def refresh_observation(
    db: Session,
    destination: Destination,
    provider: EnvironmentalProvider,
    observation_type: ObservationType,
    *,
    stale_after_minutes: int,
    now: datetime | None = None,
) -> EnvironmentalRefreshResponse:
    """One manual/scheduled refresh; provider failures never delete stored data."""
    now = now or datetime.now(UTC)
    try:
        fetched = await provider.fetch(destination)
        if fetched.observation_type != observation_type:
            raise ProviderError("Provider returned the wrong observation type")
    except ProviderError as exc:
        previous = latest_observation(db, destination.id, observation_type)
        return EnvironmentalRefreshResponse(
            status=RefreshStatus.FALLBACK if previous else RefreshStatus.UNAVAILABLE,
            observation=(
                observation_response(
                    previous, now=now, stale_after_minutes=stale_after_minutes
                )
                if previous
                else None
            ),
            fallback_reason=exc.code,
        )

    existing = db.scalar(
        select(EnvironmentalObservation).where(
            EnvironmentalObservation.destination_id == destination.id,
            EnvironmentalObservation.observation_type == observation_type,
            EnvironmentalObservation.source == fetched.source,
            EnvironmentalObservation.source_location == fetched.source_location,
            EnvironmentalObservation.observed_at == fetched.observed_at,
        )
    )
    if existing:
        return EnvironmentalRefreshResponse(
            status=RefreshStatus.UNCHANGED,
            observation=observation_response(
                existing, now=now, stale_after_minutes=stale_after_minutes
            ),
        )

    observation = EnvironmentalObservation(
        destination_id=destination.id,
        observation_type=observation_type,
        values=fetched.values,
        source=fetched.source,
        source_location=fetched.source_location,
        observed_at=fetched.observed_at,
        fetched_at=now,
    )
    db.add(observation)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # A concurrent refresh may have saved the same provider timestamp.
        existing = db.scalar(
            select(EnvironmentalObservation).where(
                EnvironmentalObservation.destination_id == destination.id,
                EnvironmentalObservation.observation_type == observation_type,
                EnvironmentalObservation.source == fetched.source,
                EnvironmentalObservation.source_location == fetched.source_location,
                EnvironmentalObservation.observed_at == fetched.observed_at,
            )
        )
        if existing is None:
            raise
        return EnvironmentalRefreshResponse(
            status=RefreshStatus.UNCHANGED,
            observation=observation_response(
                existing, now=now, stale_after_minutes=stale_after_minutes
            ),
        )
    db.refresh(observation)
    return EnvironmentalRefreshResponse(
        status=RefreshStatus.UPDATED,
        observation=observation_response(
            observation, now=now, stale_after_minutes=stale_after_minutes
        ),
    )
