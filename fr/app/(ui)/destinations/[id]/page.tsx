'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Heart,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Leaf,
  Sliders,
  TrendingUp,
  Calendar,
  CheckCircle2,
  DollarSign,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/Loader';
import {
  getDestination,
  getDestinationPressure,
  getDestinationPressureExplanation,
  getDestinationSustainability,
  simulateDestination,
} from '@/lib/destinations';
import { mapDestination, type DestinationViewModel } from '@/lib/destinationMapper';
import type {
  DestinationPressureResponse,
  DestinationPressureExplanationResponse,
  PressureFeatureContribution,
  DestinationSimulationResponse,
  PressureBand,
} from '@/types/destination-api';
import describeApiError from '@/lib/apiError';
import { recordInteraction } from '@/lib/engagement';

const recordedDestinationViews = new Set<string>();

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatForecastMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || !monthNumber) return month;
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(year, monthNumber - 1, 1)),
  );
}

function formatFeatureValue(value: string | number | null) {
  if (value === null) return 'Not provided';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    });
  }
  return value;
}

function contributionDirection(contribution: PressureFeatureContribution) {
  const direction = contribution.direction.toLowerCase();
  if (direction === 'increase' || direction === 'increases') return 'higher';
  if (direction === 'decrease' || direction === 'decreases') return 'lower';
  return 'neutral';
}

const pressureTone: Record<PressureBand, { text: string; background: string; stroke: string }> = {
  LOW: { text: 'text-success', background: 'bg-success', stroke: 'var(--success)' },
  MEDIUM: { text: 'text-warning', background: 'bg-warning', stroke: 'var(--warning)' },
  HIGH: { text: 'text-destructive', background: 'bg-destructive', stroke: 'var(--destructive)' },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DestinationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const destinationId = resolvedParams.id;

  const { user, isSaved, toggleSaveDestination } = useAuth();

  const [destination, setDestination] = useState<DestinationViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pressureMonth, setPressureMonth] = useState(currentMonth);
  const [pressure, setPressure] = useState<DestinationPressureResponse | null>(null);
  const [pressureExplanation, setPressureExplanation] = useState<DestinationPressureExplanationResponse | null>(null);
  const [pressureLoading, setPressureLoading] = useState(false);
  const [pressureError, setPressureError] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [pressureReloadKey, setPressureReloadKey] = useState(0);

  // What-If Simulator state (defaults at 50 / baseline)
  const [visitorSlider, setVisitorSlider] = useState(50);
  const [wasteSlider, setWasteSlider] = useState(50);
  const [infraSlider, setInfraSlider] = useState(50);
  const [showSimulator, setShowSimulator] = useState(true);
  const [simulation, setSimulation] = useState<DestinationSimulationResponse | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await getDestination(destinationId);
        const sustainability = response.factor
          ? await getDestinationSustainability(response.id)
          : null;
        if (active) setDestination(mapDestination(response, sustainability));
      } catch (error) {
        if (active) setLoadError(describeApiError(error, 'Unable to load this destination.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [destinationId]);

  useEffect(() => {
    const apiId = destination?.api.id;
    if (!apiId || !pressureMonth) return;
    let active = true;
    const loadPressure = async () => {
      setPressureLoading(true);
      setPressure(null);
      setPressureExplanation(null);
      setPressureError(null);
      setExplanationError(null);
      try {
        const explanation = await getDestinationPressureExplanation(apiId, pressureMonth);
        if (active) {
          setPressureExplanation(explanation);
          setPressure(explanation);
        }
      } catch (explanationFailure) {
        if (active) {
          setExplanationError(
            describeApiError(explanationFailure, 'The model explanation is unavailable.'),
          );
        }
        try {
          const forecast = await getDestinationPressure(apiId, pressureMonth);
          if (active) setPressure(forecast);
        } catch (forecastFailure) {
          if (active) {
            setPressureError(
              describeApiError(forecastFailure, 'Regional visitor-pressure prediction is unavailable.'),
            );
          }
        }
      } finally {
        if (active) setPressureLoading(false);
      }
    };
    void loadPressure();
    return () => {
      active = false;
    };
  }, [destination?.api.id, pressureMonth, pressureReloadKey]);

  useEffect(() => {
    const apiId = destination?.api.id;
    if (!apiId || !user) return;
    const viewKey = `${user.id}:${apiId}`;
    if (recordedDestinationViews.has(viewKey)) return;
    recordedDestinationViews.add(viewKey);
    void recordInteraction({
      destination_id: apiId,
      event_type: 'DESTINATION_VIEWED',
    }).catch(() => recordedDestinationViews.delete(viewKey));
  }, [destination, user]);

  useEffect(() => {
    if (!destination?.api.factor || !showSimulator) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setSimulationError(null);
      try {
        const result = await simulateDestination(destination.api.id, {
          expected_visitor_level: visitorSlider,
          waste_management_level: wasteSlider,
          infrastructure_level: infraSlider,
        });
        if (active) setSimulation(result);
      } catch (error) {
        if (active) {
          setSimulation(null);
          setSimulationError(describeApiError(error, 'Simulation is currently unavailable.'));
        }
      }
    }, 400);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [destination, infraSlider, showSimulator, visitorSlider, wasteSlider]);

  if (isLoading) {
    return <Loader label="Loading destination..." />;
  }

  if (!destination) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-primary">Destination Not Found</h2>
        {loadError && <p className="text-sm text-muted-foreground">{loadError}</p>}
        <Link href="/destinations">
          <Button variant="outline" className="rounded-full">Back to Destinations Catalog</Button>
        </Link>
      </div>
    );
  }

  const isBookmarked = isSaved(destination.id);
  const pressureBand = pressure?.pressure_band ?? pressure?.band ?? null;
  const pressureValue = pressure?.predicted_occupancy
    ?? pressure?.predicted_regional_occupancy_rate
    ?? null;
  const isHighPressure = pressureBand === 'HIGH';
  const activePressureTone = pressureBand ? pressureTone[pressureBand] : null;
  const maxAbsoluteContribution = pressureExplanation
    ? Math.max(
      ...pressureExplanation.feature_contributions.map((item) => Math.abs(item.shap_value)),
      0,
    )
    : 0;

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
            <span>
              Recommended: {destination.api.recommended_min_trip_duration}–{destination.api.recommended_max_trip_duration} Days
            </span>
          </div>

          <button
            type="button"
            onClick={() => void toggleSaveDestination(destination.api.id)}
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
                <TrendingUp className="w-3 h-3" /> {destination.sustainabilityData ? 'API calculated' : 'Factor data unavailable'}
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

        {/* KPI 2: Regional visitor-pressure model */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Regional Visitor Pressure</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-primary tracking-tight">
                {pressureLoading ? '…' : pressureValue === null ? '—' : `${pressureValue.toFixed(1)}%`}
              </span>
              {pressureBand && activePressureTone ? (
                <span className={`text-[11px] font-bold mt-0.5 flex items-center gap-1.5 ${activePressureTone.text}`}>
                  <span className={`size-2 rounded-full ${activePressureTone.background}`} />
                  {pressureBand} • {pressure?.scope} forecast
                </span>
              ) : (
                <span className="text-[11px] font-bold block mt-0.5 text-muted-foreground">
                  {pressureLoading ? 'Loading model prediction…' : 'No prediction for this month'}
                </span>
              )}
            </div>
            {/* Existing traffic-light sparkline, now driven by the backend band. */}
            <svg className="w-16 h-8 overflow-visible" viewBox="0 0 60 25">
              <path
                d="M 0 16 Q 15 5, 30 14 T 60 4"
                fill="none"
                stroke={activePressureTone?.stroke ?? 'var(--muted-foreground)'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="mt-3 pt-2 border-t border-border space-y-1.5">
            <label className="flex items-center justify-between gap-2 text-[10px] font-bold text-muted-foreground">
              Forecast month
              <input
                type="month"
                value={pressureMonth}
                onChange={(event) => setPressureMonth(event.target.value)}
                className="h-7 rounded-lg border border-border bg-background px-2 text-[10px] text-foreground"
              />
            </label>
            {pressure && (
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {pressure.region} • {formatForecastMonth(pressure.forecast_month ?? pressure.month)}<br />
                {pressure.forecast_mode.replaceAll('_', ' ')} • model {pressure.model_version}
              </p>
            )}
            {pressureError && (
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] leading-relaxed text-destructive">{pressureError}</p>
                <button
                  type="button"
                  onClick={() => setPressureReloadKey((value) => value + 1)}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Typical Budget */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Typical Budget</span>
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

        {/* KPI 4: Backend data provenance */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Factor Data Quality</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-xl font-bold text-primary tracking-tight">
                {destination.api.factor?.confidence_level ?? 'UNAVAILABLE'} confidence
              </span>
              <span className="text-[11px] text-primary font-bold block mt-0.5">
                {destination.api.factor?.value_type ?? 'No factor data'}
              </span>
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
            unoptimized={destination.image.startsWith('http')}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-overlay/95 via-overlay/40 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-overlay/50 backdrop-blur-md border border-overlay-foreground/20 text-xs font-semibold text-overlay-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{destination.district} District, {destination.api.region}</span>
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
                  High Regional Visitor Pressure ({pressureValue?.toFixed(1)}%)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                  PEAK DENSITY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-destructive/80 leading-relaxed">
                The trained model forecasts regional monthly accommodation occupancy for {pressure?.region}, not destination-level footfall.
              </p>
            </div>
          </div>

          {/* Authoritative model context returned by the pressure API. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-destructive/25">
            <div className="p-3 rounded-2xl bg-card border border-destructive/25 text-center">
              <span className="text-[10px] uppercase font-bold text-destructive/60 block">Prediction Month</span>
              <span className="text-sm font-extrabold text-destructive">{formatForecastMonth(pressure?.forecast_month ?? pressureMonth)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-destructive/25 text-center">
              <span className="text-[10px] uppercase font-bold text-destructive/60 block">Previous Occupancy</span>
              <span className="text-base font-extrabold text-destructive">{pressure?.previous_occupancy?.toFixed(1) ?? '—'}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-destructive/25 text-center">
              <span className="text-[10px] uppercase font-bold text-destructive/60 block">Predicted Change</span>
              <span className="text-base font-extrabold text-destructive">{pressure?.predicted_residual === null || pressure?.predicted_residual === undefined ? '—' : `${pressure.predicted_residual >= 0 ? '+' : ''}${pressure.predicted_residual.toFixed(1)}`}</span>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-destructive/25 text-center">
              <span className="text-[10px] uppercase font-bold text-destructive/60 block">Model Version</span>
              <span className="text-[10px] font-extrabold text-destructive break-all">{pressure?.model_version}</span>
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
        {/* Left Column (7 Cols): sustainability breakdown and configured weights */}
        <div className="lg:col-span-7 space-y-6">
          {/* TreeSHAP model explanation. This is deliberately separate from the index below. */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-secondary" />
                  <h2 className="text-base font-black text-foreground">Visitor-Pressure Model Explanation</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  TreeSHAP attribution for the model prediction—not Sustainability Index weighting.
                </p>
              </div>
              <Badge variant="outline" className="border-secondary/30 text-secondary bg-secondary/5">
                {pressureExplanation?.explanation_method ?? 'TreeSHAP'}
              </Badge>
            </div>

            {pressureLoading && <Loader label="Calculating model explanation..." />}

            {!pressureLoading && explanationError && (
              <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 space-y-2">
                <p className="text-xs font-bold text-foreground">Explanation unavailable</p>
                <p className="text-xs text-muted-foreground">{explanationError}</p>
                <Button size="sm" variant="outline" onClick={() => setPressureReloadKey((value) => value + 1)}>
                  Retry explanation
                </Button>
              </div>
            )}

            {!pressureLoading && pressureExplanation && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-muted/40 border border-border p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Prediction</span>
                    <span className="text-lg font-black text-foreground">{pressureExplanation.predicted_regional_occupancy_rate.toFixed(1)}%</span>
                  </div>
                  <div className="rounded-2xl bg-muted/40 border border-border p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">{pressureExplanation.base_residual === null ? 'Base value' : 'Base residual'}</span>
                    <span className="text-lg font-black text-foreground">{(pressureExplanation.base_residual ?? pressureExplanation.base_value).toFixed(2)}</span>
                  </div>
                  <div className="rounded-2xl bg-muted/40 border border-border p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Predicted residual</span>
                    <span className="text-lg font-black text-foreground">{pressureExplanation.predicted_residual === null ? '—' : `${pressureExplanation.predicted_residual >= 0 ? '+' : ''}${pressureExplanation.predicted_residual.toFixed(2)}`}</span>
                  </div>
                  <div className="rounded-2xl bg-muted/40 border border-border p-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Model</span>
                    <span className="text-[10px] font-bold text-foreground break-all">{pressureExplanation.model_version}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    {pressureExplanation.plain_language_explanation}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">SHAP feature contributions</span>
                    <span className="text-[10px] text-muted-foreground">Model-output points relative to the base</span>
                  </div>
                  {pressureExplanation.feature_contributions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No feature contributions were returned.</p>
                  )}
                  {pressureExplanation.feature_contributions.map((contribution) => {
                    const direction = contributionDirection(contribution);
                    const width = maxAbsoluteContribution === 0
                      ? 0
                      : Math.max(2, (Math.abs(contribution.shap_value) / maxAbsoluteContribution) * 100);
                    const DirectionIcon = direction === 'higher' ? ArrowUp : direction === 'lower' ? ArrowDown : Minus;
                    return (
                      <div key={contribution.feature_name} className="rounded-2xl border border-border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-foreground block">{contribution.display_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              Input: {formatFeatureValue(contribution.feature_value ?? contribution.input_value)}
                            </span>
                          </div>
                          <div className={`text-right font-bold ${direction === 'higher' ? 'text-destructive' : direction === 'lower' ? 'text-success' : 'text-muted-foreground'}`}>
                            <span className="flex items-center justify-end gap-1">
                              <DirectionIcon className="w-3 h-3" />
                              {direction === 'neutral' ? 'Neutral' : `Pushes ${direction}`}
                            </span>
                            <span className="font-mono">{contribution.shap_value >= 0 ? '+' : ''}{contribution.shap_value.toFixed(3)}</span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${direction === 'higher' ? 'bg-destructive' : direction === 'lower' ? 'bg-success' : 'bg-muted-foreground'}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

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

          {/* Authoritative sustainability calculation */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-base font-black text-foreground">
                    Sustainability Calculation
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Weighted contributions returned by the API
                </p>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary bg-muted/50">
                {destination.sustainabilityData?.configuration_version ?? 'No factors'}
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <p className="text-xs sm:text-sm text-primary leading-relaxed">
                &ldquo;{destination.sustainabilityExplanation.summary}&rdquo;
              </p>
            </div>

            {/* Weighted contribution bar chart */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-primary/70 uppercase tracking-wider block">
                Weighted Factor Contributions
              </span>

              {destination.sustainabilityExplanation.contributions.map((contribution) => (
                <div key={contribution.factor} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">
                      {contribution.factor} ({(contribution.weight * 100).toFixed(0)}% weight)
                    </span>
                    <span className="font-bold font-mono text-primary">
                      {contribution.value.toFixed(2)} points
                    </span>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-primary"
                      style={{ width: `${Math.max(0, Math.min(100, contribution.value))}%` }}
                    />
                  </div>
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
                    <span className="font-semibold text-primary">Expected Visitor Level</span>
                    <span className="font-mono font-bold text-primary">
                      {visitorSlider} / 100
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
                    <span>Low</span>
                    <span>High</span>
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

                {simulationError && (
                  <p className="text-xs text-destructive">{simulationError}</p>
                )}

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
                          {simulation ? Number(simulation.simulated_score).toFixed(1) : '—'}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            Number(simulation?.score_delta ?? 0) >= 0 ? 'text-primary' : 'text-destructive'
                          }`}
                        >
                          {simulation
                            ? Number(simulation.score_delta) >= 0
                              ? `↑ ${Number(simulation.score_delta).toFixed(1)}`
                              : `↓ ${Math.abs(Number(simulation.score_delta)).toFixed(1)}`
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-primary/70 text-center italic pt-1">
                    {simulation?.explanation ?? 'Adjust the controls to run the backend simulation.'}
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
              <span>Factor provenance</span>
              <span className="font-bold text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                {destination.api.factor
                  ? `${destination.api.factor.value_type} • ${destination.api.factor.confidence_level}`
                  : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
