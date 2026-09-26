export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type FactorValueType = 'MEASURED' | 'ESTIMATED' | 'PROXY';
export type ApiDecimal = string;
export type PressureBand = 'LOW' | 'MEDIUM' | 'HIGH';
export type PressureRegion = 'Ancient Cities' | 'Colombo City' | 'East Coast' | 'Greater Colombo' | 'Hill Country' | 'Northern Region' | 'South Coast';
export type EnvironmentalObservationType = 'WEATHER' | 'AIR_QUALITY';
export type EnvironmentalValue = string | number;

export interface EnvironmentalObservationResponse {
  id: number;
  destination_id: number;
  observation_type: EnvironmentalObservationType;
  values: Record<string, EnvironmentalValue>;
  source: string;
  source_location: string;
  observed_at: string;
  fetched_at: string;
  age_minutes: number;
  is_stale: boolean;
}

export interface EnvironmentalSnapshotResponse {
  destination_id: number;
  weather: EnvironmentalObservationResponse | null;
  air_quality: EnvironmentalObservationResponse | null;
}

export type EnvironmentalRefreshStatus = 'UPDATED' | 'UNCHANGED' | 'FALLBACK' | 'UNAVAILABLE';

export interface EnvironmentalRefreshResponse {
  status: EnvironmentalRefreshStatus;
  observation: EnvironmentalObservationResponse | null;
  fallback_reason: string | null;
}

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
  pressure_region: PressureRegion | null;
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

export interface RegionalPressureSummary {
  scope: 'REGIONAL';
  region: string;
  predicted_occupancy_rate: number;
  band: PressureBand;
  model_version: string;
}

export interface AlternativeReason {
  same_landscape: boolean;
  shared_activities: string[];
  pressure_reduction_percentage_points: number;
  straight_line_distance_km: number;
}

export interface AlternativeDestination {
  destination: DestinationResponse;
  similarity_score: number;
  similarity_percentage: number;
  pressure: RegionalPressureSummary;
  sustainability_score: ApiDecimal;
  sustainability_configuration_version: string;
  reason: AlternativeReason;
}

export type DestinationAlternativesStatus =
  | 'ALTERNATIVES_FOUND'
  | 'SOURCE_NOT_HIGH_PRESSURE'
  | 'NO_ELIGIBLE_ALTERNATIVES';

export interface DestinationAlternativesResponse {
  source_destination_id: number;
  source_destination_slug: string;
  month: string;
  source_pressure: RegionalPressureSummary;
  status: DestinationAlternativesStatus;
  alternatives: AlternativeDestination[];
}

export interface DestinationCreate {
  slug: string;
  name: string;
  district: string;
  region: string;
  pressure_region?: PressureRegion | null;
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

export interface DestinationPressureResponse {
  destination_id: number;
  destination_slug: string;
  scope: 'REGIONAL';
  region: string;
  month: string;
  predicted_regional_occupancy_rate: number;
  band: PressureBand;
  model_version: string;
  prediction_type: string;
  forecast_mode: string;
  forecast_month: string | null;
  previous_occupancy: number | null;
  predicted_residual: number | null;
  predicted_occupancy: number | null;
  pressure_band: PressureBand | null;
}

export interface PressureFeatureContribution {
  feature_name: string;
  feature: string | null;
  display_name: string;
  input_value: string | number;
  feature_value: string | number | null;
  shap_value: number;
  direction: 'increase' | 'decrease' | 'neutral' | 'INCREASES' | 'DECREASES' | 'NEUTRAL';
}

export interface DestinationPressureExplanationResponse extends DestinationPressureResponse {
  explanation_method: 'TreeSHAP';
  contribution_kind: 'model_explanation';
  raw_model_prediction: number;
  base_value: number;
  input_features: Record<string, string | number>;
  feature_contributions: PressureFeatureContribution[];
  plain_language_explanation: string;
  base_residual: number | null;
  top_positive_factors: PressureFeatureContribution[];
  top_negative_factors: PressureFeatureContribution[];
  explanation_text: string | null;
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

export interface MapDestination {
  id: number;
  slug: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  sustainability_score: number | null;
  tourism_pressure_level: PressureBand | null;
  tourism_pressure_value: number | null;
  environmental_score: number | null;
  community_score: number | null;
}

export interface MapDestinationsResponse {
  month: string;
  pressure_scope: 'REGIONAL';
  pressure_model_version: string | null;
  destinations: MapDestination[];
}

export interface AdminDashboardResponse {
  month: string;
  pressure_scope: 'REGIONAL';
  pressure_model_version: string | null;
  total_active_destinations: number;
  monitored_destinations: number;
  without_pressure_forecast: number;
  pressure_counts: {
    low: number;
    medium: number;
    high: number;
  };
  highest_pressure_destinations: Array<{
    id: number;
    slug: string;
    name: string;
    region: string;
    pressure_level: PressureBand;
    predicted_regional_occupancy_rate: number;
    sustainability_score: number | null;
  }>;
  sustainability: {
    scored_destinations: number;
    average_score: number | null;
    minimum_score: number | null;
    maximum_score: number | null;
    average_environmental_score: number | null;
    average_community_score: number | null;
  };
  recommended_action: {
    code: 'REVIEW_HIGH_PRESSURE' | 'MONITOR_MEDIUM_PRESSURE' | 'MAINTAIN_MONITORING' | 'NO_FORECAST_DATA';
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    message: string;
    destination_ids: number[];
  };
}
