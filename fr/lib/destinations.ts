import axiosInstance from '@/lib/axiosInstance';
import apiPaths from '@/lib/apiPaths';
import type {
  DestinationCreate,
  DestinationFilters,
  DestinationPressureExplanationResponse,
  DestinationPressureResponse,
  DestinationAlternativesResponse,
  AdminDashboardResponse,
  DestinationResponse,
  DestinationSimulationResponse,
  DestinationSustainabilityResponse,
  DestinationUpdate,
  EnvironmentalObservationType,
  EnvironmentalRefreshResponse,
  EnvironmentalSnapshotResponse,
  MapDestinationsResponse,
  SimulationScenario,
} from '@/types/destination-api';
import type { AdminAnalyticsResponse } from '@/types/analytics-api';

export async function listDestinations(filters: DestinationFilters = {}) {
  const response = await axiosInstance.get<DestinationResponse[]>(apiPaths.destinations.list, {
    params: filters,
  });
  return response.data;
}

export async function getMapDestinations(month: string) {
  const response = await axiosInstance.get<MapDestinationsResponse>(
    apiPaths.map.destinations,
    { params: { month } },
  );
  return response.data;
}

export async function getAdminDashboard(month: string) {
  const response = await axiosInstance.get<AdminDashboardResponse>(
    apiPaths.adminDashboard.summary,
    { params: { month } },
  );
  return response.data;
}

export async function getAdminAnalytics(startDate: string, endDate: string) {
  const response = await axiosInstance.get<AdminAnalyticsResponse>(
    apiPaths.adminAnalytics.summary,
    { params: { start_date: startDate, end_date: endDate } },
  );
  return response.data;
}

export async function getDestination(identifier: number | string) {
  const response = await axiosInstance.get<DestinationResponse>(
    apiPaths.destinations.detail(identifier),
  );
  return response.data;
}

export async function getDestinationSustainability(destinationId: number) {
  const response = await axiosInstance.get<DestinationSustainabilityResponse>(
    apiPaths.destinations.sustainability(destinationId),
  );
  return response.data;
}

export async function getDestinationEnvironment(destinationId: number) {
  const response = await axiosInstance.get<EnvironmentalSnapshotResponse>(
    apiPaths.destinations.environment(destinationId),
  );
  return response.data;
}

export async function refreshDestinationEnvironment(
  destinationId: number,
  type: EnvironmentalObservationType,
) {
  const response = await axiosInstance.post<EnvironmentalRefreshResponse>(
    apiPaths.adminDestinations.environmentRefresh(destinationId),
    null,
    { params: { type } },
  );
  return response.data;
}

export async function getDestinationPressure(destinationId: number, month: string) {
  const response = await axiosInstance.get<DestinationPressureResponse>(
    apiPaths.destinations.pressure(destinationId),
    { params: { month } },
  );
  return response.data;
}

export async function getDestinationPressureExplanation(
  destinationId: number,
  month: string,
) {
  const response = await axiosInstance.get<DestinationPressureExplanationResponse>(
    apiPaths.destinations.pressureExplanation(destinationId),
    { params: { month } },
  );
  return response.data;
}

export async function getDestinationAlternatives(destinationId: number, month: string) {
  const response = await axiosInstance.get<DestinationAlternativesResponse>(
    apiPaths.destinations.alternatives(destinationId),
    { params: { month } },
  );
  return response.data;
}

export async function simulateDestination(
  destinationId: number,
  scenario: SimulationScenario,
) {
  const response = await axiosInstance.post<DestinationSimulationResponse>(
    apiPaths.destinations.simulate(destinationId),
    scenario,
  );
  return response.data;
}

export async function createDestination(data: DestinationCreate) {
  const response = await axiosInstance.post<DestinationResponse>(
    apiPaths.adminDestinations.create,
    data,
  );
  return response.data;
}

export async function updateDestination(destinationId: number, data: DestinationUpdate) {
  const response = await axiosInstance.patch<DestinationResponse>(
    apiPaths.adminDestinations.update(destinationId),
    data,
  );
  return response.data;
}

export async function deactivateDestination(destinationId: number) {
  await axiosInstance.delete(apiPaths.adminDestinations.deactivate(destinationId));
}
