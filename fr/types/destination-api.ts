export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type FactorValueType = 'MEASURED' | 'ESTIMATED' | 'PROXY';
export type ApiDecimal = string;

export interface DestinationFactorInput {
  environmental_score: number;
  community_benefit_score: number;
  crowd_score: number;
  infrastructure_score: number;
  tourist_suitability_score: number;
  data_source: string;
  confidence_level: ConfidenceLevel;
  value_type: FactorValueType;
  last_updated: string;
}

export interface DestinationFactorResponse {
  id: number;
  destination_id: number;
  environmental_score: ApiDecimal;
  community_benefit_score: ApiDecimal;
  crowd_score: ApiDecimal;
  infrastructure_score: ApiDecimal;
  tourist_suitability_score: ApiDecimal;
  data_source: string;
  confidence_level: ConfidenceLevel;
  value_type: FactorValueType;
  last_updated: string;
}

export interface DestinationResponse {
  id: number;
  slug: string;
  name: string;
  district: string;
  region: string;
  description: string;
  image_url: string | null;
  latitude: ApiDecimal;
  longitude: ApiDecimal;
  landscape_type: string;
  typical_budget: ApiDecimal;
  recommended_min_trip_duration: number;
  recommended_max_trip_duration: number;
  is_active: boolean;
  activities: string[];
  factor: DestinationFactorResponse | null;
  created_at: string;
  updated_at: string;
  sustainability: DestinationSustainabilityResponse | null;
}

export interface DestinationCreate {
  slug: string;
  name: string;
  district: string;
  region: string;
  description: string;
  image_url?: string | null;
  latitude: number;
  longitude: number;
  landscape_type: string;
  typical_budget: number;
  recommended_min_trip_duration: number;
  recommended_max_trip_duration: number;
  is_active?: boolean;
  activities: string[];
  factor?: DestinationFactorInput | null;
}

export type DestinationUpdate = Partial<DestinationCreate>;

export interface SustainabilityFactorScores {
  environmental: ApiDecimal;
  community: ApiDecimal;
  crowd: ApiDecimal;
  infrastructure: ApiDecimal;
  suitability: ApiDecimal;
}

export interface SustainabilityValues {
  environmental: ApiDecimal;
  community: ApiDecimal;
  crowd: ApiDecimal;
  infrastructure: ApiDecimal;
  suitability: ApiDecimal;
}

export interface DestinationSustainabilityResponse {
  destination_id: number;
  destination_slug: string;
  total_score: ApiDecimal;
  factor_scores: SustainabilityFactorScores;
  configured_weights: SustainabilityValues;
  weighted_contributions: SustainabilityValues;
  configuration_version: string;
}

export interface SimulationScenario {
  expected_visitor_level: number;
  waste_management_level: number;
  infrastructure_level: number;
}

export interface DestinationSimulationResponse {
  destination_id: number;
  destination_slug: string;
  scenario: SimulationScenario;
  baseline_scenario: SimulationScenario;
  original_score: ApiDecimal;
  simulated_score: ApiDecimal;
  score_delta: ApiDecimal;
  original_factors: SustainabilityFactorScores;
  simulated_factors: SustainabilityFactorScores;
  changed_factors: Record<string, { original: ApiDecimal; simulated: ApiDecimal; delta: ApiDecimal }>;
  sustainability_configuration_version: string;
  simulation_policy_version: string;
  explanation: string;
}

export interface DestinationFilters {
  region?: string;
  landscape?: string;
  activity?: string;
  active?: boolean;
}
