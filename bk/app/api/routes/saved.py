from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.db.session import get_db
from app.schemas.engagement import SavedDestinationResponse
from app.services.engagement import (
    AlreadySavedError,
    DestinationUnavailableError,
    list_saved_destinations,
    remove_saved_destination,
    save_destination,
)

router = APIRouter(prefix="/saved", tags=["saved destinations"])


@router.post(
    "/{destination_id}",
    response_model=SavedDestinationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_saved_destination(
    destination_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> SavedDestinationResponse:
    try:
        saved = save_destination(db, current_user.id, destination_id)
    except DestinationUnavailableError:
        raise HTTPException(status_code=404, detail="Destination not found") from None
    except AlreadySavedError:
        raise HTTPException(
            status_code=409, detail="Destination already saved"
        ) from None
    return SavedDestinationResponse.model_validate(saved)


@router.delete("/{destination_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_destination(
    destination_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    if not remove_saved_destination(db, current_user.id, destination_id):
        raise HTTPException(status_code=404, detail="Saved destination not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("", response_model=list[SavedDestinationResponse])
async def read_saved_destinations(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> list[SavedDestinationResponse]:
    saved = list_saved_destinations(db, current_user.id)
    return [SavedDestinationResponse.model_validate(item) for item in saved]
