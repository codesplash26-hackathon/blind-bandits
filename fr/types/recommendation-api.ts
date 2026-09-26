import type { DestinationResponse, SustainabilityFactorScores } from '@/types/destination-api';

export type RecommendationCrowdPreference = 'QUIET' | 'BALANCED' | 'LIVELY';
export type RecommendationSustainabilityPreference = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RecommendationRequest {
  budget: number;
  trip_duration: number;
  interests: string[];
  crowd_preference: RecommendationCrowdPreference;
  sustainability_preference: RecommendationSustainabilityPreference;
}

export interface PreferenceMatchResponse {
  matched_interests: string[];
  unmatched_interests: string[];
  interest_match_score: string;
  crowd_match_score: string;
  ranking_score: string;
}

export interface RecommendationItemResponse {
  rank: number;
  destination: DestinationResponse;
  sustainability_score: string;
  factor_scores: SustainabilityFactorScores;
  preference_match: PreferenceMatchResponse;
}

export interface RecommendationResponse {
  results: RecommendationItemResponse[];
}

export interface RecommendationSession {
  request: RecommendationRequest;
  response: RecommendationResponse;
  recommendation_search_id?: number;
}
