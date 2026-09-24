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
  ShieldCheck,
  Leaf,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DESTINATIONS } from '@/lib/mockData';
import { Destination, PressureLevel } from '@/types/ceylontour';
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
        return 'bg-moonstone text-white ring-moonstone/40';
      case 'MEDIUM':
        return 'bg-midnight-green text-white ring-midnight-green/40';
      case 'HIGH':
        return 'bg-rose-500 text-white ring-rose-500/40';
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto w-full">
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44A6B5]">
              Geographic Intelligence
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-black">
              <span className="size-2 rounded-full bg-[#44A6B5] animate-pulse" />
              12 Active Carrying Capacity Nodes
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-black tracking-tight mt-0.5">
            Sri Lanka Sustainability Map
          </h1>
          <p className="text-xs sm:text-sm text-[#5A737D] mt-0.5">
            Explore monitored regional destinations across green (low), amber (medium), and red (high) visitor density.
          </p>
        </div>

        {/* Pressure Filter Tabs (Segmented Control in radiant #004554 and soft lagoon) */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] border border-[#B5D7E4] shadow-[inset_0_1px_3px_rgba(0,69,84,0.06)] shrink-0">
          <button
            type="button"
            onClick={() => setActivePressureFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              activePressureFilter === 'ALL'
                ? 'bg-gradient-to-r from-[#003E4C] via-[#004E5F] to-[#04667C] text-white shadow-[0_3px_12px_rgba(0,69,84,0.28)] ring-1 ring-white/20 font-black'
                : 'bg-white/60 hover:bg-white text-[#004554] hover:text-[#002D38] border border-transparent hover:border-[#B5D7E4] hover:shadow-2xs font-bold'
            }`}
          >
            All Sanctuaries ({DESTINATIONS.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePressureFilter('LOW')}
            className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activePressureFilter === 'LOW'
                ? 'bg-gradient-to-r from-[#047857] to-[#059669] text-white shadow-[0_3px_12px_rgba(4,120,87,0.3)] ring-1 ring-white/20 font-black'
                : 'bg-white/60 hover:bg-emerald-50 text-emerald-800 border border-transparent hover:border-emerald-200 hover:shadow-2xs font-bold'
            }`}
          >
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Low Pressure</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePressureFilter('MEDIUM')}
            className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activePressureFilter === 'MEDIUM'
                ? 'bg-gradient-to-r from-[#B45309] to-[#D97706] text-white shadow-[0_3px_12px_rgba(180,83,9,0.3)] ring-1 ring-white/20 font-black'
                : 'bg-white/60 hover:bg-amber-50 text-amber-800 border border-transparent hover:border-amber-200 hover:shadow-2xs font-bold'
            }`}
          >
            <span className="size-2 rounded-full bg-amber-500" />
            <span>Medium</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePressureFilter('HIGH')}
            className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activePressureFilter === 'HIGH'
                ? 'bg-gradient-to-r from-[#BE123C] to-[#E11D48] text-white shadow-[0_3px_12px_rgba(190,18,60,0.3)] ring-1 ring-white/20 font-black'
                : 'bg-white/60 hover:bg-rose-50 text-rose-800 border border-transparent hover:border-rose-200 hover:shadow-2xs font-bold'
            }`}
          >
            <span className="size-2 rounded-full bg-rose-500" />
            <span>High Hubs</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Metric KPI Summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-[0_8px_25px_rgba(0,69,84,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
              Plotted Sanctuaries
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-[#004554]">{DESTINATIONS.length}</span>
              <span className="text-xs text-[#5A737D] font-bold">nodes</span>
            </div>
            <p className="text-[11px] text-[#004554] font-bold mt-0.5">
              Active telemetry
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-[#EAF4F7] text-[#004554] border border-[#004554]/10">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-[0_8px_25px_rgba(0,69,84,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
              Uncrowded Havens
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-[#004554]">8</span>
              <span className="text-xs text-[#5A737D] font-bold">low crowd</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
              ● 67% tranquility buffer
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-[#EAF4F7] text-[#004554] border border-[#004554]/10">
            <Leaf className="w-5 h-5 text-[#004554]" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-[0_8px_25px_rgba(0,69,84,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
              Island Avg Eco Index
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-[#004554]">86</span>
              <span className="text-xs text-[#5A737D] font-bold">/100</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
              Verified sustainable
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-[#EAF4F7] text-[#004554] border border-[#004554]/10">
            <ShieldCheck className="w-5 h-5 text-[#44A6B5]" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-[0_8px_25px_rgba(0,69,84,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
              Selected Target
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-xl sm:text-2xl font-black text-black truncate max-w-[130px]">
                {selectedDestination?.name || 'Belihuloya'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-bold mt-0.5">
              {selectedDestination?.district} District
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-100 text-black">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Main Map Canvas + Inspector Workspace ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas (8 Cols) */}
        <div className="lg:col-span-8 relative rounded-3xl border border-black/8 bg-white p-6 sm:p-10 min-h-[580px] flex items-center justify-center overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {/* Subtle Coordinate Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#44A6B5_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          {/* Compass Rose Header */}
          <div className="absolute top-6 left-6 flex items-center gap-2 text-neutral-500 font-mono text-[11px] uppercase font-bold tracking-wider">
            <Compass className="w-5 h-5 text-moonstone" />
            <span>CEYLON 80°E • 7°N</span>
          </div>

          {/* Legend Box */}
          <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-black/10 shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Carrying Capacity
            </span>
            <div className="flex items-center gap-2 text-black font-bold">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span>Low Pressure (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-2 text-black font-bold">
              <span className="size-2.5 rounded-full bg-amber-500" />
              <span>Medium Pressure (40-70%)</span>
            </div>
            <div className="flex items-center gap-2 text-black font-bold">
              <span className="size-2.5 rounded-full bg-rose-500" />
              <span>High Pressure (&gt;70%)</span>
            </div>
          </div>

          {/* Interactive Sri Lanka Geographic Map */}
          <div className="relative w-full max-w-[420px] aspect-[4/5]">
            <svg
              viewBox="0 0 400 520"
              className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,69,84,0.12)] filter"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Island Landmass Contour */}
              <path
                d="M175 25 C190 20, 205 35, 215 55 C230 85, 245 110, 255 140 C270 180, 290 220, 295 270 C300 310, 290 350, 270 390 C250 430, 220 465, 185 485 C160 495, 140 480, 130 460 C115 425, 110 380, 115 340 C118 305, 120 270, 125 230 C130 180, 135 140, 145 95 C152 65, 160 35, 175 25 Z"
                className="fill-alice-blue stroke-light-blue/80"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Jaffna projection */}
              <path
                d="M170 28 C160 18, 145 15, 135 22 C145 35, 160 38, 170 28 Z"
                className="fill-alice-blue stroke-light-blue/80"
                strokeWidth="2"
              />

              {/* Central Highlands elevation zone contour */}
              <path
                d="M175 230 C205 220, 235 240, 245 280 C250 310, 230 350, 200 360 C175 365, 160 330, 165 290 C168 260, 165 240, 175 230 Z"
                className="fill-light-blue/20 stroke-moonstone/40 stroke-dashed"
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
                    className={`relative size-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-md border-2 border-white transition-all group-hover:scale-125 ${pinColor} ${
                      isSelected ? 'ring-4 ring-midnight-green scale-125 z-30' : ''
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>

                  {/* Hover Tag */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-8 hidden group-hover:flex items-center px-2.5 py-1 rounded-xl bg-midnight-green/90 backdrop-blur-md text-white text-[11px] font-bold whitespace-nowrap shadow-md pointer-events-none">
                    {dest.name} ({dest.sustainability.overall})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Destination Details Panel (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          {selectedDestination ? (
            <div className="rounded-3xl border border-light-blue/40 bg-white overflow-hidden shadow-[0_8px_30px_rgba(0,69,84,0.04)] space-y-4">
              {/* Destination Image Preview */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-green/85 via-midnight-green/20 to-transparent" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-midnight-green/85 text-alice-blue border border-white/20 backdrop-blur-md">
                    {selectedDestination.pressure.score}% {selectedDestination.pressure.level}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSaveDestination(selectedDestination.id)}
                  className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 hover:bg-white text-midnight-green shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isSaved(selectedDestination.id) ? 'fill-rose-500 text-rose-500' : 'text-midnight-green'
                    }`}
                  />
                </button>

                <div className="absolute bottom-3.5 inset-x-4 text-white">
                  <span className="text-[11px] font-bold text-light-blue uppercase tracking-wider block">
                    {selectedDestination.district} District
                  </span>
                  <h3 className="font-heading text-xl font-bold leading-tight mt-0.5">
                    {selectedDestination.name}
                  </h3>
                </div>
              </div>

              {/* Panel Details */}
              <div className="p-5 space-y-4 pt-0">
                <p className="text-xs text-[#5A737D] leading-relaxed">
                  {selectedDestination.tagline}
                </p>

                {/* Scores Matrix */}
                <div className="p-4 rounded-2xl bg-[#EAF4F7]/60 border border-[#004554]/10 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#004554]/10">
                    <span className="font-black text-[#004554]">Sustainability Score</span>
                    <span className="font-black text-[#004554]">
                      {selectedDestination.sustainability.overall} / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#5A737D] font-semibold block">Environmental</span>
                      <span className="font-black text-[#004554]">
                        {selectedDestination.sustainability.environmental}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-[#5A737D] font-semibold block">Community Benefit</span>
                      <span className="font-black text-[#004554]">
                        {selectedDestination.sustainability.communityBenefit}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-[#5A737D] font-semibold block">Crowd Index</span>
                      <span className="font-black text-[#004554]">
                        {selectedDestination.sustainability.crowd}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-[#5A737D] font-semibold block">Traveler Fit</span>
                      <span className="font-black text-[#004554]">
                        {selectedDestination.sustainability.touristSuitability}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* XAI Preview */}
                <div className="p-3.5 rounded-2xl bg-[#EAF4F7]/40 border border-[#004554]/10">
                  <span className="text-[11px] font-black text-[#004554] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#44A6B5]" />
                    Why Choose This Sanctuary
                  </span>
                  <p className="text-[11px] text-[#5A737D] mt-1 leading-relaxed">
                    {selectedDestination.xaiExplanation.summary}
                  </p>
                </div>

                {/* Actions */}
                <Link href={`/destinations/${selectedDestination.id}`} className="block">
                  <Button size="sm" className="w-full rounded-2xl gap-2 cursor-pointer bg-[#004554] text-white hover:bg-[#003844] shadow-md font-bold py-5">
                    <span>View Destination Dossier</span>
                    <ArrowRight className="w-4 h-4 text-[#44A6B5]" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl border border-dashed border-[#004554]/20 bg-white space-y-2">
              <MapPin className="w-8 h-8 text-[#5A737D]/60 mx-auto" />
              <p className="text-xs font-black text-[#004554]">Select a pin on the map</p>
              <p className="text-[11px] text-[#5A737D]">
                Click any colored marker across Sri Lanka to view its sustainability and carrying capacity breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
