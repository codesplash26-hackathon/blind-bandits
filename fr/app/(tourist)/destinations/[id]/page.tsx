'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Heart,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Leaf,
  CloudSun,
  Wind,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DESTINATIONS, simulateSustainabilityScore } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DestinationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const destinationId = resolvedParams.id;

  const { isSaved, toggleSaveDestination } = useAuth();

  const destination = DESTINATIONS.find((d) => d.id === destinationId);

  // What-If Simulator state (defaults at 50 / baseline)
  const [visitorSlider, setVisitorSlider] = useState(50);
  const [wasteSlider, setWasteSlider] = useState(50);
  const [infraSlider, setInfraSlider] = useState(50);
  const [showSimulator, setShowSimulator] = useState(true);

  if (!destination) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Destination Not Found</h2>
        <Link href="/destinations">
          <Button variant="outline">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isBookmarked = isSaved(destination.id);
  const isHighPressure = destination.pressure.level === 'HIGH';

  // Calculate live What-If simulation
  const simulation = simulateSustainabilityScore(
    destination.sustainability.overall,
    destination.pressure.score,
    visitorSlider,
    wasteSlider,
    infraSlider
  );

  const getPressureBadgeVariant = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb / Return */}
      <div className="flex items-center justify-between">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Destinations</span>
        </Link>

        <button
          type="button"
          onClick={() => toggleSaveDestination(destination.id)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              : 'bg-card hover:bg-muted text-foreground border-border'
          }`}
        >
          <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{isBookmarked ? 'Saved Destination' : 'Save Destination'}</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card shadow-lg">
        {/* Full-width Scenic Image */}
        <div className="relative h-72 sm:h-96 w-full">
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
              <MapPin className="w-3.5 h-3.5 text-secondary" />
              <span>{destination.district} District, {destination.province}</span>
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-medium text-white/90">
              {destination.landscape}
            </span>
          </div>

          {/* Hero Content on Image Bottom */}
          <div className="absolute bottom-6 inset-x-6 text-white space-y-2">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {destination.name}
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-2xl font-light">
              {destination.tagline}
            </p>
          </div>
        </div>

        {/* Hero Score Ribbon */}
        <div className="p-6 bg-card border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Sustainability Metric */}
          <div className="pt-2 sm:pt-0 sm:px-4 text-center sm:text-left">
            <span className="text-[11px] uppercase font-bold text-muted-foreground block">
              Sustainability Index
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {destination.sustainability.overall}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <Leaf className="w-3 h-3" /> Certified Standard
            </span>
          </div>

          {/* Tourism Pressure Metric */}
          <div className="pt-2 sm:pt-0 sm:px-4 text-center sm:text-left">
            <span className="text-[11px] uppercase font-bold text-muted-foreground block">
              Tourism Pressure
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-heading text-3xl font-extrabold text-foreground">
                {destination.pressure.score}%
              </span>
              <Badge variant={getPressureBadgeVariant(destination.pressure.level)}>
                {destination.pressure.level}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Visitor density & carrying load
            </span>
          </div>

          {/* Typical Budget */}
          <div className="pt-2 sm:pt-0 sm:px-4 text-center sm:text-left">
            <span className="text-[11px] uppercase font-bold text-muted-foreground block">
              Typical Budget
            </span>
            <span className="font-heading text-xl font-bold text-foreground mt-1 block font-mono">
              LKR {destination.typicalBudgetLKR.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground">Est. 3-day conscious stay</span>
          </div>

          {/* Recommended Duration */}
          <div className="pt-2 sm:pt-0 sm:px-4 text-center sm:text-left">
            <span className="text-[11px] uppercase font-bold text-muted-foreground block">
              Suggested Duration
            </span>
            <span className="font-heading text-xl font-bold text-foreground mt-1 block">
              {destination.recommendedDurationDays} Days
            </span>
            <span className="text-[11px] text-muted-foreground">Recommended pace</span>
          </div>
        </div>
      </div>

      {/* OVERTOURISM WARNING SECTION (Shown prominently if High Pressure) */}
      {isHighPressure && (
        <div className="rounded-3xl border-2 border-rose-500/40 bg-rose-500/5 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-rose-700 dark:text-rose-400">
                  Overtourism Alert: High Visitor Pressure ({destination.pressure.score}%)
                </h2>
                <Badge variant="destructive">CRITICAL CONCENTRATION</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                This destination is currently experiencing peak visitor concentration. High footfall along viewpoints and trail bottlenecks causes stress on local waste processing and roads.
              </p>
            </div>
          </div>

          {/* Pressure Factor Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-rose-500/20">
            <div className="p-3 rounded-xl bg-background/80 border border-rose-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Visitor Density</span>
              <span className="text-base font-extrabold text-rose-600">{destination.pressure.visitorDensity}%</span>
            </div>
            <div className="p-3 rounded-xl bg-background/80 border border-rose-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Infra Pressure</span>
              <span className="text-base font-extrabold text-rose-600">{destination.pressure.infrastructurePressure}%</span>
            </div>
            <div className="p-3 rounded-xl bg-background/80 border border-rose-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Waste Strain</span>
              <span className="text-base font-extrabold text-rose-600">{destination.pressure.wastePressure}%</span>
            </div>
            <div className="p-3 rounded-xl bg-background/80 border border-rose-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Traffic Density</span>
              <span className="text-base font-extrabold text-rose-600">{destination.pressure.traffic}%</span>
            </div>
          </div>

          {/* Consider These Alternatives Callout */}
          {destination.alternatives && destination.alternatives.length > 0 && (
            <div className="pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Consider these lower-pressure alternatives
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Same scenic landscapes and mountain trails with less congestion
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {destination.alternatives.map((alt) => (
                  <Link
                    key={alt.id}
                    href={`/destinations/${alt.id}`}
                    className="group p-4 rounded-2xl bg-card border border-border/80 hover:border-secondary transition-all hover:shadow-md space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-secondary">
                          {alt.similarity}% similar
                        </span>
                        <Badge variant={getPressureBadgeVariant(alt.pressureLevel)}>
                          {alt.pressureLevel}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-foreground mt-1 group-hover:text-secondary transition-colors">
                        {alt.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {alt.tagline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Sustainability:</span>
                      <span className="font-extrabold text-emerald-600">{alt.sustainabilityScore}/100</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 Cols): Sustainability Breakdown & XAI TreeSHAP Explanation */}
        <div className="lg:col-span-7 space-y-8">
          {/* Sustainability 5-Dimension Breakdown */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Sustainability Breakdown</h2>
              <p className="text-xs text-muted-foreground">
                Evaluated across 5 core indicators of the CeylonTour Sustainability Index
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              {[
                { label: 'Environmental Preservation', value: destination.sustainability.environmental, desc: 'Forest cover, biodiversity, and clean water' },
                { label: 'Community Benefit', value: destination.sustainability.communityBenefit, desc: 'Revenue retention for local homestays & guides' },
                { label: 'Crowd & Density Index', value: destination.sustainability.crowd, desc: 'Visitor carrying capacity and trail tranquility' },
                { label: 'Eco-Infrastructure', value: destination.sustainability.infrastructure, desc: 'Waste diversion, clean energy, and transit' },
                { label: 'Tourist Suitability', value: destination.sustainability.touristSuitability, desc: 'Comfort, trail safety, and hospitality quality' },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground hidden sm:inline ml-1.5">({item.desc})</span>
                    </div>
                    <span className="font-bold text-foreground font-mono">{item.value}/100</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable AI (XAI) Why this was recommended */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <h2 className="text-lg font-bold text-foreground">
                    Why was {destination.name} recommended?
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Explainable AI (XAI TreeSHAP) feature contribution breakdown
                </p>
              </div>
              <Badge variant="outline">XAI Model</Badge>
            </div>

            {/* Narrative Explanation */}
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                &ldquo;{destination.xaiExplanation.summary}&rdquo;
              </p>
            </div>

            {/* TreeSHAP Contribution Bar Chart */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Factor Contribution Weights
              </span>

              {destination.xaiExplanation.contributions.map((c) => (
                <div key={c.factor} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{c.factor}</span>
                    <span className={`font-bold font-mono ${c.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {c.percentage > 0 ? `+${c.percentage}%` : `${c.percentage}%`}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.positive
                          ? 'bg-gradient-to-r from-emerald-500 to-secondary'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.abs(c.percentage)}%` }}
                    />
                  </div>
                  {c.description && (
                    <span className="text-[10px] text-muted-foreground block">{c.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): What-If Simulator & Travel Specs */}
        <div className="lg:col-span-5 space-y-8">
          {/* INTERACTIVE WHAT-IF SIMULATOR */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card to-muted/30 border-2 border-primary/20 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-secondary" />
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  What-If Simulator
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulator(!showSimulator)}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                {showSimulator ? 'Collapse' : 'Expand'}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Simulate how future visitor density and municipal interventions impact this destination&apos;s score in real time.
            </p>

            {showSimulator && (
              <div className="space-y-5 pt-2">
                {/* Slider 1: Expected Visitors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Expected Visitors</span>
                    <span className="font-mono font-bold text-muted-foreground">
                      {Math.round(2000 + visitorSlider * 100)} / week
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={visitorSlider}
                    onChange={(e) => setVisitorSlider(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>2,000 (Quiet)</span>
                    <span>12,000 (Heavy)</span>
                  </div>
                </div>

                {/* Slider 2: Waste Management */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Waste Management</span>
                    <span className="font-mono font-bold text-muted-foreground">
                      {wasteSlider > 66 ? 'Excellent' : wasteSlider > 33 ? 'Moderate' : 'Poor'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={wasteSlider}
                    onChange={(e) => setWasteSlider(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Poor</span>
                    <span>Standard</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Slider 3: Infrastructure */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Eco-Infrastructure</span>
                    <span className="font-mono font-bold text-muted-foreground">
                      {infraSlider > 66 ? 'Strong' : infraSlider > 33 ? 'Moderate' : 'Limited'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={infraSlider}
                    onChange={(e) => setInfraSlider(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Limited</span>
                    <span>Strong</span>
                  </div>
                </div>

                {/* Live Simulation Output Box */}
                <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-center divide-x divide-border">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Current Score
                      </span>
                      <span className="text-2xl font-extrabold text-foreground mt-1 block">
                        {destination.sustainability.overall}
                      </span>
                    </div>

                    <div className="pl-4">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Simulated Score
                      </span>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <span className="text-2xl font-extrabold text-primary">
                          {simulation.simulatedSustainability}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            simulation.deltaSustainability >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {simulation.deltaSustainability >= 0
                            ? `↑ ${simulation.deltaSustainability}`
                            : `↓ ${Math.abs(simulation.deltaSustainability)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Simulator Alert Note */}
                  <p className="text-xs text-muted-foreground text-center italic pt-1">
                    {simulation.alertMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Destination Travel Guide Specs */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-foreground">Travel Essentials</h2>

            <div className="space-y-3 divide-y divide-border/60 text-xs">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-secondary" /> Weather
                </span>
                <span className="font-semibold text-foreground">{destination.weather || '24°C • Pleasant'}</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-secondary" /> Air Quality
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {destination.airQuality || 'AQI 15 • Excellent'}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> Data Confidence
                </span>
                <Badge variant="outline">{destination.dataConfidence || 'HIGH'}</Badge>
              </div>
            </div>

            {/* Activities Chips */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-bold text-foreground block">Key Activities</span>
              <div className="flex flex-wrap gap-1.5">
                {destination.activities.map((act) => (
                  <span
                    key={act}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-muted text-foreground"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
