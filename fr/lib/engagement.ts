import { isAxiosError } from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import apiPaths from '@/lib/apiPaths';
import type {
  InteractionEventRequest,
  InteractionEventResponse,
  RecommendationHistoryItem,
  SavedDestinationResponse,
} from '@/types/engagement-api';

export async function listSavedDestinations() {
  const response = await axiosInstance.get<SavedDestinationResponse[]>(apiPaths.saved.list);
  return response.data;
}

export async function saveDestination(destinationId: number) {
  try {
    const response = await axiosInstance.post<SavedDestinationResponse>(
      apiPaths.saved.create(destinationId),
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) return null;
    throw error;
  }
}

export async function unsaveDestination(destinationId: number) {
  try {
    await axiosInstance.delete(apiPaths.saved.remove(destinationId));
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return;
    throw error;
  }
}

export async function listRecommendationHistory() {
  const response = await axiosInstance.get<RecommendationHistoryItem[]>(
    apiPaths.recommendations.history,
  );
  return response.data;
}

export async function recordInteraction(request: InteractionEventRequest) {
  const response = await axiosInstance.post<InteractionEventResponse>(
    apiPaths.interactions.create,
    request,
  );
  return response.data;
}
