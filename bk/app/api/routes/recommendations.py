from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.core.config import get_settings
from app.db.session import get_db
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendations import recommend_destinations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResponse)
async def create_recommendations(
    request: RecommendationRequest,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> RecommendationResponse:
    return recommend_destinations(
        db,
        request,
        get_settings().sustainability_weights,
    )

