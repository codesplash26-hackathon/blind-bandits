"""Privacy-preserving aggregate recommendation and interaction analytics."""

from datetime import date

from pydantic import BaseModel, Field


class AnalyticsInterestCount(BaseModel):
    interest: str
    count: int = Field(ge=0)


class AnalyticsDestinationCount(BaseModel):
    destination_id: int
    slug: str
    name: str
    count: int = Field(ge=0)


class AnalyticsDailyPoint(BaseModel):
    date: date
    recommendation_searches: int = Field(ge=0)
    destination_views: int = Field(ge=0)
    destination_saves: int = Field(ge=0)
    recommendations_accepted: int = Field(ge=0)
    alternatives_selected: int = Field(ge=0)
    high_pressure_redirections: int = Field(ge=0)
    lower_pressure_discoveries: int = Field(ge=0)


class AnalyticsSummary(BaseModel):
    total_recommendation_searches: int = Field(ge=0)
    destination_views: int = Field(ge=0)
    destination_save_events: int = Field(ge=0)
    recommendations_accepted: int = Field(ge=0)
    alternative_destinations_selected: int = Field(ge=0)
    alternative_selections_with_pressure_context: int = Field(ge=0)
    users_redirected_from_high_pressure_destinations: int = Field(ge=0)
    high_pressure_redirection_events: int = Field(ge=0)
    lower_pressure_discovery_events: int = Field(ge=0)
    distinct_lower_pressure_destinations_discovered: int = Field(ge=0)
    alternative_acceptance_rate: float | None = Field(default=None, ge=0, le=1)
    alternative_acceptance_rate_basis: str


class AdminAnalyticsResponse(BaseModel):
    start_date: date
    end_date: date
    summary: AnalyticsSummary
    most_searched_interests: list[AnalyticsInterestCount]
    most_viewed_destinations: list[AnalyticsDestinationCount]
    most_saved_destinations: list[AnalyticsDestinationCount]
    daily: list[AnalyticsDailyPoint]
