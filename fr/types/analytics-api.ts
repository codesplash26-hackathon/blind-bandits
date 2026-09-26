export interface AnalyticsDailyPoint {
  date: string;
  recommendation_searches: number;
  destination_views: number;
  destination_saves: number;
  recommendations_accepted: number;
  alternatives_selected: number;
  high_pressure_redirections: number;
  lower_pressure_discoveries: number;
}

export interface AnalyticsCount {
  count: number;
}

export interface AnalyticsInterestCount extends AnalyticsCount {
  interest: string;
}

export interface AnalyticsDestinationCount extends AnalyticsCount {
  destination_id: number;
  slug: string;
  name: string;
}

export interface AnalyticsSummary {
  total_recommendation_searches: number;
  destination_views: number;
  destination_save_events: number;
  recommendations_accepted: number;
  alternative_destinations_selected: number;
  alternative_selections_with_pressure_context: number;
  users_redirected_from_high_pressure_destinations: number;
  high_pressure_redirection_events: number;
  lower_pressure_discovery_events: number;
  distinct_lower_pressure_destinations_discovered: number;
  alternative_acceptance_rate: number | null;
  alternative_acceptance_rate_basis: string;
}

export interface AdminAnalyticsResponse {
  start_date: string;
  end_date: string;
  summary: AnalyticsSummary;
  most_searched_interests: AnalyticsInterestCount[];
  most_viewed_destinations: AnalyticsDestinationCount[];
  most_saved_destinations: AnalyticsDestinationCount[];
  daily: AnalyticsDailyPoint[];
}