'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bookmark,
  ArrowRight,
  Compass,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DESTINATIONS } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SavedDestinationsPage() {
  const { savedDestinationIds, toggleSaveDestination } = useAuth();

  const savedList = DESTINATIONS.filter((d) => savedDestinationIds.includes(d.id));

  const getPressureBadgeVariant = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            My Saved Destinations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your personal bucket list of sustainable places to visit across Sri Lanka.
          </p>
        </div>

        <Link href="/discover">
          <Button size="sm" variant="outline" className="rounded-xl gap-1.5 cursor-pointer">
            <Compass className="w-4 h-4 text-primary" />
            <span>Discover more places</span>
          </Button>
        </Link>
      </div>

      {savedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map((dest) => (
            <div
              key={dest.id}
              className="group rounded-3xl border border-border/80 bg-card overflow-hidden hover:border-secondary/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3">
                  <Badge variant={getPressureBadgeVariant(dest.pressure.level)}>
                    {dest.pressure.level} PRESSURE
                  </Badge>
                </div>

                {/* Remove from Saved Button */}
                <button
                  type="button"
                  onClick={() => toggleSaveDestination(dest.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-rose-500/80 backdrop-blur-md text-white transition-colors cursor-pointer"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-3 inset-x-3 text-white">
                  <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block">
                    {dest.district} District
                  </span>
                  <h3 className="font-heading text-lg font-bold leading-tight">
                    {dest.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border/60 text-xs">
                    <span className="text-muted-foreground">Sustainability Score</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {dest.sustainability.overall} / 100
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/70 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground font-mono">
                    ~LKR {dest.typicalBudgetLKR.toLocaleString()}
                  </span>

                  <Link href={`/destinations/${dest.id}`}>
                    <Button size="xs" variant="default" className="rounded-xl gap-1 cursor-pointer">
                      <span>View</span>
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
        <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card/60 max-w-md mx-auto space-y-4">
          <Bookmark className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              You haven&apos;t saved any destinations yet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore sustainable destinations across Sri Lanka and bookmark places you&apos;re interested in for quick access.
            </p>
          </div>

          <Link href="/discover">
            <Button size="sm" className="rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground">
              <Compass className="w-4 h-4 text-secondary" />
              <span>Discover destinations</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
