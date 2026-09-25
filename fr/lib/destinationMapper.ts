import type { Destination } from '@/types/ceylontour';
import type {
  DestinationResponse,
  DestinationSustainabilityResponse,
} from '@/types/destination-api';

const FALLBACK_IMAGES = [
  '/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg',
  '/poswiecie-sigiriya-459197_1920.jpg',
  '/samanthaweerasinghe-devils-staircase-5346794_1920.jpg',
  '/tomas-malik-6BQyHtYSb5E-unsplash.jpg',
  '/musthaqsms-temple-204803_1920.jpg',
];

export interface DestinationViewModel extends Destination {
  api: DestinationResponse;
  sustainabilityData: DestinationSustainabilityResponse | null;
}

function titleCase(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function pressureLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

export function mapDestination(
  destination: DestinationResponse,
  sustainability: DestinationSustainabilityResponse | null,
): DestinationViewModel {
  const factors = sustainability?.factor_scores;
  const crowdCondition = Number(factors?.crowd ?? destination.factor?.crowd_score ?? 0);
  // The base destination response has a crowd-condition score, not a forecast.
  // Invert it only for legacy UI compatibility and label it as a proxy in screens.
  const crowdPressureProxy = Math.round(100 - crowdCondition);
  const contributions = sustainability?.weighted_contributions;

  return {
    id: destination.slug,
    name: destination.name,
    district: destination.district,
    province: destination.region,
    tagline: destination.description,
    description: destination.description,
    image: destination.image_url || FALLBACK_IMAGES[destination.id % FALLBACK_IMAGES.length],
    tags: destination.activities.map(titleCase),
    activities: destination.activities.map(titleCase),
    landscape: titleCase(destination.landscape_type) as Destination['landscape'],
    typicalBudgetLKR: Number(destination.typical_budget),
    recommendedDurationDays: destination.recommended_max_trip_duration,
    coordinates: {
      lat: Number(destination.latitude),
      lng: Number(destination.longitude),
      mapXPercent: 0,
      mapYPercent: 0,
    },
    sustainability: {
      overall: Number(sustainability?.total_score ?? 0),
      environmental: Number(factors?.environmental ?? destination.factor?.environmental_score ?? 0),
      communityBenefit: Number(factors?.community ?? destination.factor?.community_benefit_score ?? 0),
      crowd: Number(crowdCondition),
      infrastructure: Number(factors?.infrastructure ?? destination.factor?.infrastructure_score ?? 0),
      touristSuitability: Number(factors?.suitability ?? destination.factor?.tourist_suitability_score ?? 0),
    },
    pressure: {
      score: crowdPressureProxy,
      level: pressureLevel(crowdPressureProxy),
      visitorDensity: crowdPressureProxy,
      infrastructurePressure: 0,
      wastePressure: 0,
      traffic: 0,
    },
    xaiExplanation: {
      summary: sustainability
        ? `Calculated with sustainability configuration ${sustainability.configuration_version}.`
        : 'No sustainability factor data is available for this destination.',
      contributions: contributions
        ? [
            ['Environmental', contributions.environmental],
            ['Community benefit', contributions.community],
            ['Crowd condition', contributions.crowd],
            ['Infrastructure', contributions.infrastructure],
            ['Tourist suitability', contributions.suitability],
          ].map(([factor, value]) => ({
            factor: String(factor),
            percentage: Number(value),
            positive: Number(value) >= 0,
          }))
        : [],
    },
    dataConfidence: destination.factor?.confidence_level,
    api: destination,
    sustainabilityData: sustainability,
  };
}

export function mapDestinations(destinations: DestinationResponse[]) {
  return destinations.map((destination) =>
    mapDestination(destination, destination.sustainability),
  );
}
