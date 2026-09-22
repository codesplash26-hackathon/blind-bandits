'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  RotateCcw,
  Heart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRecommendations } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RecommendationResultsPage() {
  const { currentPreferences, isSaved, toggleSaveDestination } = useAuth();

  const results = useMemo(() => {
    return getRecommendations(currentPreferences);
  }, [currentPreferences]);

  const getPressureBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return <Badge variant="success">LOW PRESSURE</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">MEDIUM PRESSURE</Badge>;
      case 'HIGH':
        return <Badge variant="destructive">HIGH PRESSURE</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Results Header */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-border/80 shadow-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Recommendation Engine
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold">
              {results.length} Matches Found
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Destinations for you
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-1.5 pt-0.5">
            <span>Based on your preferences:</span>
            <span className="font-semibold text-foreground">
              {currentPreferences.interests.join(' • ')} • {currentPreferences.durationDays} days •{' '}
              {currentPreferences.crowdPreference === 'quiet'
                ? 'Low crowds'
                : currentPreferences.crowdPreference === 'balanced'
                ? 'Moderate crowds'
                : 'Popular crowds'}{' '}
              • {currentPreferences.sustainabilityImportance >= 75 ? 'High sustainability' : 'Standard'}
            </span>
          </p>
        </div>

        <Link href="/discover">
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 cursor-pointer shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Change preferences</span>
          </Button>
        </Link>
      </Card>

      {/* Ranked Destination Cards List */}
      <div className="space-y-6">
        {results.map((item) => {
          const { rank, destination: dest, whyMatches } = item;
          const isBookmarked = isSaved(dest.id);

          return (
            <Card
              key={dest.id}
              className="group relative rounded-3xl border border-border/80 overflow-hidden hover:border-secondary/60 hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row"
            >
              {/* Left Photo Showcase */}
              <div className="relative w-full lg:w-72 min-h-[220px] lg:min-h-full overflow-hidden shrink-0">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/70 lg:from-transparent via-transparent to-transparent pointer-events-none" />

                {/* Rank Badge */}
                <div className="absolute top-3.5 left-3.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white font-heading font-bold text-sm shadow-md">
                    #{rank}
                  </div>
                </div>

                {/* Mobile/Floating Pressure Badge */}
                <div className="absolute top-3.5 right-3.5 lg:hidden">
                  {getPressureBadge(dest.pressure.level)}
                </div>

                {/* Mobile district tag on photo */}
                <div className="absolute bottom-3 left-3 text-white lg:hidden">
                  <span className="text-xs font-semibold">{dest.district} District</span>
                </div>
              </div>

              {/* Center & Right Details */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-5">
                <div>
                  {/* Top Bar: Name + Pressure */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground group-hover:text-secondary transition-colors">
                          {dest.name}
                        </h2>
                        <span className="hidden sm:inline-block text-xs text-muted-foreground">
                          • {dest.district} District
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{dest.tagline}</p>
                    </div>

                    <div className="hidden lg:block">
                      {getPressureBadge(dest.pressure.level)}
                    </div>
                  </div>

                  {/* Sustainability Metrics Row */}
                  <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border/70 grid grid-cols-2 sm:grid-cols-6 gap-3 items-center">
                    {/* Overall Score */}
                    <div className="col-span-2 sm:col-span-1 pr-2 border-r-0 sm:border-r border-border/70">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Sustainability
                      </span>
                      <span className="font-heading text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none mt-0.5 block">
                        {dest.sustainability.overall}
                        <span className="text-xs font-normal text-muted-foreground">/100</span>
                      </span>
                    </div>

                    {/* Breakdown Scores */}
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] text-muted-foreground block truncate">Environmental</span>
                      <span className="text-xs font-bold text-foreground">{dest.sustainability.environmental}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] text-muted-foreground block truncate">Community</span>
                      <span className="text-xs font-bold text-foreground">{dest.sustainability.communityBenefit}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] text-muted-foreground block truncate">Crowd Index</span>
                      <span className="text-xs font-bold text-foreground">{dest.sustainability.crowd}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] text-muted-foreground block truncate">Infrastructure</span>
                      <span className="text-xs font-bold text-foreground">{dest.sustainability.infrastructure}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] text-muted-foreground block truncate">Suitability</span>
                      <span className="text-xs font-bold text-foreground">{dest.sustainability.touristSuitability}</span>
                    </div>
                  </div>

                  {/* Why this matches you section */}
                  <div className="mt-3.5 flex items-start gap-2.5 p-3 rounded-xl bg-secondary/5 border border-secondary/15">
                    <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Why this matches you
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {whyMatches}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-border/70 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSaveDestination(dest.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isBookmarked
                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                  </button>

                  <Link href={`/destinations/${dest.id}`}>
                    <Button size="sm" className="rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
