"""Compose database aggregates into a bounded, privacy-preserving dashboard response."""

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.engagement import InteractionType
from app.schemas.analytics import (
    AdminAnalyticsResponse,
    AnalyticsDailyPoint,
    AnalyticsSummary,
)
from app.services import analytics_queries as queries

MAX_RANGE_DAYS = 366
ACCEPTANCE_RATE_BASIS = (
    "Share of recommendation searches created in this date range with at least "
    "one alternative selection recorded in the same range; not an offer-impression rate."
)


def build_admin_analytics(
    db: Session, *, start_date: date, end_date: date
) -> AdminAnalyticsResponse:
    if (
        end_date < start_date
        or end_date == date.max
        or (end_date - start_date).days >= MAX_RANGE_DAYS
    ):
        raise ValueError("Date range must span 1 to 366 inclusive days")

    start, end = queries.window_bounds(start_date, end_date)
    searches = queries.search_total(db, start, end)
    events = queries.event_totals(db, start, end)
    context = queries.contextual_totals(db, start, end)
    accepted_searches = queries.alternative_selection_searches(db, start, end)
    search_by_day = queries.search_daily(db, start, end)
    event_by_day = queries.event_daily(db, start, end)
    daily = [
        AnalyticsDailyPoint(
            date=day,
            recommendation_searches=search_by_day.get(day, 0),
            **event_by_day.get(
                day,
                {
                    "destination_views": 0,
                    "destination_saves": 0,
                    "recommendations_accepted": 0,
                    "alternatives_selected": 0,
                    "high_pressure_redirections": 0,
                    "lower_pressure_discoveries": 0,
                },
            ),
        )
        for day in (
            start_date + timedelta(days=offset)
            for offset in range((end_date - start_date).days + 1)
        )
    ]
    return AdminAnalyticsResponse(
        start_date=start_date,
        end_date=end_date,
        summary=AnalyticsSummary(
            total_recommendation_searches=searches,
            destination_views=events.get(InteractionType.DESTINATION_VIEWED, 0),
            destination_save_events=events.get(InteractionType.DESTINATION_SAVED, 0),
            recommendations_accepted=events.get(
                InteractionType.RECOMMENDATION_SELECTED, 0
            ),
            alternative_destinations_selected=events.get(
                InteractionType.ALTERNATIVE_SELECTED, 0
            ),
            alternative_selections_with_pressure_context=context["with_context"],
            users_redirected_from_high_pressure_destinations=context[
                "redirected_users"
            ],
            high_pressure_redirection_events=context["redirection_events"],
            lower_pressure_discovery_events=context["discovery_events"],
            distinct_lower_pressure_destinations_discovered=context[
                "distinct_discoveries"
            ],
            alternative_acceptance_rate=(
                accepted_searches / searches if searches else None
            ),
            alternative_acceptance_rate_basis=ACCEPTANCE_RATE_BASIS,
        ),
        most_searched_interests=queries.top_interests(db, start, end),
        most_viewed_destinations=queries.top_destinations(
            db, InteractionType.DESTINATION_VIEWED, start, end
        ),
        most_saved_destinations=queries.top_destinations(
            db, InteractionType.DESTINATION_SAVED, start, end
        ),
        daily=daily,
    )
