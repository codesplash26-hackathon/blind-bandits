from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.core.config import get_settings
from app.db.session import get_db
from app.schemas.engagement import RecommendationHistoryItem
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.engagement import (
    list_recommendation_history,
    record_recommendation_search,
)
from app.services.recommendations import recommend_destinations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResponse)
async def create_recommendations(
    request: RecommendationRequest,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> RecommendationResponse:
    configuration = get_settings().sustainability_weights
    response = recommend_destinations(db, request, configuration)
    record = record_recommendation_search(
        db, current_user.id, request, response, configuration
    )
    return RecommendationResponse(
        recommendation_search_id=record.id,
        results=response.results,
    )


@router.get("/history", response_model=list[RecommendationHistoryItem])
async def read_recommendation_history(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> list[RecommendationHistoryItem]:
    return list_recommendation_history(db, current_user.id)
