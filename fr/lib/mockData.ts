import {
  Destination,
  TouristPreferences,
} from '@/types/ceylontour';

export const DESTINATIONS: Destination[] = [
  {
    id: 'belihuloya',
    name: 'Belihuloya',
    district: 'Ratnapura',
    province: 'Sabaragamuwa',
    tagline: 'Peaceful mountain haven surrounded by waterfalls and hiking trails',
    description:
      'A serene mountain destination situated where the central hills descend into the lowlands. Belihuloya is renowned for non-motorized eco-trails, pristine waterways, biodiversity, and small-scale community homestays.',
    image: '/samanthaweerasinghe-devils-staircase-5346794_1920.jpg',
    tags: ['Nature', 'Hiking', 'Waterfalls', 'Adventure', 'Relaxation'],
    activities: ['Trekking to Hawagala', 'Brampton Falls walk', 'River bath', 'Bird watching', 'Village culinary trail'],
    landscape: 'Mountains',
    typicalBudgetLKR: 45000,
    recommendedDurationDays: 3,
    coordinates: {
      lat: 6.7144,
      lng: 80.7686,
      mapXPercent: 51,
      mapYPercent: 68,
    },
    sustainability: {
      overall: 89,
      environmental: 92,
      communityBenefit: 88,
      crowd: 91,
      infrastructure: 76,
      touristSuitability: 90,
    },
    pressure: {
      score: 28,
      level: 'LOW',
      visitorDensity: 20,
      infrastructurePressure: 25,
      wastePressure: 28,
      traffic: 12,
    },
    weather: '23°C • Clear & Crisp',
    airQuality: 'AQI 18 • Excellent',
    dataConfidence: 'HIGH',
  },
  {
    id: 'ella',
    name: 'Ella',
    district: 'Badulla',
    province: 'Uva',
    tagline: 'World-famous mountain gap experiencing peak visitor concentration',
    description:
      'Nestled among misty tea estates and dramatic cliffs, Ella is one of Sri Lanka’s most popular stops. However, severe influx along Nine Arch Bridge and Ella Rock has put strain on local waste and traffic systems.',
    image: '/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg',
    tags: ['Nature', 'Hiking', 'Scenic Views', 'Adventure'],
    activities: ['Nine Arch Bridge', 'Little Adam’s Peak', 'Ella Rock hike', 'Ravana Falls'],
    landscape: 'Mountains',
    typicalBudgetLKR: 65000,
    recommendedDurationDays: 3,
    coordinates: {
      lat: 6.8667,
      lng: 81.0466,
      mapXPercent: 57,
      mapYPercent: 65,
    },
    sustainability: {
      overall: 72,
      environmental: 68,
      communityBenefit: 85,
      crowd: 42,
      infrastructure: 74,
      touristSuitability: 89,
    },
    pressure: {
      score: 82,
      level: 'HIGH',
      visitorDensity: 40,
      infrastructurePressure: 25,
      wastePressure: 20,
      traffic: 15,
    },
    alternatives: [
      {
        id: 'haputale',
        name: 'Haputale',
        district: 'Badulla',
        similarity: 82,
        pressureLevel: 'MEDIUM',
        sustainabilityScore: 84,
        tagline: 'Misty tea ridges and Lipton’s Seat with 40% fewer crowds',
      },
      {
        id: 'belihuloya',
        name: 'Belihuloya',
        district: 'Ratnapura',
        similarity: 76,
        pressureLevel: 'LOW',
        sustainabilityScore: 89,
        tagline: 'Pristine rivers, hiking, and peaceful mountain atmosphere',
      },
      {
        id: 'meemure',
        name: 'Meemure',
        district: 'Matale',
        similarity: 70,
        pressureLevel: 'LOW',
        sustainabilityScore: 81,
        tagline: 'Untouched traditional mountain village in Knuckles foothills',
      },
    ],
    weather: '21°C • Passing Mist',
    airQuality: 'AQI 32 • Good',
    dataConfidence: 'HIGH',
  },
  {
    id: 'haputale',
    name: 'Haputale',
    district: 'Badulla',
    province: 'Uva',
    tagline: 'Panoramic cloud forest ridges and heritage tea country',
    description:
      'Perched on the southern edge of the hill country with views extending down to the coast on clear days. Haputale retains a calmer tempo than Ella, offering authentic estate life and cloud-forest biodiversity.',
    image: '/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg',
    tags: ['Nature', 'Hiking', 'Heritage', 'Relaxation'],
    activities: ['Lipton’s Seat viewpoint', 'Dambatenne Tea Factory', 'Adisham St. Benedict’s Monastery', 'Idalgashinna trail'],
    landscape: 'Mountains',
    typicalBudgetLKR: 48000,
    recommendedDurationDays: 3,
    coordinates: {
      lat: 6.7681,
      lng: 80.9575,
      mapXPercent: 55,
      mapYPercent: 67,
    },
    sustainability: {
      overall: 84,
      environmental: 86,
      communityBenefit: 82,
      crowd: 85,
      infrastructure: 79,
      touristSuitability: 88,
    },
    pressure: {
      score: 54,
      level: 'MEDIUM',
      visitorDensity: 32,
      infrastructurePressure: 28,
      wastePressure: 24,
      traffic: 16,
    },
    weather: '19°C • Cool Breezes',
    airQuality: 'AQI 14 • Excellent',
    dataConfidence: 'HIGH',
  },
  {
    id: 'meemure',
    name: 'Meemure',
    district: 'Matale',
    province: 'Central',
    tagline: 'Ancient secluded village cradled beneath Lakegala peak',
    description:
      'One of the most remote settlements in Sri Lanka, accessible through a winding mountain track in the Knuckles Range. Preserves organic ancient farming, stone fences, and community-led eco-guiding.',
    image: '/samanthaweerasinghe-devils-staircase-5346794_1920.jpg',
    tags: ['Nature', 'Culture', 'Hiking', 'Adventure'],
    activities: ['Lakegala mountain trek', 'Natural water sliding', 'Chena farm experience', 'Traditional village lunch'],
    landscape: 'Rural',
    typicalBudgetLKR: 38000,
    recommendedDurationDays: 2,
    coordinates: {
      lat: 7.4333,
      lng: 80.85,
      mapXPercent: 53,
      mapYPercent: 51,
    },
    sustainability: {
      overall: 81,
      environmental: 95,
      communityBenefit: 90,
      crowd: 94,
      infrastructure: 55,
      touristSuitability: 72,
    },
    pressure: {
      score: 31,
      level: 'LOW',
      visitorDensity: 18,
      infrastructurePressure: 38,
      wastePressure: 22,
      traffic: 22,
    },
    weather: '24°C • Humid & Sunny',
    airQuality: 'AQI 12 • Pristine',
    dataConfidence: 'MEDIUM',
  },
  {
    id: 'sigiriya',
    name: 'Sigiriya',
    district: 'Matale',
    province: 'Central',
    tagline: 'UNESCO 5th-century rock fortress experiencing high peak-season visitor queues',
    description:
      'A masterwork of ancient urban planning, hydraulic gardens, and mirror-wall frescoes. While globally iconic, midday ticket queues and summit staircase bottlenecks present significant crowd pressure.',
    image: '/poswiecie-sigiriya-459197_1920.jpg',
    tags: ['Culture', 'Heritage', 'History', 'Scenic Views'],
    activities: ['Lion Rock climb', 'Pidurangala sunrise hike', 'Water gardens walk', 'Archaeological museum'],
    landscape: 'Cultural',
    typicalBudgetLKR: 55000,
    recommendedDurationDays: 2,
    coordinates: {
      lat: 7.957,
      lng: 80.7603,
      mapXPercent: 51,
      mapYPercent: 42,
    },
    sustainability: {
      overall: 76,
      environmental: 78,
      communityBenefit: 84,
      crowd: 46,
      infrastructure: 86,
      touristSuitability: 88,
    },
    pressure: {
      score: 79,
      level: 'HIGH',
      visitorDensity: 45,
      infrastructurePressure: 22,
      wastePressure: 18,
      traffic: 15,
    },
    alternatives: [
      {
        id: 'knuckles',
        name: 'Knuckles Range',
        district: 'Kandy / Matale',
        similarity: 68,
        pressureLevel: 'LOW',
        sustainabilityScore: 92,
        tagline: 'Cloud forest peaks and ancient ruins with pristine solitude',
      },
    ],
    weather: '30°C • Sunny',
    airQuality: 'AQI 36 • Good',
    dataConfidence: 'HIGH',
  },
  {
    id: 'yala',
    name: 'Yala National Park',
    district: 'Hambantota',
    province: 'Southern',
    tagline: 'Renowned leopard sanctuary facing safari jeep density challenges',
    description:
      'Home to the highest density of leopards in Asia alongside elephants, sloth bears, and migratory birds. Block 1 encounters significant safari convoy congestion during morning and evening drives.',
    image: '/samanthaweerasinghe-devils-staircase-5346794_1920.jpg',
    tags: ['Wildlife', 'Adventure', 'Nature', 'Photography'],
    activities: ['Block 1 leopard safari', 'Bird watching lagoons', 'Sithulpawwa rock monastery', 'Coastal sand dunes'],
    landscape: 'Wildlife',
    typicalBudgetLKR: 75000,
    recommendedDurationDays: 2,
    coordinates: {
      lat: 6.3688,
      lng: 81.5204,
      mapXPercent: 68,
      mapYPercent: 74,
    },
    sustainability: {
      overall: 70,
      environmental: 74,
      communityBenefit: 80,
      crowd: 40,
      infrastructure: 78,
      touristSuitability: 82,
    },
    pressure: {
      score: 74,
      level: 'HIGH',
      visitorDensity: 42,
      infrastructurePressure: 24,
      wastePressure: 16,
      traffic: 18,
    },
    alternatives: [
      {
        id: 'sinharaja',
        name: 'Sinharaja Rainforest',
        district: 'Ratnapura',
        similarity: 78,
        pressureLevel: 'LOW',
        sustainabilityScore: 94,
        tagline: 'Quiet guided canopy walks with endemic birds and reptiles',
      },
    ],
    weather: '31°C • Warm & Dry',
    airQuality: 'AQI 22 • Good',
    dataConfidence: 'HIGH',
  },
  {
    id: 'mirissa',
    name: 'Mirissa',
    district: 'Matara',
    province: 'Southern',
    tagline: 'Crescent beach famous for blue whale watching and coastal sunsets',
    description:
      'A lively bay known for coconut palm groves and ocean excursions. Mirissa is transitioning toward responsible marine wildlife guidelines to curb boat crowding around migrating whales.',
    image: '/tomas-malik-6BQyHtYSb5E-unsplash.jpg',
    tags: ['Beach', 'Wildlife', 'Relaxation', 'Water Sports'],
    activities: ['Ethical whale safari', 'Coconut Tree Hill sunset', 'Secret Beach swimming', 'Surfing reef break'],
    landscape: 'Coastal',
    typicalBudgetLKR: 52000,
    recommendedDurationDays: 3,
    coordinates: {
      lat: 5.9482,
      lng: 80.4578,
      mapXPercent: 44,
      mapYPercent: 84,
    },
    sustainability: {
      overall: 75,
      environmental: 72,
      communityBenefit: 86,
      crowd: 62,
      infrastructure: 80,
      touristSuitability: 86,
    },
    pressure: {
      score: 60,
      level: 'MEDIUM',
      visitorDensity: 36,
      infrastructurePressure: 26,
      wastePressure: 22,
      traffic: 16,
    },
    weather: '29°C • Tropical Ocean Breeze',
    airQuality: 'AQI 20 • Excellent',
    dataConfidence: 'HIGH',
  },
  {
    id: 'knuckles',
    name: 'Knuckles Mountain Range',
    district: 'Matale / Kandy',
    province: 'Central',
    tagline: 'UNESCO World Heritage cloud forest with rugged peaks and cascading streams',
    description:
      'Resembling the knuckles of a clenched fist, this protected reserve hosts over 34 isolated peaks, mist forests, and endemic amphibian species. Strictly regulated eco-permits preserve pristine conditions.',
    image: '/samanthaweerasinghe-devils-staircase-5346794_1920.jpg',
    tags: ['Nature', 'Hiking', 'Adventure', 'Wildlife'],
    activities: ['Corbett’s Gap hike', 'Dumbara valley walk', 'Mini World’s End trek', 'Amphibian night photography'],
    landscape: 'Mountains',
    typicalBudgetLKR: 42000,
    recommendedDurationDays: 3,
    coordinates: {
      lat: 7.4667,
      lng: 80.7833,
      mapXPercent: 52,
      mapYPercent: 50,
    },
    sustainability: {
      overall: 92,
      environmental: 96,
      communityBenefit: 88,
      crowd: 95,
      infrastructure: 72,
      touristSuitability: 89,
    },
    pressure: {
      score: 22,
      level: 'LOW',
      visitorDensity: 14,
      infrastructurePressure: 26,
      wastePressure: 15,
      traffic: 10,
    },
    weather: '20°C • Fresh Mountain Breeze',
    airQuality: 'AQI 8 • Pristine',
    dataConfidence: 'HIGH',
  },
  {
    id: 'sinharaja',
    name: 'Sinharaja Rainforest',
    district: 'Ratnapura',
    province: 'Sabaragamuwa',
    tagline: 'Last viable primeval tropical rainforest in Sri Lanka',
    description:
      'A virgin rainforest of international significance, home to more than 60% of Sri Lanka’s endemic trees and 50% of endemic mammals and butterflies. Walking trails are led strictly by certified forest guides.',
    image: '/samanthaweerasinghe-devils-staircase-5346794_1920.jpg',
    tags: ['Nature', 'Wildlife', 'Hiking', 'Adventure'],
    activities: ['Moulawella peak trek', 'Bird mixed-feeding flock tracking', 'Giant waterfall bath', 'Medicinal plant tour'],
    landscape: 'Rainforest',
    typicalBudgetLKR: 40000,
    recommendedDurationDays: 2,
    coordinates: {
      lat: 6.4167,
      lng: 80.4667,
      mapXPercent: 44,
      mapYPercent: 73,
    },
    sustainability: {
      overall: 94,
      environmental: 98,
      communityBenefit: 92,
      crowd: 96,
      infrastructure: 74,
      touristSuitability: 88,
    },
    pressure: {
      score: 18,
      level: 'LOW',
      visitorDensity: 12,
      infrastructurePressure: 20,
      wastePressure: 10,
      traffic: 8,
    },
    weather: '25°C • Tropical Rainforest Showers',
    airQuality: 'AQI 6 • Pristine',
    dataConfidence: 'HIGH',
  },
  {
    id: 'kandy',
    name: 'Kandy',
    district: 'Kandy',
    province: 'Central',
    tagline: 'Historic hill capital cradling the Temple of the Sacred Tooth Relic',
    description:
      'Surrounded by tea-covered mountains and an artificial lake, Kandy is the spiritual heart of Sri Lanka. Cultural pageantry and botanical sanctuaries coexist with busy valley traffic.',
    image: '/musthaqsms-temple-204803_1920.jpg',
    tags: ['Culture', 'Heritage', 'History', 'Relaxation'],
    activities: ['Temple of the Tooth Relic', 'Peradeniya Royal Botanical Gardens', 'Kandy Lake perimeter walk', 'Udawatta Kele birding'],
    landscape: 'Cultural',
    typicalBudgetLKR: 58000,
    recommendedDurationDays: 2,
    coordinates: {
      lat: 7.2906,
      lng: 80.6337,
      mapXPercent: 48,
      mapYPercent: 54,
    },
    sustainability: {
      overall: 73,
      environmental: 70,
      communityBenefit: 86,
      crowd: 58,
      infrastructure: 84,
      touristSuitability: 88,
    },
    pressure: {
      score: 68,
      level: 'MEDIUM',
      visitorDensity: 38,
      infrastructurePressure: 28,
      wastePressure: 20,
      traffic: 22,
    },
    weather: '26°C • Mild & Pleasant',
    airQuality: 'AQI 42 • Moderate',
    dataConfidence: 'HIGH',
  },
];

export const DEFAULT_TOURIST_PREFERENCES: TouristPreferences = {
  budgetLKR: 50000,
  durationDays: 4,
  interests: ['Nature', 'Hiking', 'Waterfalls'],
  crowdPreference: 'quiet',
  sustainabilityImportance: 85,
};

export const INTEREST_OPTIONS = [
  'Nature',
  'Beach',
  'Wildlife',
  'Adventure',
  'Culture',
  'Heritage',
  'Hiking',
  'Relaxation',
  'Waterfalls',
  'Photography',
];

/**
 * Interactive What-If Simulator calculation function:
 * Directly models the 3-slider design in the proposal:
 * 1. Expected visitors (e.g. 2,000 to 12,000)
 * 2. Waste management (Poor to Excellent)
 * 3. Infrastructure (Limited to Strong)
 */
export function simulateSustainabilityScore(
  baseScore: number,
  basePressure: number,
  visitorVolume: number, // 0 to 100 normalized
  wasteManagement: number, // 0 to 100 normalized
  infrastructure: number // 0 to 100 normalized
): {
  simulatedSustainability: number;
  simulatedPressure: number;
  deltaSustainability: number;
  deltaPressure: number;
  alertMessage: string;
} {
  // Visitor impact: higher visitors increases pressure and decreases sustainability
  const visitorImpact = (visitorVolume - 50) * 0.32;
  // Waste impact: better waste management increases sustainability
  const wasteImpact = (wasteManagement - 50) * 0.18;
  // Infrastructure impact: stronger infrastructure mitigates pressure and improves suitability
  const infraImpact = (infrastructure - 50) * 0.22;

  let newSustainability = Math.round(baseScore - visitorImpact + wasteImpact + infraImpact * 0.6);
  newSustainability = Math.min(99, Math.max(25, newSustainability));

  let newPressure = Math.round(basePressure + visitorImpact * 1.1 - infraImpact * 0.4 - wasteImpact * 0.2);
  newPressure = Math.min(100, Math.max(10, newPressure));

  const deltaSustainability = newSustainability - baseScore;
  const deltaPressure = newPressure - basePressure;

  let alertMessage = '';
  if (deltaSustainability < -8) {
    alertMessage = '⚠️ Increased visitor volume significantly reduces this destination’s sustainability score.';
  } else if (deltaSustainability > 5) {
    alertMessage = '✨ Upgraded waste diversion and eco-infrastructure improve the resilience score substantially.';
  } else {
    alertMessage = 'ℹ️ Destination metrics remain stable within normal carrying capacity tolerances.';
  }

  return {
    simulatedSustainability: newSustainability,
    simulatedPressure: newPressure,
    deltaSustainability,
    deltaPressure,
    alertMessage,
  };
}
