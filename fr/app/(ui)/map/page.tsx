'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin,
  Heart,
  ArrowRight,
  Sparkles,
  Compass,
  ShieldCheck,
  Leaf,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PressureLevel } from '@/types/ceylontour';
import type { MapDestination } from '@/types/destination-api';
import { Button } from '@/components/ui/button';
import { DatePickerInput } from '@/components/ui/date-picker';
import { Loader } from '@/components/Loader';
import { getMapDestinations } from '@/lib/destinations';
import describeApiError from '@/lib/apiError';

const InteractiveDestinationMap = dynamic(
  () => import('@/components/map/InteractiveDestinationMap').then((module) => module.InteractiveDestinationMap),
  {
    ssr: false,
    loading: () => <Loader label="Loading interactive map..." />,
  },
);

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function SriLankaMapPage() {
  const { isSaved, toggleSaveDestination } = useAuth();

  const [destinations, setDestinations] = useState<MapDestination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<MapDestination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapMonth, setMapMonth] = useState(currentMonth);
  const [reloadKey, setReloadKey] = useState(0);

  const [activePressureFilter, setActivePressureFilter] = useState<'ALL' | PressureLevel>('ALL');

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setLoadError(null);
      getMapDestinations(mapMonth)
        .then((response) => {
          if (!active) return;
          setDestinations(response.destinations);
          setSelectedDestination(response.destinations[0] ?? null);
        })
        .catch((error) => {
          if (active) setLoadError(describeApiError(error, 'Unable to load the sustainability map.'));
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [mapMonth, reloadKey]);

  const filteredDestinations = destinations.filter((d) => {
    if (activePressureFilter === 'ALL') return true;
    return d.tourism_pressure_level === activePressureFilter;
  });
  const scoredDestinations = destinations.filter((item) => item.sustainability_score !== null);
  const averageSustainability = scoredDestinations.length
    ? Math.round(scoredDestinations.reduce((sum, item) => sum + (item.sustainability_score ?? 0), 0) / scoredDestinations.length)
    : null;
  const lowPressureCount = destinations.filter((item) => item.tourism_pressure_level === 'LOW').length;

  if (isLoading) return <Loader label="Loading sustainability map..." />;
  if (loadError) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
        <h2 className="text-lg font-bold text-foreground">Sustainability map unavailable</h2>
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <Button type="button" onClick={() => setReloadKey((value) => value + 1)} variant="link" size="sm">
          Retry
        </Button>
      </div>
    );
  }
  if (destinations.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-2">
        <MapPin className="w-8 h-8 text-muted-foreground/60 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">No active destinations found</h2>
        <p className="text-sm text-muted-foreground">There are no map markers for {mapMonth}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto w-full">
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Interactive Map
            </span>

          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Sri Lanka Travel Map
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Explore API-backed destination sustainability and crowd-condition indicators across Sri Lanka.
          </p>
        </div>

        {/* Pressure Filter Tabs (Segmented Control in theme primary and muted surfaces) */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted border border-border shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--shadow-color)_6%,transparent)] shrink-0">
          <DatePickerInput
            type="month"
            label="Forecast month"
            value={mapMonth}
            onValueChange={setMapMonth}
            className="flex items-center gap-2 px-2"
            labelClassName="text-[10px]"
            inputClassName="h-8 text-[10px]"
          />
          <Button
            type="button"
            onClick={() => setActivePressureFilter('ALL')}
            variant={activePressureFilter === 'ALL' ? "default" : "outline"}
            size="sm"
            aria-pressed={activePressureFilter === 'ALL'}
          >
            All Sanctuaries ({destinations.length})
          </Button>
          <Button
            type="button"
            onClick={() => setActivePressureFilter('LOW')}
            variant={activePressureFilter === 'LOW' ? "default" : "outline"}
            size="sm"
            aria-pressed={activePressureFilter === 'LOW'}
          >
            <span className="size-2 rounded-full bg-success" />
            <span>Quiet</span>
          </Button>
          <Button
            type="button"
            onClick={() => setActivePressureFilter('MEDIUM')}
            variant={activePressureFilter === 'MEDIUM' ? "default" : "outline"}
            size="sm"
            aria-pressed={activePressureFilter === 'MEDIUM'}
          >
            <span className="size-2 rounded-full bg-warning" />
            <span>Medium</span>
          </Button>
          <Button
            type="button"
            onClick={() => setActivePressureFilter('HIGH')}
            variant={activePressureFilter === 'HIGH' ? "default" : "outline"}
            size="sm"
            aria-pressed={activePressureFilter === 'HIGH'}
          >
            <span className="size-2 rounded-full bg-destructive" />
            <span>Busy Hubs</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Top Metric KPI Summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-[0_8px_25px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              All Places
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground">{destinations.length}</span>
              <span className="text-xs text-muted-foreground font-bold">nodes</span>
            </div>
            <p className="text-[11px] text-foreground font-bold mt-0.5">
              Active API records
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-muted text-primary border border-border">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-[0_8px_25px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Quiet Places
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground">{lowPressureCount}</span>
              <span className="text-xs text-muted-foreground font-bold">low crowd</span>
            </div>
            <p className="text-[11px] text-success font-bold mt-0.5">
              {destinations.length > 0
                ? `${Math.round((lowPressureCount / destinations.length) * 100)}% of active destinations`
                : 'No active destinations'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-muted text-primary border border-border">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-[0_8px_25px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Island Avg Eco Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground">{averageSustainability ?? '—'}</span>
              <span className="text-xs text-muted-foreground font-bold">/100</span>
            </div>
            <p className="text-[11px] text-success font-bold mt-0.5">
              API calculated
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-muted text-primary border border-border">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-[0_8px_25px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Selected Target
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-xl sm:text-2xl font-black text-foreground truncate max-w-[130px]">
                {selectedDestination?.name || 'Belihuloya'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-bold mt-0.5">
                {selectedDestination?.region} Region
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-muted text-foreground">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Main Map Canvas + Inspector Workspace ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas (8 Cols) */}
        <div className="relative isolate z-0 h-[580px] min-h-0 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] lg:col-span-8 lg:h-[680px]">
          <InteractiveDestinationMap
            destinations={filteredDestinations}
            selectedDestinationId={selectedDestination?.id ?? null}
            onSelectDestination={setSelectedDestination}
          />

          {/* Legend Box
          <div className="pointer-events-none absolute bottom-8 left-3 z-[500] p-3 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-lg space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Crowd Levels
            </span>
            <div className="flex items-center gap-2 text-foreground font-bold">
              <span className="size-2.5 rounded-full bg-success" />
              <span>Quiet (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-bold">
              <span className="size-2.5 rounded-full bg-warning" />
              <span>Moderate (40-70%)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-bold">
              <span className="size-2.5 rounded-full bg-destructive" />
              <span>Busy (&gt;70%)</span>
            </div>
          </div> */}

        </div>

        {/* Selected Destination Details Panel (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          {selectedDestination ? (
            <div className="rounded-3xl border border-border/40 bg-card overflow-hidden  space-y-4">
              <div className="relative h-32 w-full overflow-hidden bg-muted border-b border-border">
                <div className="absolute inset-0 " />
                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-overlay/85 text-overlay-foreground border border-overlay-foreground/20 backdrop-blur-md">
                    {selectedDestination.tourism_pressure_value === null
                      ? 'Pressure unavailable'
                      : `${selectedDestination.tourism_pressure_value.toFixed(1)}% ${selectedDestination.tourism_pressure_level ?? ''}`}
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={() => void toggleSaveDestination(selectedDestination.id)}
                  variant="outline"
                  size="icon"
                  aria-pressed={isSaved(selectedDestination.id)}
                  aria-label={isSaved(selectedDestination.id) ? "Remove from saved" : "Save destination"}
                  className="absolute top-3.5 right-3.5 bg-card text-card-foreground dark:bg-card"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isSaved(selectedDestination.id) ? 'fill-destructive text-destructive' : 'text-primary'
                    }`}
                  />
                </Button>

                <div className="absolute bottom-3.5 inset-x-4">
                  <span className="text-[11px] font-bold  uppercase tracking-wider block">
                    {selectedDestination.region} Region
                  </span>
                  <h3 className="font-heading text-xl font-bold leading-tight mt-0.5">
                    {selectedDestination.name}
                  </h3>
                </div>
              </div>

              {/* Panel Details */}
              <div className="p-5 space-y-4 pt-0">
                {/* Scores Matrix */}
                <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-black text-foreground">Eco-Friendly Score</span>
                    <span className="font-black text-foreground">
                      {selectedDestination.sustainability_score ?? '—'} / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground font-semibold block">Environmental</span>
                      <span className="font-black text-foreground">
                        {selectedDestination.environmental_score ?? '—'}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold block">Community Benefit</span>
                      <span className="font-black text-foreground">
                        {selectedDestination.community_score ?? '—'}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold block">Crowd Index</span>
                      <span className="font-black text-foreground">
                        {selectedDestination.tourism_pressure_value ?? '—'}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold block">Traveler Fit</span>
                      <span className="font-black text-foreground">
                        —/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* XAI Preview */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <span className="text-[11px] font-black text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Why Choose This Place
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {selectedDestination.tourism_pressure_level
                      ? `Regional pressure is ${selectedDestination.tourism_pressure_level.toLowerCase()} at ${selectedDestination.tourism_pressure_value?.toFixed(1) ?? '—'}% for ${mapMonth}.`
                      : 'Regional pressure is unavailable for this destination and month.'}
                  </p>
                </div>

                {/* Actions */}
                <Button size="sm" className="w-full" nativeButton={false} render={<Link href={`/destinations/${selectedDestination.slug}`} />}>
                    <span>View Destination</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl border border-dashed border-border bg-card space-y-2">
              <MapPin className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs font-black text-foreground">Select a pin on the map</p>
              <p className="text-[11px] text-muted-foreground">
                Click any colored marker across Sri Lanka to view its eco-friendly score and crowd level.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
