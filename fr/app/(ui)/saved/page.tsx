'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bookmark,
  ArrowRight,
  Compass,
  Trash2,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  Coins,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DESTINATIONS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

export default function SavedDestinationsPage() {
  const { savedDestinationIds, toggleSaveDestination } = useAuth();

  const savedList = useMemo(() => {
    return DESTINATIONS.filter((d) => savedDestinationIds.includes(d.id));
  }, [savedDestinationIds]);

  const totalDays = savedList.reduce((acc, d) => acc + d.recommendedDurationDays, 0);
  const totalBudget = savedList.reduce((acc, d) => acc + d.typicalBudgetLKR, 0);
  const avgSustainability = savedList.length > 0
    ? Math.round(savedList.reduce((acc, d) => acc + d.sustainability.overall, 0) / savedList.length)
    : 0;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto w-full">
      {/* ── 1. Kleon Modern Header ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44A6B5]">
              Traveler Itinerary Bucketlist
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-black">
              <span className="size-2 rounded-full bg-[#44A6B5] animate-pulse" />
              {savedList.length} Curated Sanctuaries
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-black tracking-tight mt-0.5">
            My Saved Sanctuaries
          </h1>
          <p className="text-xs sm:text-sm text-[#5A737D] mt-0.5 font-medium">
            Your personalized bucket list of sustainable, crowd-free destinations ready for trip routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/destinations">
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl gap-2 bg-white border-[#004554]/15 text-[#004554] hover:bg-[#EAF4F7] text-xs font-bold shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-[#44A6B5]" />
              <span>Browse Catalog</span>
            </Button>
          </Link>

          {savedList.length > 0 && (
            <Link href="/discover">
              <Button
                size="sm"
                className="rounded-2xl gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#44A6B5]" />
                <span>Build Itinerary with Saved</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── 2. Kleon Modern Saved Metrics KPI Strip ─────────────────────────── */}
      {savedList.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
                Saved Sanctuaries
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-3xl font-black text-black">{savedList.length}</span>
                <span className="text-xs text-[#5A737D] font-semibold">places</span>
              </div>
              <p className="text-[11px] text-[#5A737D] font-semibold mt-0.5">
                Ready for AI routing
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] text-[#44A6B5] border border-[#B5D7E4] shadow-2xs">
              <Bookmark className="w-5 h-5 text-[#004554]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
                Estimated Duration
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-3xl font-black text-black">{totalDays}</span>
                <span className="text-xs text-[#5A737D] font-semibold">days</span>
              </div>
              <p className="text-[11px] text-[#5A737D] font-semibold mt-0.5">
                Total suggested journey
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] text-[#004554] border border-[#B5D7E4] shadow-2xs">
              <Calendar className="w-5 h-5 text-[#44A6B5]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
                Avg Sustainability
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-3xl font-black text-black">{avgSustainability}</span>
                <span className="text-xs text-[#5A737D] font-semibold">/100</span>
              </div>
              <p className="text-[11px] text-[#5A737D] font-semibold mt-0.5">
                Eco-conscious selection
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] text-[#004554] border border-[#B5D7E4] shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#44A6B5]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
                Total Est. Budget
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-xl sm:text-2xl font-black text-black">
                  {(totalBudget / 1000).toFixed(0)}k
                </span>
                <span className="text-xs text-[#5A737D] font-semibold">LKR</span>
              </div>
              <p className="text-[11px] text-[#5A737D] mt-0.5">
                ~LKR {totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] text-[#004554] border border-[#B5D7E4] shadow-2xs">
              <Coins className="w-5 h-5 text-[#44A6B5]" />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Saved Places Grid ────────────────────────────────────────────── */}
      {savedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map((dest) => (
            <div
              key={dest.id}
              className="group rounded-3xl bg-white border border-[#004554]/10 overflow-hidden shadow-dashboard-card transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-106 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#004554]/85 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#004554]/85 text-white border border-white/20 backdrop-blur-md">
                    {dest.pressure.level} PRESSURE
                  </span>
                </div>

                {/* Remove from Saved Button */}
                <button
                  type="button"
                  onClick={() => toggleSaveDestination(dest.id)}
                  className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 hover:bg-rose-50 text-[#5A737D] hover:text-rose-600 shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3.5 inset-x-4 text-white">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#B2D5E2] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{dest.district} District</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold leading-tight mt-0.5 text-white">
                    {dest.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs pb-2.5 border-b border-[#004554]/10">
                    <span className="text-[#5A737D] font-semibold">Sustainability Index</span>
                    <span className="font-black text-[#004554]">
                      {dest.sustainability.overall} / 100
                    </span>
                  </div>

                  <p className="text-xs text-[#5A737D] line-clamp-2 leading-relaxed">
                    {dest.tagline || dest.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dest.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#EAF4F7] text-[#004554] border border-[#004554]/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#004554]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5A737D] block">Typical Budget</span>
                    <span className="text-xs font-black text-[#004554]">
                      ~LKR {dest.typicalBudgetLKR.toLocaleString()}
                    </span>
                  </div>

                  <Link href={`/destinations/${dest.id}`}>
                    <Button
                      size="xs"
                      variant="outline"
                      className="rounded-xl gap-1 text-xs cursor-pointer border-[#004554]/20 text-[#004554] hover:bg-[#004554] hover:text-white transition-all font-bold"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-white border border-dashed border-[#004554]/20 max-w-lg mx-auto space-y-4 shadow-2xs">
          <div className="size-16 rounded-full bg-[#EAF4F7] text-[#004554] flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8 text-[#44A6B5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-black">
              Your bucketlist is currently empty
            </h3>
            <p className="text-xs sm:text-sm text-[#5A737D] leading-relaxed max-w-sm mx-auto">
              Explore sustainable Sri Lanka destinations and tap the heart icon on any sanctuary to add it to your travel plan.
            </p>
          </div>

          <Link href="/destinations">
            <Button size="sm" className="rounded-2xl gap-2 cursor-pointer bg-[#004554] hover:bg-[#003844] text-white font-bold">
              <Compass className="w-4 h-4 text-[#44A6B5]" />
              <span>Explore Sanctuaries</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
