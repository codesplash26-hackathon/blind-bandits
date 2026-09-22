'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Heart,
  ArrowRight,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DESTINATIONS } from '@/lib/mockData';
import { Destination, PressureLevel } from '@/types/ceylontour';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SriLankaMapPage() {
  const { isSaved, toggleSaveDestination } = useAuth();

  // Selected destination on map (defaults to Belihuloya)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(
    DESTINATIONS.find((d) => d.id === 'belihuloya') || DESTINATIONS[0]
  );

  const [activePressureFilter, setActivePressureFilter] = useState<'ALL' | PressureLevel>('ALL');

  const filteredDestinations = DESTINATIONS.filter((d) => {
    if (activePressureFilter === 'ALL') return true;
    return d.pressure.level === activePressureFilter;
  });

  const getPinColor = (level: PressureLevel) => {
    switch (level) {
      case 'LOW':
        return 'bg-emerald-500 text-white ring-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500 text-white ring-amber-500/30';
      case 'HIGH':
        return 'bg-rose-500 text-white ring-rose-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Sri Lanka Sustainability Map
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Explore 12 monitored regional destinations across green (low), amber (medium), and red (high) carrying capacity states.
          </p>
        </div>

        {/* Pressure Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-border shrink-0 shadow-xs">
          <button
            type="button"
            onClick={() => setActivePressureFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activePressureFilter === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Places ({DESTINATIONS.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePressureFilter('LOW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePressureFilter === 'LOW'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Low</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePressureFilter('MEDIUM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePressureFilter === 'MEDIUM'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Medium</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePressureFilter('HIGH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePressureFilter === 'HIGH'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>High</span>
          </button>
        </div>
      </div>

      {/* Main Map Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas (8 Cols) */}
        <div className="lg:col-span-8 relative rounded-3xl border border-border/80 bg-gradient-to-b from-card/80 to-muted/20 p-4 sm:p-8 min-h-[560px] flex items-center justify-center overflow-hidden shadow-lg">
          {/* Subtle Nautical / Coordinate Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#44A6B5_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          {/* Compass Rose Emblem */}
          <div className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground/60">
            <Compass className="w-6 h-6 animate-spin-slow" />
            <span className="text-[11px] font-mono tracking-wider uppercase font-bold">
              CEYLON 80°E • 7°N
            </span>
          </div>

          {/* Legend Box */}
          <div className="absolute bottom-6 left-6 p-3 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-md space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Carrying Capacity
            </span>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Low Pressure (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Medium Pressure (40-70%)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>High Pressure (&gt;70%)</span>
            </div>
          </div>

          {/* Interactive Sri Lanka Geographic Map Container */}
          <div className="relative w-full max-w-[420px] aspect-[4/5]">
            {/* Stylized Sri Lanka SVG Silhouette */}
            <svg
              viewBox="0 0 400 520"
              className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,69,84,0.15)] filter"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Island Landmass Contour */}
              <path
                d="M175 25 C190 20, 205 35, 215 55 C230 85, 245 110, 255 140 C270 180, 290 220, 295 270 C300 310, 290 350, 270 390 C250 430, 220 465, 185 485 C160 495, 140 480, 130 460 C115 425, 110 380, 115 340 C118 305, 120 270, 125 230 C130 180, 135 140, 145 95 C152 65, 160 35, 175 25 Z"
                className="fill-primary/10 dark:fill-primary/20 stroke-primary/40 dark:stroke-primary/50"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Jaffna Peninsula projection */}
              <path
                d="M170 28 C160 18, 145 15, 135 22 C145 35, 160 38, 170 28 Z"
                className="fill-primary/15 stroke-primary/40"
                strokeWidth="2"
              />

              {/* Central Highlands elevation zone contour */}
              <path
                d="M175 230 C205 220, 235 240, 245 280 C250 310, 230 350, 200 360 C175 365, 160 330, 165 290 C168 260, 165 240, 175 230 Z"
                className="fill-secondary/15 stroke-secondary/30 stroke-dashed"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>

            {/* Plotted Interactive Destination Pins */}
            {filteredDestinations.map((dest) => {
              const isSelected = selectedDestination?.id === dest.id;
              const pinColor = getPinColor(dest.pressure.level);

              return (
                <div
                  key={dest.id}
                  style={{
                    left: `${dest.coordinates.mapXPercent}%`,
                    top: `${dest.coordinates.mapYPercent}%`,
                  }}
                  onClick={() => setSelectedDestination(dest)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  {/* Outer animated ping ring if high pressure */}
                  {dest.pressure.level === 'HIGH' && (
                    <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping" />
                  )}

                  {/* Marker Circle */}
                  <div
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-md border-2 border-white dark:border-background transition-all group-hover:scale-125 ${pinColor} ${
                      isSelected ? 'ring-4 ring-primary scale-125 z-30' : ''
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>

                  {/* Hover Tag */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-7 hidden group-hover:flex items-center px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white text-[10px] font-bold whitespace-nowrap shadow-md pointer-events-none">
                    {dest.name} ({dest.sustainability.overall})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Destination Details Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedDestination ? (
            <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xl space-y-4">
              {/* Destination Image Preview */}
              <div className="relative h-44 w-full">
                <Image
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3">
                  <Badge
                    variant={
                      selectedDestination.pressure.level === 'LOW'
                        ? 'success'
                        : selectedDestination.pressure.level === 'MEDIUM'
                        ? 'warning'
                        : 'destructive'
                    }
                  >
                    {selectedDestination.pressure.score}% {selectedDestination.pressure.level}
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSaveDestination(selectedDestination.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isSaved(selectedDestination.id) ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
                </button>

                <div className="absolute bottom-3 inset-x-3 text-white">
                  <span className="text-[11px] font-semibold text-secondary block">
                    {selectedDestination.district} District
                  </span>
                  <h3 className="font-heading text-xl font-bold leading-tight">
                    {selectedDestination.name}
                  </h3>
                </div>
              </div>

              {/* Panel Details */}
              <div className="p-5 space-y-4 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedDestination.tagline}
                </p>

                {/* Scores Matrix */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                    <span className="font-bold text-foreground">Sustainability Score</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {selectedDestination.sustainability.overall}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Environmental</span>
                      <span className="font-bold text-foreground">
                        {selectedDestination.sustainability.environmental}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Community Benefit</span>
                      <span className="font-bold text-foreground">
                        {selectedDestination.sustainability.communityBenefit}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Crowd Index</span>
                      <span className="font-bold text-foreground">
                        {selectedDestination.sustainability.crowd}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Tourist Suitability</span>
                      <span className="font-bold text-foreground">
                        {selectedDestination.sustainability.touristSuitability}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* XAI Preview */}
                <div className="p-3 rounded-xl bg-secondary/5 border border-secondary/20">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-secondary" /> Why Choose This Place
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {selectedDestination.xaiExplanation.summary}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <Link href={`/destinations/${selectedDestination.id}`} className="w-full">
                    <Button size="sm" className="w-full rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
                      <span>View Full Destination</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl border border-dashed border-border bg-card/60 space-y-2">
              <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <p className="text-xs font-semibold text-foreground">Select a pin on the map</p>
              <p className="text-[11px] text-muted-foreground">
                Click any colored marker across Sri Lanka to view its sustainability and carrying capacity breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
