import axiosInstance from '@/lib/axiosInstance';
import apiPaths from '@/lib/apiPaths';
import type {
  RecommendationRequest,
  RecommendationResponse,
  RecommendationSession,
} from '@/types/recommendation-api';

const RECOMMENDATION_SESSION_KEY = 'ceylontour_recommendation_session';
const RECOMMENDATION_DRAFT_KEY = 'ceylontour_recommendation_draft';

export async function createRecommendations(request: RecommendationRequest) {
  const response = await axiosInstance.post<RecommendationResponse>(
    apiPaths.recommendations.create,
    request,
  );
  return response.data;
}

export function storeRecommendationSession(session: RecommendationSession) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(RECOMMENDATION_SESSION_KEY, JSON.stringify(session));
  }
}

export function loadRecommendationSession(): RecommendationSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(RECOMMENDATION_SESSION_KEY);
    return value ? JSON.parse(value) as RecommendationSession : null;
  } catch {
    return null;
  }
}

export function storeRecommendationDraft(request: RecommendationRequest) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(RECOMMENDATION_DRAFT_KEY, JSON.stringify(request));
  }
}

export function loadRecommendationDraft(): RecommendationRequest | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(RECOMMENDATION_DRAFT_KEY);
    return value ? JSON.parse(value) as RecommendationRequest : null;
  } catch {
    return null;
  }
}
