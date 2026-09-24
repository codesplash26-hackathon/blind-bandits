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
        <h2 className="text-xl font-bold text-[#004554]">Destination Not Found</h2>
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFFFFF] border border-[#004554]/10 text-xs font-bold text-[#004554] shadow-[0_2px_10px_rgba(0,69,84,0.03)] hover:bg-[#E9F1F6] transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-[#44A6B5] group-hover:-translate-x-1 transition-transform" />
            <span>All Sanctuaries</span>
          </Link>

          <span className="text-xs font-semibold text-[#004554]/50 hidden sm:inline">
            Catalog &gt; {destination.district} &gt; {destination.name}
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FFFFFF] border border-[#004554]/10 text-xs font-semibold text-[#004554] shadow-[0_2px_10px_rgba(0,69,84,0.03)]">
            <Calendar className="w-3.5 h-3.5 text-[#44A6B5]" />
            <span>Optimal: {destination.recommendedDurationDays || 3} Days</span>
          </div>

          <button
            type="button"
            onClick={() => toggleSaveDestination(destination.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm ${
              isBookmarked
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-[#FFFFFF] hover:bg-[#E9F1F6] text-[#004554] border-[#004554]/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Destination'}</span>
          </button>
        </div>
      </div>

      {/* 4 Kleon Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Sustainability Index */}
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.04)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#004554]/60">Sustainability Score</span>
            <div className="w-8 h-8 rounded-full bg-[#E9F1F6] flex items-center justify-center text-[#44A6B5]">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-[#004554] tracking-tight">
                {destination.sustainability.overall}
                <span className="text-sm font-normal text-[#004554]/50">/100</span>
              </span>
              <span className="text-[11px] text-[#44A6B5] font-bold block mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Certified Eco Standard
              </span>
            </div>
            {/* SVG Circular Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E9F1F6" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#44A6B5"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * destination.sustainability.overall) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#004554]">{destination.sustainability.overall}%</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Tourism Pressure */}
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.04)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#004554]/60">Tourism Pressure</span>
            <div className="w-8 h-8 rounded-full bg-[#E9F1F6] flex items-center justify-center text-[#44A6B5]">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-[#004554] tracking-tight">
                {destination.pressure.score}%
              </span>
              <span className={`text-[11px] font-bold block mt-0.5 ${isHighPressure ? 'text-rose-600' : 'text-[#44A6B5]'}`}>
                {destination.pressure.level} Pressure Zone
              </span>
            </div>
            {/* Mini Sparkline */}
            <svg className="w-16 h-8 overflow-visible" viewBox="0 0 60 25">
              <path
                d="M 0 16 Q 15 5, 30 14 T 60 4"
                fill="none"
                stroke={isHighPressure ? '#E11D48' : '#004554'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: Typical Budget */}
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.04)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#004554]/60">Est. 3-Day Budget</span>
            <div className="w-8 h-8 rounded-full bg-[#E9F1F6] flex items-center justify-center text-[#44A6B5]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-2xl font-black text-[#004554] tracking-tight">
                LKR {(destination.typicalBudgetLKR / 1000).toFixed(0)}k
              </span>
              <span className="text-[11px] text-[#004554]/60 font-semibold block mt-0.5">
                Homestays &amp; meals
              </span>
            </div>
            {/* Mini Bars */}
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 h-3 bg-[#E9F1F6] rounded-full" />
              <div className="w-1.5 h-5 bg-[#B2D5E2] rounded-full" />
              <div className="w-1.5 h-7 bg-[#44A6B5] rounded-full" />
              <div className="w-1.5 h-8 bg-[#004554] rounded-full" />
            </div>
          </div>
        </div>

        {/* KPI 4: Climate & Air Quality */}
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.04)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#004554]/60">Microclimate &amp; AQI</span>
            <div className="w-8 h-8 rounded-full bg-[#E9F1F6] flex items-center justify-center text-[#44A6B5]">
              <CloudSun className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-xl font-bold text-[#004554] tracking-tight">
                {destination.weather || '24°C • Pleasant'}
              </span>
              <span className="text-[11px] text-[#44A6B5] font-bold block mt-0.5">
                {destination.airQuality || 'AQI 15 • Pristine Air'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#E9F1F6] flex items-center justify-center text-[#004554]">
              <Wind className="w-4 h-4 text-[#44A6B5]" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#004554]/10 bg-[#FFFFFF] shadow-[0_8px_30px_rgba(0,69,84,0.04)]">
        <div className="relative h-72 sm:h-96 w-full">
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#004554]/95 via-[#004554]/40 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
              <MapPin className="w-3.5 h-3.5 text-[#44A6B5]" />
              <span>{destination.district} District, {destination.province}</span>
            </span>
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-medium text-white/90">
              {destination.landscape}
            </span>
          </div>

          {/* Hero Content Bottom */}
          <div className="absolute bottom-6 inset-x-6 text-white space-y-2">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {destination.name}
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-2xl font-light leading-relaxed">
              {destination.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* OVERTOURISM WARNING SECTION (Shown if High Pressure) */}
      {isHighPressure && (
        <div className="rounded-3xl border-2 border-rose-300 bg-rose-50/60 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-rose-700">
                  Overtourism Alert: High Visitor Pressure ({destination.pressure.score}%)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  PEAK DENSITY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-800/80 leading-relaxed">
                This destination is currently experiencing peak visitor concentration. High footfall along viewpoints and trail bottlenecks causes stress on local waste processing and roads.
              </p>
            </div>
          </div>

          {/* Pressure Factor Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-rose-200">
            <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700/60 block">Visitor Density</span>
              <span className="text-base font-extrabold text-rose-700">{destination.pressure.visitorDensity}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700/60 block">Infra Pressure</span>
              <span className="text-base font-extrabold text-rose-700">{destination.pressure.infrastructurePressure}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700/60 block">Waste Strain</span>
              <span className="text-base font-extrabold text-rose-700">{destination.pressure.wastePressure}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700/60 block">Traffic Density</span>
              <span className="text-base font-extrabold text-rose-700">{destination.pressure.traffic}%</span>
            </div>
          </div>

          {/* Alternatives Callout */}
          {destination.alternatives && destination.alternatives.length > 0 && (
            <div className="pt-3 space-y-3">
              <h3 className="text-sm font-bold text-[#004554]">
                Consider these serene, low-pressure alternatives
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {destination.alternatives.map((alt) => (
                  <Link
                    key={alt.id}
                    href={`/destinations/${alt.id}`}
                    className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#004554]/10 hover:border-[#44A6B5] transition-all hover:shadow-md space-y-2 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#44A6B5]">
                          {alt.similarity}% match
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#E9F1F6] text-[#004554] text-[10px] font-bold">
                          {alt.pressureLevel}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#004554] mt-1 group-hover:text-[#44A6B5] transition-colors">
                        {alt.name}
                      </h4>
                      <p className="text-[11px] text-[#004554]/60 mt-0.5 line-clamp-2">
                        {alt.tagline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#004554]/10 flex items-center justify-between text-xs">
                      <span className="text-[#004554]/60">Sustainability:</span>
                      <span className="font-bold text-[#004554]">{alt.sustainabilityScore}/100</span>
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
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.04)] space-y-4">
            <div>
              <h2 className="text-base font-black text-black">Sustainability 5-Dimension Index</h2>
              <p className="text-xs text-[#5A737D]">
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
                      <span className="font-bold text-[#004554]">{item.label}</span>
                      <span className="text-[10px] text-[#004554]/50 hidden sm:inline ml-1.5">({item.desc})</span>
                    </div>
                    <span className="font-bold text-[#004554] font-mono">{item.value}/100</span>
                  </div>
                  <div className="h-2 w-full bg-[#E9F1F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#004554] to-[#44A6B5] transition-all duration-700"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable AI (XAI) Why this was recommended */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#44A6B5]" />
                  <h2 className="text-base font-black text-black">
                    AI Evaluation &amp; TreeSHAP Analysis
                  </h2>
                </div>
                <p className="text-xs text-[#5A737D]">
                  Algorithmic feature contribution towards recommendation
                </p>
              </div>
              <Badge variant="outline" className="border-[#44A6B5]/30 text-[#004554] bg-[#E9F1F6]/50">
                XAI Model
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-[#E9F1F6]/40 border border-[#004554]/10">
              <p className="text-xs sm:text-sm text-[#004554] leading-relaxed">
                &ldquo;{destination.xaiExplanation.summary}&rdquo;
              </p>
            </div>

            {/* TreeSHAP Contribution Bar Chart */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-[#004554]/70 uppercase tracking-wider block">
                Factor Contribution Weights
              </span>

              {destination.xaiExplanation.contributions.map((c) => (
                <div key={c.factor} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#004554]">{c.factor}</span>
                    <span className={`font-bold font-mono ${c.positive ? 'text-[#44A6B5]' : 'text-rose-600'}`}>
                      {c.percentage > 0 ? `+${c.percentage}%` : `${c.percentage}%`}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#E9F1F6] rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.positive
                          ? 'bg-[#44A6B5]'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.abs(c.percentage)}%` }}
                    />
                  </div>
                  {c.description && (
                    <span className="text-[10px] text-[#004554]/60 block">{c.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Interactive What-If Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.04)] space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#44A6B5]" />
                <h2 className="text-base font-black text-black">
                  What-If Impact Simulator
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulator(!showSimulator)}
                className="text-xs text-[#44A6B5] font-bold hover:underline cursor-pointer"
              >
                {showSimulator ? 'Collapse' : 'Expand'}
              </button>
            </div>

            <p className="text-xs text-[#004554]/60">
              Simulate how future visitor density and municipal eco-interventions affect this sanctuary&apos;s live score.
            </p>

            {showSimulator && (
              <div className="space-y-4 pt-1">
                {/* Slider 1: Expected Visitors */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#004554]">Expected Weekly Visitors</span>
                    <span className="font-mono font-bold text-[#004554]">
                      {Math.round(2000 + visitorSlider * 100)} / week
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={visitorSlider}
                    onChange={(e) => setVisitorSlider(Number(e.target.value))}
                    className="w-full h-2 bg-[#E9F1F6] rounded-lg appearance-none cursor-pointer accent-[#004554]"
                  />
                  <div className="flex justify-between text-[10px] text-[#004554]/50">
                    <span>2,000 (Tranquil)</span>
                    <span>12,000 (Congested)</span>
                  </div>
                </div>

                {/* Slider 2: Waste Management */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#004554]">Waste Sorting &amp; Composting</span>
                    <span className="font-mono font-bold text-[#44A6B5]">
                      {wasteSlider > 66 ? 'Zero Waste' : wasteSlider > 33 ? 'Moderate' : 'Understaffed'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={wasteSlider}
                    onChange={(e) => setWasteSlider(Number(e.target.value))}
                    className="w-full h-2 bg-[#E9F1F6] rounded-lg appearance-none cursor-pointer accent-[#44A6B5]"
                  />
                </div>

                {/* Slider 3: Eco-Infrastructure */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#004554]">Eco Transit &amp; Solar Trails</span>
                    <span className="font-mono font-bold text-[#004554]">
                      {infraSlider > 66 ? 'High Grade' : infraSlider > 33 ? 'Standard' : 'Primitive'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={infraSlider}
                    onChange={(e) => setInfraSlider(Number(e.target.value))}
                    className="w-full h-2 bg-[#E9F1F6] rounded-lg appearance-none cursor-pointer accent-[#004554]"
                  />
                </div>

                {/* Simulation Output Card */}
                <div className="p-4 rounded-2xl bg-[#E9F1F6]/50 border border-[#004554]/10 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-center divide-x divide-[#004554]/10">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#004554]/60 block">
                        Current Score
                      </span>
                      <span className="text-2xl font-black text-[#004554] mt-1 block">
                        {destination.sustainability.overall}
                      </span>
                    </div>

                    <div className="pl-4">
                      <span className="text-[10px] uppercase font-bold text-[#004554]/60 block">
                        Simulated Score
                      </span>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <span className="text-2xl font-black text-[#004554]">
                          {simulation.simulatedSustainability}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            simulation.deltaSustainability >= 0 ? 'text-[#44A6B5]' : 'text-rose-600'
                          }`}
                        >
                          {simulation.deltaSustainability >= 0
                            ? `↑ ${simulation.deltaSustainability}`
                            : `↓ ${Math.abs(simulation.deltaSustainability)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#004554]/70 text-center italic pt-1">
                    {simulation.alertMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Destination Travel Guide Specs */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.04)] space-y-4">
            <h2 className="text-base font-black text-black">Key Activities &amp; Highlights</h2>

            <div className="flex flex-wrap gap-2">
              {destination.activities.map((act) => (
                <span
                  key={act}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E9F1F6] text-[#004554] border border-[#004554]/10"
                >
                  {act}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-[#004554]/10 flex items-center justify-between text-xs text-[#004554]/70">
              <span>Data Telemetry Reliability</span>
              <span className="font-bold text-[#004554] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#44A6B5]" /> Verified 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
