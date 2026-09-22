from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.destination import Destination
from app.models.engagement import (
    InteractionEvent,
    InteractionType,
    RecommendationSearch,
    SavedDestination,
)
from app.schemas.engagement import (
    RecommendationHistoryItem,
    history_item_from_record,
)
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendations import RANKING_VERSION
from app.services.sustainability import SustainabilityWeightConfiguration


class DestinationUnavailableError(Exception):
    pass


class SearchUnavailableError(Exception):
    pass


class AlreadySavedError(Exception):
    pass


class InvalidSelectionError(Exception):
    pass


def record_recommendation_search(
    db: Session,
    user_id: int,
    request: RecommendationRequest,
    response: RecommendationResponse,
    configuration: SustainabilityWeightConfiguration,
) -> RecommendationSearch:
    record = RecommendationSearch(
        user_id=user_id,
        request_data=request.model_dump(mode="json"),
        result_destination_ids=[item.destination.id for item in response.results],
        sustainability_config_version=configuration.version,
        ranking_version=RANKING_VERSION,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_recommendation_history(
    db: Session, user_id: int
) -> list[RecommendationHistoryItem]:
    statement = (
        select(RecommendationSearch)
        .where(RecommendationSearch.user_id == user_id)
        .order_by(
            RecommendationSearch.created_at.desc(), RecommendationSearch.id.desc()
        )
    )
    return [history_item_from_record(record) for record in db.scalars(statement)]


def _active_destination(db: Session, destination_id: int) -> Destination:
    destination = db.get(Destination, destination_id)
    if destination is None or not destination.is_active:
        raise DestinationUnavailableError
    return destination


def save_destination(
    db: Session, user_id: int, destination_id: int
) -> SavedDestination:
    _active_destination(db, destination_id)
    existing = db.scalar(
        select(SavedDestination).where(
            SavedDestination.user_id == user_id,
            SavedDestination.destination_id == destination_id,
        )
    )
    if existing is not None:
        raise AlreadySavedError

    saved = SavedDestination(user_id=user_id, destination_id=destination_id)
    db.add(saved)
    db.add(
        InteractionEvent(
            user_id=user_id,
            destination_id=destination_id,
            event_type=InteractionType.DESTINATION_SAVED,
        )
    )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AlreadySavedError from None
    db.refresh(saved)
    return saved


def remove_saved_destination(db: Session, user_id: int, destination_id: int) -> bool:
    saved = db.scalar(
        select(SavedDestination).where(
            SavedDestination.user_id == user_id,
            SavedDestination.destination_id == destination_id,
        )
    )
    if saved is None:
        return False
    db.delete(saved)
    db.commit()
    return True


def list_saved_destinations(db: Session, user_id: int) -> list[SavedDestination]:
    statement = (
        select(SavedDestination)
        .where(SavedDestination.user_id == user_id)
        .options(selectinload(SavedDestination.destination))
        .order_by(SavedDestination.saved_at.desc(), SavedDestination.id.desc())
    )
    return list(db.scalars(statement))


def record_interaction(
    db: Session,
    user_id: int,
    destination_id: int,
    event_type: InteractionType,
    recommendation_search_id: int | None,
) -> InteractionEvent:
    _active_destination(db, destination_id)
    if event_type == InteractionType.DESTINATION_SAVED:
        raise InvalidSelectionError

    if recommendation_search_id is not None:
        search = db.scalar(
            select(RecommendationSearch).where(
                RecommendationSearch.id == recommendation_search_id,
                RecommendationSearch.user_id == user_id,
            )
        )
        if search is None:
            raise SearchUnavailableError
        if (
            event_type == InteractionType.RECOMMENDATION_SELECTED
            and destination_id not in search.result_destination_ids
        ):
            raise InvalidSelectionError
    elif event_type in {
        InteractionType.RECOMMENDATION_SELECTED,
        InteractionType.ALTERNATIVE_SELECTED,
    }:
        raise SearchUnavailableError

    event = InteractionEvent(
        user_id=user_id,
        destination_id=destination_id,
        recommendation_search_id=recommendation_search_id,
        event_type=event_type,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
