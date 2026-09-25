import axiosInstance from '@/lib/axiosInstance';
import apiPaths from '@/lib/apiPaths';
import type {
  DestinationCreate,
  DestinationFilters,
  DestinationResponse,
  DestinationSimulationResponse,
  DestinationSustainabilityResponse,
  DestinationUpdate,
  SimulationScenario,
} from '@/types/destination-api';

export async function listDestinations(filters: DestinationFilters = {}) {
  const response = await axiosInstance.get<DestinationResponse[]>(apiPaths.destinations.list, {
    params: filters,
  });
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
