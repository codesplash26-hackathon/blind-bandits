from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import AdminUser
from app.api.routes.destinations import destination_response
from app.db.session import get_db
from app.schemas.destination import (
    DestinationCreate,
    DestinationResponse,
    DestinationUpdate,
)
from app.services.destinations import (
    create_destination,
    find_destination_by_slug,
    get_destination_by_id,
    replace_factor,
    resolve_activities,
)

router = APIRouter(prefix="/admin/destinations", tags=["admin destinations"])


def destination_not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Destination not found",
    )


def duplicate_slug() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="A destination with this slug already exists",
    )


@router.post(
    "",
    response_model=DestinationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_admin_destination(
    data: DestinationCreate,
    _: AdminUser,
    db: Annotated[Session, Depends(get_db)],
) -> DestinationResponse:
    if find_destination_by_slug(db, data.slug) is not None:
        raise duplicate_slug()
    destination = create_destination(db, data)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise duplicate_slug() from None
    db.refresh(destination)
    return destination_response(destination)


@router.patch("/{destination_id}", response_model=DestinationResponse)
async def update_admin_destination(
    destination_id: int,
    data: DestinationUpdate,
    _: AdminUser,
    db: Annotated[Session, Depends(get_db)],
) -> DestinationResponse:
    destination = get_destination_by_id(db, destination_id)
    if destination is None:
        raise destination_not_found()
    if (
        data.slug is not None
        and data.slug != destination.slug
        and find_destination_by_slug(db, data.slug) is not None
    ):
        raise duplicate_slug()

    scalar_values = data.model_dump(
        exclude_unset=True,
        exclude_none=True,
        exclude={"activities", "factor"},
    )
    for field, value in scalar_values.items():
        setattr(destination, field, value)
    if data.activities is not None:
        destination.activities = resolve_activities(db, data.activities)
    if data.factor is not None:
        replace_factor(destination, data.factor)

    if (
        destination.recommended_max_trip_duration
        < destination.recommended_min_trip_duration
    ):
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=(
                "recommended_max_trip_duration must be greater than or equal to "
                "recommended_min_trip_duration"
            ),
        )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise duplicate_slug() from None
    db.refresh(destination)
    return destination_response(destination)


@router.delete("/{destination_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_admin_destination(
    destination_id: int,
    _: AdminUser,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    destination = get_destination_by_id(db, destination_id)
    if destination is None:
        raise destination_not_found()
    destination.is_active = False
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
