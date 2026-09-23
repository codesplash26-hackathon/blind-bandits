from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.core.config import get_settings
from app.db.session import get_db
from app.ml.pressure.artifact import MissingPressureModelError
from app.ml.pressure.inference import ForecastContextUnavailableError
from app.schemas.engagement import InteractionEventRequest, InteractionEventResponse
from app.services.engagement import (
    DestinationUnavailableError,
    InvalidSelectionError,
    PressureContextUnavailableError,
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
    settings = get_settings()
    try:
        event = record_interaction(
            db,
            current_user.id,
            request.destination_id,
            request.event_type,
            request.recommendation_search_id,
            source_destination_id=request.source_destination_id,
            pressure_month=request.pressure_month,
            artifact_dir=settings.pressure_model_artifact_dir,
            pressure_thresholds=settings.pressure_band_thresholds,
        )
    except DestinationUnavailableError:
        raise HTTPException(status_code=404, detail="Destination not found") from None
    except SearchUnavailableError:
        raise HTTPException(status_code=404, detail="Search not found") from None
    except InvalidSelectionError:
        raise HTTPException(
            status_code=422,
            detail="Invalid recommendation or alternative selection context",
        ) from None
    except (MissingPressureModelError, PressureContextUnavailableError):
        raise HTTPException(
            status_code=503, detail="Pressure context is unavailable"
        ) from None
    except ForecastContextUnavailableError:
        raise HTTPException(
            status_code=422, detail="No forecast context for the selected month"
        ) from None
    return InteractionEventResponse.model_validate(event)
