"""Database-side aggregations; never fetch raw personal event rows for charts."""

from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import case, cast, func, select, true
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Session

from app.models.destination import Destination
from app.models.engagement import (
    AlternativeSelectionContext,
    InteractionEvent,
    InteractionType,
    RecommendationSearch,
)
from app.schemas.analytics import AnalyticsDestinationCount, AnalyticsInterestCount

TOP_LIST_LIMIT = 10


def window_bounds(start_date: date, end_date: date) -> tuple[datetime, datetime]:
    return (
        datetime.combine(start_date, time.min, tzinfo=UTC),
        datetime.combine(end_date + timedelta(days=1), time.min, tzinfo=UTC),
    )


def _day_bucket(db: Session, column: object) -> object:
    if db.get_bind().dialect.name == "postgresql":
        return func.date(func.timezone("UTC", column))
    return func.date(column)


def search_total(db: Session, start: datetime, end: datetime) -> int:
    return int(
        db.scalar(
            select(func.count(RecommendationSearch.id)).where(
                RecommendationSearch.created_at >= start,
                RecommendationSearch.created_at < end,
            )
        )
        or 0
    )


def event_totals(
    db: Session, start: datetime, end: datetime
) -> dict[InteractionType, int]:
    statement = (
        select(InteractionEvent.event_type, func.count(InteractionEvent.id))
        .where(InteractionEvent.created_at >= start, InteractionEvent.created_at < end)
        .group_by(InteractionEvent.event_type)
    )
    return {event_type: int(count) for event_type, count in db.execute(statement)}


def top_interests(
    db: Session, start: datetime, end: datetime
) -> list[AnalyticsInterestCount]:
    if db.get_bind().dialect.name == "postgresql":
        interests = (
            func.jsonb_array_elements_text(
                cast(RecommendationSearch.request_data["interests"], JSONB)
            )
            .table_valued("value")
            .lateral("interest_values")
        )
    else:
        interests = func.json_each(
            func.json_extract(RecommendationSearch.request_data, "$.interests")
        ).table_valued("key", "value")
    statement = (
        select(interests.c.value, func.count().label("count"))
        .select_from(RecommendationSearch)
        .join(interests, true())
        .where(
            RecommendationSearch.created_at >= start,
            RecommendationSearch.created_at < end,
        )
        .group_by(interests.c.value)
        .order_by(func.count().desc(), interests.c.value)
        .limit(TOP_LIST_LIMIT)
    )
    return [
        AnalyticsInterestCount(interest=str(interest), count=int(count))
        for interest, count in db.execute(statement)
    ]


def top_destinations(
    db: Session,
    event_type: InteractionType,
    start: datetime,
    end: datetime,
) -> list[AnalyticsDestinationCount]:
    count = func.count(InteractionEvent.id)
    statement = (
        select(Destination.id, Destination.slug, Destination.name, count)
        .join(InteractionEvent, InteractionEvent.destination_id == Destination.id)
        .where(
            InteractionEvent.event_type == event_type,
            InteractionEvent.created_at >= start,
            InteractionEvent.created_at < end,
        )
        .group_by(Destination.id, Destination.slug, Destination.name)
        .order_by(count.desc(), Destination.id)
        .limit(TOP_LIST_LIMIT)
    )
    return [
        AnalyticsDestinationCount(
            destination_id=destination_id, slug=slug, name=name, count=int(total)
        )
        for destination_id, slug, name, total in db.execute(statement)
    ]


def contextual_totals(db: Session, start: datetime, end: datetime) -> dict[str, int]:
    lower = (
        AlternativeSelectionContext.selected_pressure_value
        < AlternativeSelectionContext.source_pressure_value
    )
    redirected = lower & (AlternativeSelectionContext.source_pressure_band == "HIGH")
    statement = (
        select(
            func.count(AlternativeSelectionContext.id),
            func.sum(case((redirected, 1), else_=0)),
            func.count(func.distinct(case((redirected, InteractionEvent.user_id)))),
            func.sum(case((lower, 1), else_=0)),
            func.count(func.distinct(case((lower, InteractionEvent.destination_id)))),
        )
        .join(
            InteractionEvent,
            InteractionEvent.id == AlternativeSelectionContext.event_id,
        )
        .where(
            InteractionEvent.event_type == InteractionType.ALTERNATIVE_SELECTED,
            InteractionEvent.created_at >= start,
            InteractionEvent.created_at < end,
        )
    )
    row = db.execute(statement).one()
    return {
        "with_context": int(row[0] or 0),
        "redirection_events": int(row[1] or 0),
        "redirected_users": int(row[2] or 0),
        "discovery_events": int(row[3] or 0),
        "distinct_discoveries": int(row[4] or 0),
    }


def alternative_selection_searches(db: Session, start: datetime, end: datetime) -> int:
    """Distinct searches in the window that had an alternative selection in it."""
    statement = (
        select(func.count(func.distinct(RecommendationSearch.id)))
        .join(
            InteractionEvent,
            InteractionEvent.recommendation_search_id == RecommendationSearch.id,
        )
        .where(
            RecommendationSearch.created_at >= start,
            RecommendationSearch.created_at < end,
            InteractionEvent.created_at >= start,
            InteractionEvent.created_at < end,
            InteractionEvent.event_type == InteractionType.ALTERNATIVE_SELECTED,
        )
    )
    return int(db.scalar(statement) or 0)


def search_daily(db: Session, start: datetime, end: datetime) -> dict[date, int]:
    day = _day_bucket(db, RecommendationSearch.created_at)
    statement = (
        select(day, func.count(RecommendationSearch.id))
        .where(
            RecommendationSearch.created_at >= start,
            RecommendationSearch.created_at < end,
        )
        .group_by(day)
    )
    return {
        date.fromisoformat(str(day_value)): int(count)
        for day_value, count in db.execute(statement)
    }


def event_daily(
    db: Session, start: datetime, end: datetime
) -> dict[date, dict[str, int]]:
    day = _day_bucket(db, InteractionEvent.created_at)
    lower = (
        AlternativeSelectionContext.selected_pressure_value
        < AlternativeSelectionContext.source_pressure_value
    )
    redirected = lower & (AlternativeSelectionContext.source_pressure_band == "HIGH")
    statement = (
        select(
            day,
            func.sum(
                case(
                    (
                        InteractionEvent.event_type
                        == InteractionType.DESTINATION_VIEWED,
                        1,
                    ),
                    else_=0,
                )
            ),
            func.sum(
                case(
                    (
                        InteractionEvent.event_type
                        == InteractionType.DESTINATION_SAVED,
                        1,
                    ),
                    else_=0,
                )
            ),
            func.sum(
                case(
                    (
                        InteractionEvent.event_type
                        == InteractionType.RECOMMENDATION_SELECTED,
                        1,
                    ),
                    else_=0,
                )
            ),
            func.sum(
                case(
                    (
                        InteractionEvent.event_type
                        == InteractionType.ALTERNATIVE_SELECTED,
                        1,
                    ),
                    else_=0,
                )
            ),
            func.sum(case((redirected, 1), else_=0)),
            func.sum(case((lower, 1), else_=0)),
        )
        .outerjoin(
            AlternativeSelectionContext,
            AlternativeSelectionContext.event_id == InteractionEvent.id,
        )
        .where(InteractionEvent.created_at >= start, InteractionEvent.created_at < end)
        .group_by(day)
    )
    return {
        date.fromisoformat(str(row[0])): {
            "destination_views": int(row[1] or 0),
            "destination_saves": int(row[2] or 0),
            "recommendations_accepted": int(row[3] or 0),
            "alternatives_selected": int(row[4] or 0),
            "high_pressure_redirections": int(row[5] or 0),
            "lower_pressure_discoveries": int(row[6] or 0),
        }
        for row in db.execute(statement)
    }
