from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.db.session import get_db
from app.schemas.engagement import InteractionEventRequest, InteractionEventResponse
from app.services.engagement import (
    DestinationUnavailableError,
    InvalidSelectionError,
    SearchUnavailableError,
    record_interaction,
)

router = APIRouter(prefix="/interactions", tags=["interactions"])


@router.post(
    "", response_model=InteractionEventResponse, status_code=status.HTTP_201_CREATED
)
async def create_interaction(
    request: InteractionEventRequest,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> InteractionEventResponse:
    try:
        event = record_interaction(
            db,
            current_user.id,
            request.destination_id,
            request.event_type,
            request.recommendation_search_id,
        )
    except DestinationUnavailableError:
        raise HTTPException(status_code=404, detail="Destination not found") from None
    except SearchUnavailableError:
        raise HTTPException(status_code=404, detail="Search not found") from None
    except InvalidSelectionError:
        raise HTTPException(
            status_code=422, detail="Destination was not in the recommendation result"
        ) from None
    return InteractionEventResponse.model_validate(event)
