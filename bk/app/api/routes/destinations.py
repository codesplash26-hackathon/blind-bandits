from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.core.config import get_settings
from app.db.session import get_db
from app.models.destination import Activity, Destination, destination_activities
from app.schemas.destination import DestinationResponse
from app.schemas.sustainability import DestinationSustainabilityResponse
from app.services.destinations import (
    destination_load_options,
    get_destination_by_id,
    get_destination_by_identifier,
)
from app.services.sustainability import (
    SustainabilityFactorScores,
    calculate_sustainability_score,
)

router = APIRouter(prefix="/destinations", tags=["destinations"])


@router.get("", response_model=list[DestinationResponse])
async def list_destinations(
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    region: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    landscape: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    activity: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    active: bool = True,
) -> list[Destination]:
    statement = (
        select(Destination)
        .where(Destination.is_active.is_(active))
        .options(*destination_load_options())
        .order_by(Destination.name)
    )
    if region is not None:
        statement = statement.where(func.lower(Destination.region) == region.lower())
    if landscape is not None:
        statement = statement.where(
            func.lower(Destination.landscape_type) == landscape.lower()
        )
    if activity is not None:
        statement = (
            statement.join(
                destination_activities,
                Destination.id == destination_activities.c.destination_id,
            )
            .join(Activity, Activity.id == destination_activities.c.activity_id)
            .where(func.lower(Activity.slug) == activity.lower())
        )
    return list(db.scalars(statement).unique())


@router.get(
    "/{destination_id}/sustainability",
    response_model=DestinationSustainabilityResponse,
)
async def read_destination_sustainability(
    destination_id: int,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> DestinationSustainabilityResponse:
    destination = get_destination_by_id(db, destination_id)
    if destination is None or not destination.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination not found",
        )
    if destination.factor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sustainability factor data not found",
        )

    factor = destination.factor
    result = calculate_sustainability_score(
        SustainabilityFactorScores(
            environmental=factor.environmental_score,
            community=factor.community_benefit_score,
            crowd=factor.crowd_score,
            infrastructure=factor.infrastructure_score,
            suitability=factor.tourist_suitability_score,
        ),
        get_settings().sustainability_weights,
    )
    return DestinationSustainabilityResponse(
        destination_id=destination.id,
        destination_slug=destination.slug,
        **result.model_dump(),
    )


@router.get("/{identifier}", response_model=DestinationResponse)
async def read_destination(
    identifier: str,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> Destination:
    destination = get_destination_by_identifier(db, identifier)
    if destination is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination not found",
        )
    return destination
