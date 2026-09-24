'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  RotateCcw,
  Heart,
  ArrowRight,
  Sparkles,
  Search,
  Calendar,
  Sliders,
  TrendingUp,
  MapPin,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRecommendations } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

export default function RecommendationResultsPage() {
  const { currentPreferences, isSaved, toggleSaveDestination } = useAuth();

  const results = useMemo(() => {
    return getRecommendations(currentPreferences);
  }, [currentPreferences]);

  const avgSustainability = useMemo(() => {
    if (!results.length) return 85;
    return Math.round(
      results.reduce((acc, r) => acc + r.destination.sustainability.overall, 0) / results.length
    );
  }, [results]);

  const getPressureBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Low Pressure
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Moderate Pressure
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black">
            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            High Pressure Hub
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search matched destinations..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-black/10 text-xs font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#004554]/12 text-xs font-bold text-[#004554] shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#44A6B5]" />
            <span>{currentPreferences.durationDays || 5} Days Trip Plan</span>
          </div>

          <Link
            href="/discover"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#004554] hover:bg-[#003844] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#44A6B5]" />
            <span>Calibrate AI Finder</span>
          </Link>
        </div>
      </div>

      {/* 4 Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-3xl border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.03)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A737D] uppercase tracking-wider">Top Match Sanctuary</span>
            <div className="w-8 h-8 rounded-full bg-[#EAF4F7] flex items-center justify-center text-[#004554]">
              <Sparkles className="w-4 h-4 text-[#44A6B5]" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-xl font-black text-black tracking-tight block truncate max-w-[160px]">
                {results[0]?.destination.name || 'Belihuloya'}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold block mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> #1 Recommended
              </span>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-black text-white font-heading font-black text-sm flex items-center justify-center shadow-xs">
              #1
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-3xl border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.03)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A737D] uppercase tracking-wider">Avg Sustainability</span>
            <div className="w-8 h-8 rounded-full bg-[#EAF4F7] flex items-center justify-center text-[#004554]">
              <Leaf className="w-4 h-4 text-[#44A6B5]" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-black tracking-tight">{avgSustainability}%</span>
              <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                Low carbon impact
              </span>
            </div>
            {/* SVG Circular Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * avgSustainability) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-black">{avgSustainability}%</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-3xl border border-black/8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Matches Evaluated</span>
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-black">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-black tracking-tight">{results.length}</span>
              <span className="text-[11px] text-neutral-500 font-bold block mt-0.5">
                Curated sites
              </span>
            </div>
            {/* Sparkline */}
            <svg className="w-16 h-8 overflow-visible" viewBox="0 0 60 25">
              <path
                d="M 0 16 Q 15 4, 30 12 T 60 2"
                fill="none"
                stroke="#000000"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-3xl border border-black/8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Overtourism Avoidance</span>
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-black">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-black tracking-tight">88%</span>
              <span className="text-[11px] text-emerald-600 font-bold block mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Dispersal Score
              </span>
            </div>
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 h-4 bg-neutral-200 rounded-full" />
              <div className="w-1.5 h-6 bg-neutral-400 rounded-full" />
              <div className="w-1.5 h-7 bg-moonstone rounded-full" />
              <div className="w-1.5 h-8 bg-black rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Applied Preferences Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.03)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-black text-[#004554] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#44A6B5]" /> Active Calibration:
          </span>
          {currentPreferences.interests.map((int) => (
            <span key={int} className="px-3 py-1 rounded-full bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] text-[#004554] font-bold text-xs border border-[#B5D7E4] shadow-2xs">
              {int}
            </span>
          ))}
          <span className="px-3 py-1 rounded-full bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] text-[#004554] font-bold text-xs border border-[#B5D7E4] shadow-2xs">
            {currentPreferences.crowdPreference === 'quiet'
              ? 'Peaceful Atmosphere'
              : currentPreferences.crowdPreference === 'balanced'
              ? 'Balanced Flow'
              : 'Popular Landmarks'}
          </span>
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#003E4C] via-[#004E5F] to-[#04667C] text-white font-black text-xs shadow-xs">
            {currentPreferences.sustainabilityImportance}% Sustainability Weight
          </span>
        </div>

        <span className="text-xs font-bold text-[#5A737D]">
          Showing {results.length} ranked sanctuaries
        </span>
      </div>

      {/* Ranked Sanctuary Cards (Kleon Style) */}
      <div className="space-y-5">
        {results.map((item) => {
          const { rank, destination: dest, whyMatches } = item;
          const isBookmarked = isSaved(dest.id);

          return (
            <div
              key={dest.id}
              className="bg-white rounded-3xl border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.03)] overflow-hidden hover:border-[#004554]/25 hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row group"
            >
              {/* Photo Showcase */}
              <div className="relative w-full lg:w-80 min-h-[220px] lg:min-h-full overflow-hidden shrink-0">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#004554]/75 lg:from-transparent via-transparent to-transparent pointer-events-none" />

                {/* Rank Badge */}
                <div className="absolute top-4 left-4">
                  <div className="w-9 h-9 rounded-2xl bg-[#004554]/90 backdrop-blur-md border border-white/20 text-white font-heading font-black text-sm flex items-center justify-center shadow-md">
                    #{rank}
                  </div>
                </div>

                {/* Pressure Badge (Mobile) */}
                <div className="absolute top-4 right-4 lg:hidden">
                  {getPressureBadge(dest.pressure.level)}
                </div>

                <div className="absolute bottom-4 left-4 text-white lg:hidden">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#44A6B5]" /> {dest.district} District
                  </span>
                </div>
              </div>

              {/* Details & Metrics */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-xl sm:text-2xl font-black text-black group-hover:text-neutral-800 transition-colors">
                          {dest.name}
                        </h2>
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#5A737D] font-bold">
                          • <MapPin className="w-3.5 h-3.5 text-[#44A6B5]" /> {dest.district} District
                        </span>
                      </div>
                      <p className="text-xs text-[#5A737D] mt-1">{dest.tagline}</p>
                    </div>

                    <div className="hidden lg:block">
                      {getPressureBadge(dest.pressure.level)}
                    </div>
                  </div>

                  {/* Sustainability Metrics Breakdown */}
                  <div className="mt-4 p-4 rounded-2xl bg-[#EAF4F7]/40 border border-[#004554]/10 grid grid-cols-2 sm:grid-cols-6 gap-3 items-center">
                    {/* Overall Score */}
                    <div className="col-span-2 sm:col-span-1 pr-2 border-r-0 sm:border-r border-[#004554]/10">
                      <span className="text-[10px] uppercase font-black text-[#5A737D] block">
                        Sustainability
                      </span>
                      <span className="font-heading text-2xl font-black text-[#004554] leading-none mt-0.5 block">
                        {dest.sustainability.overall}
                        <span className="text-xs font-normal text-[#5A737D]">/100</span>
                      </span>
                    </div>

                    <div className="text-center sm:text-left">
                      <span className="text-[10px] font-bold text-[#5A737D] block truncate">Environmental</span>
                      <span className="text-xs font-black text-[#004554]">{dest.sustainability.environmental}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] font-bold text-[#5A737D] block truncate">Community</span>
                      <span className="text-xs font-black text-[#004554]">{dest.sustainability.communityBenefit}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] font-bold text-[#5A737D] block truncate">Crowd Index</span>
                      <span className="text-xs font-black text-[#004554]">{dest.sustainability.crowd}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] font-bold text-[#5A737D] block truncate">Infrastructure</span>
                      <span className="text-xs font-black text-[#004554]">{dest.sustainability.infrastructure}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] font-bold text-[#5A737D] block truncate">Suitability</span>
                      <span className="text-xs font-black text-[#004554]">{dest.sustainability.touristSuitability}</span>
                    </div>
                  </div>

                  {/* Why this matches you */}
                  <div className="mt-3.5 flex items-start gap-2.5 p-3 rounded-2xl bg-[#EAF4F7]/30 border border-[#004554]/10">
                    <Sparkles className="w-4 h-4 text-[#44A6B5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black text-[#004554] block">
                        Why this matches your travel profile
                      </span>
                      <p className="text-xs text-[#5A737D] mt-0.5 leading-relaxed">
                        {whyMatches}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-[#004554]/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSaveDestination(dest.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      isBookmarked
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-white hover:bg-[#EAF4F7] text-[#004554] border-[#004554]/15'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{isBookmarked ? 'Saved to Bookmarks' : 'Bookmark'}</span>
                  </button>

                  <Link href={`/destinations/${dest.id}`}>
                    <Button size="sm" className="rounded-full px-5 py-2 bg-[#004554] hover:bg-[#003844] text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs">
                      <span>Explore Destination</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#44A6B5]" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
