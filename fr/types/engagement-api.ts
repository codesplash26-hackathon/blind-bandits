import type { DestinationResponse } from '@/types/destination-api';
import type {
  RecommendationCrowdPreference,
  RecommendationSustainabilityPreference,
} from '@/types/recommendation-api';

export interface SavedDestinationResponse {
  id: number;
  destination: DestinationResponse;
  saved_at: string;
}

export interface RecommendationHistoryItem {
  id: number;
  request: {
    budget: string;
    trip_duration: number;
    interests: string[];
    crowd_preference: RecommendationCrowdPreference;
    sustainability_preference: RecommendationSustainabilityPreference;
  };
  result_destination_ids: number[];
  sustainability_config_version: string;
  ranking_version: string;
  created_at: string;
}

export type InteractionType =
  | 'DESTINATION_VIEWED'
  | 'RECOMMENDATION_SELECTED'
  | 'ALTERNATIVE_SELECTED';

export interface InteractionEventRequest {
  destination_id: number;
  event_type: InteractionType;
  recommendation_search_id?: number;
  source_destination_id?: number;
  pressure_month?: string;
}

export interface InteractionEventResponse {
  id: number;
  destination_id: number;
  event_type: InteractionType;
  recommendation_search_id: number | null;
  created_at: string;
}
