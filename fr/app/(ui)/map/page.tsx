'use client';

import React, { useEffect, useState } from 'react';
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
import { Loader } from '@/components/Loader';
import { getMapDestinations } from '@/lib/destinations';
import describeApiError from '@/lib/apiError';

interface MapMarker extends MapDestination {
  mapXPercent: number;
  mapYPercent: number;
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function mapCoordinates(latitude: number, longitude: number) {
  const x = 30 + ((longitude - 79.7) / (81.9 - 79.7)) * 42;
  const y = 92 - ((latitude - 5.8) / (9.8 - 5.8)) * 82;
  return {
    mapXPercent: Math.min(75, Math.max(25, x)),
    mapYPercent: Math.min(95, Math.max(4, y)),
  };
}

export default function SriLankaMapPage() {
  const { isSaved, toggleSaveDestination } = useAuth();

  const [destinations, setDestinations] = useState<MapMarker[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<MapMarker | null>(null);
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
          const mapped = response.destinations.map((destination) => ({
            ...destination,
            ...mapCoordinates(destination.latitude, destination.longitude),
          }));
          setDestinations(mapped);
          setSelectedDestination(mapped[0] ?? null);
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
        <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="text-sm font-bold text-primary hover:underline">
          Retry
        </button>
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

  const getPinColor = (level: PressureLevel | null) => {
    switch (level) {
      case 'LOW':
        return 'bg-success text-success-foreground ring-success/40';
      case 'MEDIUM':
        return 'bg-warning text-warning-foreground ring-warning/40';
      case 'HIGH':
        return 'bg-destructive text-destructive-foreground ring-destructive/40';
      default:
        return 'bg-muted text-muted-foreground ring-border';
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto w-full">
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Interactive Map
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              {destinations.length} Active Destination Nodes
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
          <label className="flex items-center gap-2 px-2 text-[10px] font-bold text-muted-foreground">
            Forecast month
            <input
              type="month"
              value={mapMonth}
              onChange={(event) => setMapMonth(event.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-[10px] text-foreground"
            />
          </label>
          <button
            type="button"
            onClick={() => setActivePressureFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              activePressureFilter === 'ALL'
                ? 'bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--shadow-color)_28%,transparent)] ring-1 ring-overlay-foreground/20 font-black'
                : 'bg-card/60 hover:bg-card text-primary hover:text-primary border border-transparent hover:border-border hover:shadow-2xs font-bold'
            }`}
          >
            All Sanctuaries ({destinations.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePressureFilter('LOW')}
            className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activePressureFilter === 'LOW'
                ? 'bg-success text-success-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--success)_30%,transparent)] ring-1 ring-overlay-foreground/20 font-black'
                : 'bg-card/60 hover:bg-success/10 text-success border border-transparent hover:border-success/25 hover:shadow-2xs font-bold'
            }`}
          >
            <span className="size-2 rounded-full bg-success" />
            <span>Quiet</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePressureFilter('MEDIUM')}
            className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activePressureFilter === 'MEDIUM'
                ? 'bg-warning text-warning-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--warning)_30%,transparent)] ring-1 ring-overlay-foreground/20 font-black'
                : 'bg-card/60 hover:bg-warning/10 text-warning border border-transparent hover:border-warning/25 hover:shadow-2xs font-bold'
            }`}
          >
            <span className="size-2 rounded-full bg-warning" />
            <span>Medium</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePressureFilter('HIGH')}
            className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activePressureFilter === 'HIGH'
                ? 'bg-destructive text-destructive-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--destructive)_30%,transparent)] ring-1 ring-overlay-foreground/20 font-black'
                : 'bg-card/60 hover:bg-destructive/10 text-destructive border border-transparent hover:border-destructive/25 hover:shadow-2xs font-bold'
            }`}
          >
            <span className="size-2 rounded-full bg-destructive" />
            <span>Busy Hubs</span>
          </button>
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
              <span className="font-heading text-3xl font-black text-primary">{destinations.length}</span>
              <span className="text-xs text-muted-foreground font-bold">nodes</span>
            </div>
            <p className="text-[11px] text-primary font-bold mt-0.5">
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
              <span className="font-heading text-3xl font-black text-primary">{lowPressureCount}</span>
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
              <span className="font-heading text-3xl font-black text-primary">{averageSustainability ?? '—'}</span>
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
        <div className="lg:col-span-8 relative rounded-3xl border border-border bg-card p-6 sm:p-10 min-h-[580px] flex items-center justify-center overflow-hidden shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)]">
          {/* Subtle Coordinate Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          {/* Compass Rose Header */}
          <div className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground font-mono text-[11px] uppercase font-bold tracking-wider">
            <Compass className="w-5 h-5 text-primary" />
            <span>CEYLON 80°E • 7°N</span>
          </div>

          {/* Legend Box */}
          <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-[0_4px_16px_color-mix(in_srgb,var(--shadow-color)_6%,transparent)] space-y-2 text-xs">
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
          </div>

          {/* Interactive Sri Lanka Geographic Map */}
          <div className="relative w-full max-w-[420px] aspect-[4/5]">
            <svg
              viewBox="0 0 400 520"
              className="w-full h-full drop-shadow-[0_15px_30px_color-mix(in_srgb,var(--shadow-color)_12%,transparent)] filter"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Island Landmass Contour */}
              <path
                d="M175 25 C190 20, 205 35, 215 55 C230 85, 245 110, 255 140 C270 180, 290 220, 295 270 C300 310, 290 350, 270 390 C250 430, 220 465, 185 485 C160 495, 140 480, 130 460 C115 425, 110 380, 115 340 C118 305, 120 270, 125 230 C130 180, 135 140, 145 95 C152 65, 160 35, 175 25 Z"
                className="fill-muted stroke-border"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Jaffna projection */}
              <path
                d="M170 28 C160 18, 145 15, 135 22 C145 35, 160 38, 170 28 Z"
                className="fill-muted stroke-border"
                strokeWidth="2"
              />

              {/* Central Highlands elevation zone contour */}
              <path
                d="M175 230 C205 220, 235 240, 245 280 C250 310, 230 350, 200 360 C175 365, 160 330, 165 290 C168 260, 165 240, 175 230 Z"
                className="fill-secondary/20 stroke-primary/40 stroke-dashed"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>

            {/* Plotted Interactive Destination Pins */}
            {filteredDestinations.map((dest) => {
              const isSelected = selectedDestination?.id === dest.id;
              const pinColor = getPinColor(dest.tourism_pressure_level);

              return (
                <div
                  key={dest.id}
                  style={{
                    left: `${dest.mapXPercent}%`,
                    top: `${dest.mapYPercent}%`,
                  }}
                  onClick={() => setSelectedDestination(dest)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  {/* Outer animated ping ring if high pressure */}
                  {dest.tourism_pressure_level === 'HIGH' && (
                    <span className="absolute -inset-1 rounded-full bg-destructive/40 animate-ping" />
                  )}

                  {/* Marker Circle */}
                  <div
                    className={`relative size-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-md border-2 border-overlay-foreground transition-all group-hover:scale-125 ${pinColor} ${
                      isSelected ? 'ring-4 ring-ring scale-125 z-30' : ''
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>

                  {/* Hover Tag */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-8 hidden group-hover:flex items-center px-2.5 py-1 rounded-xl bg-overlay/90 backdrop-blur-md text-overlay-foreground text-[11px] font-bold whitespace-nowrap shadow-md pointer-events-none">
                    {dest.name} ({dest.sustainability_score ?? '—'})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Destination Details Panel (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          {selectedDestination ? (
            <div className="rounded-3xl border border-border/40 bg-card overflow-hidden shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
              <div className="relative h-32 w-full overflow-hidden bg-muted border-b border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-card" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-overlay/85 text-overlay-foreground border border-overlay-foreground/20 backdrop-blur-md">
                    {selectedDestination.tourism_pressure_value === null
                      ? 'Pressure unavailable'
                      : `${selectedDestination.tourism_pressure_value.toFixed(1)}% ${selectedDestination.tourism_pressure_level ?? ''}`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void toggleSaveDestination(selectedDestination.id)}
                  className="absolute top-3.5 right-3.5 p-2 rounded-full bg-card/90 hover:bg-card text-primary shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isSaved(selectedDestination.id) ? 'fill-destructive text-destructive' : 'text-primary'
                    }`}
                  />
                </button>

                <div className="absolute bottom-3.5 inset-x-4 text-overlay-foreground">
                  <span className="text-[11px] font-bold text-frosted-blue uppercase tracking-wider block">
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
                    <span className="font-black text-primary">Eco-Friendly Score</span>
                    <span className="font-black text-primary">
                      {selectedDestination.sustainability_score ?? '—'} / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground font-semibold block">Environmental</span>
                      <span className="font-black text-primary">
                        {selectedDestination.environmental_score ?? '—'}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold block">Community Benefit</span>
                      <span className="font-black text-primary">
                        {selectedDestination.community_score ?? '—'}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold block">Crowd Index</span>
                      <span className="font-black text-primary">
                        {selectedDestination.tourism_pressure_value ?? '—'}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold block">Traveler Fit</span>
                      <span className="font-black text-primary">
                        —/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* XAI Preview */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <span className="text-[11px] font-black text-primary flex items-center gap-1.5">
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
                <Link href={`/destinations/${selectedDestination.slug}`} className="block">
                  <Button size="sm" className="w-full rounded-2xl gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary shadow-md font-bold py-5">
                    <span>View Destination Dossier</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl border border-dashed border-border bg-card space-y-2">
              <MapPin className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs font-black text-primary">Select a pin on the map</p>
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
