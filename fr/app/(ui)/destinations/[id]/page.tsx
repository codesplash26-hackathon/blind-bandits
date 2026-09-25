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
  Sliders,
  TrendingUp,
  Calendar,
  CheckCircle2,
  DollarSign,
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
        <h2 className="text-xl font-bold text-primary">Destination Not Found</h2>
        <Link href="/destinations">
          <Button variant="outline" className="rounded-full">Back to Destinations Catalog</Button>
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

  return (
    <div className="space-y-6 pb-16">
      {/* Top Search & Navigation Bar (Kleon Style) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/destinations"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-xs font-bold text-primary shadow-[0_2px_10px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] hover:bg-muted transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
            <span>All Sanctuaries</span>
          </Link>

          <span className="text-xs font-semibold text-primary/50 hidden sm:inline">
            Catalog &gt; {destination.district} &gt; {destination.name}
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border text-xs font-semibold text-primary shadow-[0_2px_10px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)]">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Optimal: {destination.recommendedDurationDays || 3} Days</span>
          </div>

          <button
            type="button"
            onClick={() => toggleSaveDestination(destination.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm ${
              isBookmarked
                ? 'bg-destructive/10 text-destructive border-destructive/25'
                : 'bg-card hover:bg-muted text-primary border-border'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-destructive text-destructive' : ''}`} />
            <span>{isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Destination'}</span>
          </button>
        </div>
      </div>

      {/* 4 Kleon Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Sustainability Index */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Sustainability Score</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-primary tracking-tight">
                {destination.sustainability.overall}
                <span className="text-sm font-normal text-primary/50">/100</span>
              </span>
              <span className="text-[11px] text-primary font-bold block mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Certified Eco Standard
              </span>
            </div>
            {/* SVG Circular Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--muted)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="var(--chart-2)"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * destination.sustainability.overall) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-primary">{destination.sustainability.overall}%</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Tourism Pressure */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Tourism Pressure</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-primary tracking-tight">
                {destination.pressure.score}%
              </span>
              <span className={`text-[11px] font-bold block mt-0.5 ${isHighPressure ? 'text-destructive' : 'text-primary'}`}>
                {destination.pressure.level} Pressure Zone
              </span>
            </div>
            {/* Mini Sparkline */}
            <svg className="w-16 h-8 overflow-visible" viewBox="0 0 60 25">
              <path
                d="M 0 16 Q 15 5, 30 14 T 60 4"
                fill="none"
                stroke={isHighPressure ? 'var(--destructive)' : 'var(--chart-1)'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: Typical Budget */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Est. 3-Day Budget</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-2xl font-black text-primary tracking-tight">
                LKR {(destination.typicalBudgetLKR / 1000).toFixed(0)}k
              </span>
              <span className="text-[11px] text-primary/60 font-semibold block mt-0.5">
                Homestays &amp; meals
              </span>
            </div>
            {/* Mini Bars */}
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 h-3 bg-muted rounded-full" />
              <div className="w-1.5 h-5 bg-accent rounded-full" />
              <div className="w-1.5 h-7 bg-primary rounded-full" />
              <div className="w-1.5 h-8 bg-primary rounded-full" />
            </div>
          </div>
        </div>

        {/* KPI 4: Climate & Air Quality */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Microclimate &amp; AQI</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <CloudSun className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-xl font-bold text-primary tracking-tight">
                {destination.weather || '24°C • Pleasant'}
              </span>
              <span className="text-[11px] text-primary font-bold block mt-0.5">
                {destination.airQuality || 'AQI 15 • Pristine Air'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <Wind className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)]">
        <div className="relative h-72 sm:h-96 w-full">
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-overlay/95 via-overlay/40 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-overlay/50 backdrop-blur-md border border-overlay-foreground/20 text-xs font-semibold text-overlay-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{destination.district} District, {destination.province}</span>
            </span>
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-overlay/50 backdrop-blur-md border border-overlay-foreground/20 text-xs font-medium text-overlay-foreground/90">
              {destination.landscape}
            </span>
          </div>

          {/* Hero Content Bottom */}
          <div className="absolute bottom-6 inset-x-6 text-overlay-foreground space-y-2">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {destination.name}
            </h1>
            <p className="text-sm sm:text-base text-overlay-foreground/90 max-w-2xl font-light leading-relaxed">
              {destination.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* OVERTOURISM WARNING SECTION (Shown if High Pressure) */}
      {isHighPressure && (
        <div className="rounded-3xl border-2 border-destructive/25 bg-destructive/60 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-destructive/15 text-destructive shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-destructive">
                  Overtourism Alert: High Visitor Pressure ({destination.pressure.score}%)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                  PEAK DENSITY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-destructive/80 leading-relaxed">
                This destination is currently experiencing peak visitor concentration. High footfall along viewpoints and trail bottlenecks causes stress on local waste processing and roads.
              </p>
            </div>
          </div>

          {/* Pressure Factor Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-destructive/25">
            <div className="p-3 rounded-2xl bg-card border border-destructive/25 text-center">
              <span className="text-[10px] uppercase font-bold text-destructive/60 block">Visitor Density</span>
              <span className="text-base font-extrabold text-destructive">{destination.pressure.visitorDensity}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-destructive/25 text-center">
              <span className="text-[10px] uppercase font-bold text-destructive/60 block">Infra Pressure</span>
              <span className="text-base font-extrabold text-destructive">{destination.pressure.infrastructurePressure}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-destructive/25 text-center">
              <span className="text-[10px] uppercase font-bold text-destructive/60 block">Waste Strain</span>
              <span className="text-base font-extrabold text-destructive">{destination.pressure.wastePressure}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-destructive/25 text-center">
              <span className="text-[10px] uppercase font-bold text-destructive/60 block">Traffic Density</span>
              <span className="text-base font-extrabold text-destructive">{destination.pressure.traffic}%</span>
            </div>
          </div>

          {/* Alternatives Callout */}
          {destination.alternatives && destination.alternatives.length > 0 && (
            <div className="pt-3 space-y-3">
              <h3 className="text-sm font-bold text-primary">
                Consider these serene, low-pressure alternatives
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {destination.alternatives.map((alt) => (
                  <Link
                    key={alt.id}
                    href={`/destinations/${alt.id}`}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-primary transition-all hover:shadow-md space-y-2 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                          {alt.similarity}% match
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-primary text-[10px] font-bold">
                          {alt.pressureLevel}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-primary mt-1 group-hover:text-primary transition-colors">
                        {alt.name}
                      </h4>
                      <p className="text-[11px] text-primary/60 mt-0.5 line-clamp-2">
                        {alt.tagline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-primary/60">Sustainability:</span>
                      <span className="font-bold text-primary">{alt.sustainabilityScore}/100</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Sustainability Breakdown & XAI TreeSHAP */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sustainability 5-Dimension Breakdown */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
            <div>
              <h2 className="text-base font-black text-foreground">Sustainability 5-Dimension Index</h2>
              <p className="text-xs text-muted-foreground">
                Evaluated under the Sri Lanka National Sustainable Tourism Framework
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {[
                { label: 'Environmental Preservation', value: destination.sustainability.environmental, desc: 'Forest cover, biodiversity, and clean water' },
                { label: 'Community Benefit', value: destination.sustainability.communityBenefit, desc: 'Revenue retention for local homestays & guides' },
                { label: 'Crowd & Carrying Capacity', value: destination.sustainability.crowd, desc: 'Visitor carrying threshold and trail tranquility' },
                { label: 'Eco-Infrastructure', value: destination.sustainability.infrastructure, desc: 'Waste diversion, clean energy, and transit' },
                { label: 'Tourist Suitability', value: destination.sustainability.touristSuitability, desc: 'Comfort, trail safety, and hospitality quality' },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-primary">{item.label}</span>
                      <span className="text-[10px] text-primary/50 hidden sm:inline ml-1.5">({item.desc})</span>
                    </div>
                    <span className="font-bold text-primary font-mono">{item.value}/100</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary transition-all duration-700"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable AI (XAI) Why this was recommended */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-base font-black text-foreground">
                    AI Evaluation &amp; TreeSHAP Analysis
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Algorithmic feature contribution towards recommendation
                </p>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary bg-muted/50">
                XAI Model
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <p className="text-xs sm:text-sm text-primary leading-relaxed">
                &ldquo;{destination.xaiExplanation.summary}&rdquo;
              </p>
            </div>

            {/* TreeSHAP Contribution Bar Chart */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-primary/70 uppercase tracking-wider block">
                Factor Contribution Weights
              </span>

              {destination.xaiExplanation.contributions.map((c) => (
                <div key={c.factor} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">{c.factor}</span>
                    <span className={`font-bold font-mono ${c.positive ? 'text-primary' : 'text-destructive'}`}>
                      {c.percentage > 0 ? `+${c.percentage}%` : `${c.percentage}%`}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.positive
                          ? 'bg-primary'
                          : 'bg-destructive'
                      }`}
                      style={{ width: `${Math.abs(c.percentage)}%` }}
                    />
                  </div>
                  {c.description && (
                    <span className="text-[10px] text-primary/60 block">{c.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Interactive What-If Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                <h2 className="text-base font-black text-foreground">
                  What-If Impact Simulator
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulator(!showSimulator)}
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                {showSimulator ? 'Collapse' : 'Expand'}
              </button>
            </div>

            <p className="text-xs text-primary/60">
              Simulate how future visitor density and municipal eco-interventions affect this sanctuary&apos;s live score.
            </p>

            {showSimulator && (
              <div className="space-y-4 pt-1">
                {/* Slider 1: Expected Visitors */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">Expected Weekly Visitors</span>
                    <span className="font-mono font-bold text-primary">
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
                  <div className="flex justify-between text-[10px] text-primary/50">
                    <span>2,000 (Tranquil)</span>
                    <span>12,000 (Congested)</span>
                  </div>
                </div>

                {/* Slider 2: Waste Management */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">Waste Sorting &amp; Composting</span>
                    <span className="font-mono font-bold text-primary">
                      {wasteSlider > 66 ? 'Zero Waste' : wasteSlider > 33 ? 'Moderate' : 'Understaffed'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={wasteSlider}
                    onChange={(e) => setWasteSlider(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Slider 3: Eco-Infrastructure */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">Eco Transit &amp; Solar Trails</span>
                    <span className="font-mono font-bold text-primary">
                      {infraSlider > 66 ? 'High Grade' : infraSlider > 33 ? 'Standard' : 'Primitive'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={infraSlider}
                    onChange={(e) => setInfraSlider(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Simulation Output Card */}
                <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-center divide-x divide-border">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-primary/60 block">
                        Current Score
                      </span>
                      <span className="text-2xl font-black text-primary mt-1 block">
                        {destination.sustainability.overall}
                      </span>
                    </div>

                    <div className="pl-4">
                      <span className="text-[10px] uppercase font-bold text-primary/60 block">
                        Simulated Score
                      </span>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <span className="text-2xl font-black text-primary">
                          {simulation.simulatedSustainability}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            simulation.deltaSustainability >= 0 ? 'text-primary' : 'text-destructive'
                          }`}
                        >
                          {simulation.deltaSustainability >= 0
                            ? `↑ ${simulation.deltaSustainability}`
                            : `↓ ${Math.abs(simulation.deltaSustainability)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-primary/70 text-center italic pt-1">
                    {simulation.alertMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Destination Travel Guide Specs */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
            <h2 className="text-base font-black text-foreground">Key Activities &amp; Highlights</h2>

            <div className="flex flex-wrap gap-2">
              {destination.activities.map((act) => (
                <span
                  key={act}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted text-primary border border-border"
                >
                  {act}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-primary/70">
              <span>Data Telemetry Reliability</span>
              <span className="font-bold text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Verified 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
