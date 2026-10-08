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
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/Loader';
import { mapDestination } from '@/lib/destinationMapper';

export default function SavedDestinationsPage() {
  const { savedDestinations, isSavedLoading, toggleSaveDestination } = useAuth();

  const savedList = useMemo(() => {
    return savedDestinations.map((item) =>
      mapDestination(item.destination, item.destination.sustainability),
    );
  }, [savedDestinations]);

  const totalDays = savedList.reduce((acc, d) => acc + d.recommendedDurationDays, 0);
  const totalBudget = savedList.reduce((acc, d) => acc + d.typicalBudgetLKR, 0);
  const avgSustainability = savedList.length > 0
    ? Math.round(savedList.reduce((acc, d) => acc + d.sustainability.overall, 0) / savedList.length)
    : 0;

  if (isSavedLoading) return <Loader label="Loading saved destinations..." />;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto w-full">
      {/* ── 1. Kleon Modern Header ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Your Saved Places
            </span>

          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            My Saved Places
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            Your personal list of places you want to visit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/destinations" />}
          >
              <Compass className="w-3.5 h-3.5" />
              <span>Browse Places</span>
            </Button>

          {savedList.length > 0 && (
            <Button size="sm" nativeButton={false} render={<Link href="/discover" />}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plan a Trip</span>
              </Button>
          )}
        </div>
      </div>

      {/* ── 2. Kleon Modern Saved Metrics KPI Strip ─────────────────────────── */}
      {savedList.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Saved Places
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-3xl font-black text-foreground">{savedList.length}</span>
                <span className="text-xs text-muted-foreground font-semibold">places</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                Ready to plan
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-muted text-primary border border-border shadow-2xs">
              <Bookmark className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Estimated Duration
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-3xl font-black text-foreground">{totalDays}</span>
                <span className="text-xs text-muted-foreground font-semibold">days</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                Total time needed
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-muted text-primary border border-border shadow-2xs">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Eco Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-3xl font-black text-foreground">{avgSustainability}</span>
                <span className="text-xs text-muted-foreground font-semibold">/100</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                How green your trip is
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-muted text-primary border border-border shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Estimated Cost
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-xl sm:text-2xl font-black text-foreground">
                  {(totalBudget / 1000).toFixed(0)}k
                </span>
                <span className="text-xs text-muted-foreground font-semibold">LKR</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                ~LKR {totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-muted text-primary border border-border shadow-2xs">
              <Coins className="w-5 h-5 text-primary" />
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
              className="group rounded-3xl bg-card border border-border overflow-hidden shadow-dashboard-card transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  unoptimized={dest.image.startsWith('http')}
                  className="object-cover group-hover:scale-106 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-overlay/85 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-overlay/85 text-overlay-foreground border border-overlay-foreground/20 backdrop-blur-md">
                    {dest.pressure.level} CROWDS
                  </span>
                </div>

                {/* Remove from Saved Button */}
                <Button
                  type="button"
                  onClick={() => void toggleSaveDestination(dest.api.id)}
                  variant="outline"
                  size="icon"
                  aria-label="Remove from saved"
                  className="absolute top-3.5 right-3.5 bg-card text-card-foreground dark:bg-card"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="absolute bottom-3.5 inset-x-4 text-overlay-foreground">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-overlay-foreground uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{dest.district} District</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold leading-tight mt-0.5 text-overlay-foreground">
                    {dest.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs pb-2.5 border-b border-border">
                    <span className="text-muted-foreground font-semibold">Eco Score</span>
                    <span className="font-black text-foreground">
                      {dest.sustainability.overall} / 100
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {dest.tagline || dest.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dest.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-muted text-foreground border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Typical Budget</span>
                    <span className="text-xs font-black text-foreground">
                      ~LKR {dest.typicalBudgetLKR.toLocaleString()}
                    </span>
                  </div>

                  <Button
                    size="xs"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/destinations/${dest.id}`} />}
                  >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-card border border-dashed border-border max-w-lg mx-auto space-y-4 shadow-2xs">
          <div className="size-16 rounded-full bg-muted text-primary flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-foreground">
              Your bucketlist is currently empty
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Explore beautiful Sri Lanka destinations and tap the heart icon on any place to add it to your travel plan.
            </p>
          </div>

          <Button size="sm" nativeButton={false} render={<Link href="/destinations" />}>
              <Compass className="w-4 h-4" />
              <span>Explore Places</span>
            </Button>
        </div>
      )}
    </div>
  );
}
