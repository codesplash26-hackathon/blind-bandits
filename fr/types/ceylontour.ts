export type Role = 'TOURIST' | 'ADMIN';

export type CrowdPreference = 'quiet' | 'balanced' | 'popular';

export type PressureLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SustainabilityBreakdown {
  overall: number; // 0 - 100
  environmental: number; // 0 - 100
  communityBenefit: number; // 0 - 100
  crowd: number; // 0 - 100
  infrastructure: number; // 0 - 100
  touristSuitability: number; // 0 - 100
}

export interface PressureBreakdown {
  score: number; // 0 - 100%
  level: PressureLevel;
  visitorDensity: number; // e.g. 40%
  infrastructurePressure: number; // e.g. 25%
  wastePressure: number; // e.g. 20%
  traffic: number; // e.g. 15%
}

export interface XAIContribution {
  factor: string;
  percentage: number;
  positive: boolean;
  description?: string;
}

export interface XAIExplanation {
  summary: string;
  contributions: XAIContribution[];
}

export interface DestinationAlternative {
  id: string;
  name: string;
  district: string;
  similarity: number; // e.g. 82%
  pressureLevel: PressureLevel;
  sustainabilityScore: number;
  tagline?: string;
}

export interface Destination {
  id: string;
  name: string;
  district: string;
  province: string;
  tagline: string;
  description: string;
  image: string;
  tags: string[];
  activities: string[];
  landscape: string;
  typicalBudgetLKR: number;
  recommendedDurationDays: number;
  coordinates: {
    lat: number;
    lng: number;
    mapXPercent: number; // percentage coordinate for custom Sri Lanka SVG map
    mapYPercent: number;
  };
  sustainability: SustainabilityBreakdown;
  pressure: PressureBreakdown;
  xaiExplanation: XAIExplanation;
  alternatives?: DestinationAlternative[];
  weather?: string;
  airQuality?: string;
  dataConfidence?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TouristPreferences {
  budgetLKR: number;
  durationDays: number;
  interests: string[];
  crowdPreference: CrowdPreference;
  sustainabilityImportance: number; // 0 - 100
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
