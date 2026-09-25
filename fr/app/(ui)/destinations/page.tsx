'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Heart,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Bookmark,
  ShieldCheck,
  Leaf,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DESTINATIONS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

export default function DestinationsCatalogPage() {
  const { isSaved, toggleSaveDestination, savedDestinationIds } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedPressure, setSelectedPressure] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'sustainability' | 'name' | 'budget'>('sustainability');
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);

  const tagFilters = ['All', 'Nature', 'Beach', 'Wildlife', 'Culture', 'Hiking', 'Adventure'];
  const pressureFilters = ['All', 'LOW', 'MEDIUM', 'HIGH'];

  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((dest) => {
      const matchesSearch =
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === 'All' ||
        dest.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      const matchesPressure =
        selectedPressure === 'All' || dest.pressure.level === selectedPressure;

      return matchesSearch && matchesTag && matchesPressure;
    }).slice().sort((a, b) => {
      if (sortBy === 'sustainability') {
        return b.sustainability.overall - a.sustainability.overall;
      }
      if (sortBy === 'budget') {
        return a.typicalBudgetLKR - b.typicalBudgetLKR;
      }
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, selectedTag, selectedPressure, sortBy]);

  const handleSaveToggle = (destId: string, destName: string) => {
    const currentlySaved = isSaved(destId);
    toggleSaveDestination(destId);
    setLastSavedNotice(
      currentlySaved ? `Removed ${destName} from your saved trips` : `Saved ${destName} to your journey bucketlist!`
    );
    setTimeout(() => setLastSavedNotice(null), 3000);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto w-full">
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Island Registry &amp; Sanctuaries
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              {DESTINATIONS.length} Monitored Pilot Sanctuaries
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Explore Sri Lanka Sanctuaries
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            Browse verified eco-destinations with transparent sustainability audits and real-time visitor pressure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/map">
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl gap-2 bg-card border-border text-primary hover:bg-muted text-xs font-bold shadow-[0_2px_8px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span>Interactive Map View</span>
            </Button>
          </Link>

          <Link href="/discover">
            <Button
              size="sm"
              className="rounded-2xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>AI Trip Finder</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {lastSavedNotice && (
        <div className="p-3.5 px-4 rounded-2xl bg-muted border border-primary/50 flex items-center justify-between text-xs text-foreground shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-full bg-primary/20 text-primary">
              <Bookmark className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold">{lastSavedNotice}</span>
          </div>
          <Link href="/saved" className="text-primary font-extrabold hover:underline">
            View Bucketlist →
          </Link>
        </div>
      )}

      {/* ── 2. Modern Kleon Metric KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Sanctuaries */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Catalog Sanctuaries
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">{DESTINATIONS.length}</span>
              <span className="text-xs text-muted-foreground font-semibold">regions</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
              Across all 9 provinces
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-muted text-primary border border-border">
            <Compass className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Metric 2: Low-Pressure Sanctuaries */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Uncrowded Havens
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">8</span>
              <span className="text-xs text-muted-foreground font-semibold">destinations</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
              <span className="text-primary font-bold">● 67%</span> low crowd density
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-muted text-primary border border-border">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Metric 3: Avg Sustainability */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Avg Sustainability
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">86</span>
              <span className="text-xs text-muted-foreground font-semibold">/100</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
              Verified eco-audited
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-muted text-primary border border-border">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Metric 4: Saved Count */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              In Your Bucketlist
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">
                {savedDestinationIds.length}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">places</span>
            </div>
            <Link href="/saved" className="text-[11px] text-primary font-extrabold hover:underline block mt-0.5">
              Manage saved trips →
            </Link>
          </div>
          <div className="p-3 rounded-2xl bg-muted text-primary border border-border">
            <Bookmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Modern Kleon-Style Search & Filters Bar ──────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-4">
        {/* Top Filter Controls: Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search destinations by name, district, or style (e.g. Belihuloya, hiking)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-border bg-card text-xs sm:text-sm text-primary placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all shadow-2xs font-semibold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'sustainability' | 'name' | 'budget')}
              className="px-3.5 py-2 rounded-2xl border border-border bg-card text-xs font-bold text-primary focus:ring-2 focus:ring-ring outline-none transition-colors cursor-pointer shadow-2xs"
            >
              <option value="sustainability">Sustainability (High to Low)</option>
              <option value="name">Name (A to Z)</option>
              <option value="budget">Typical Budget (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Bottom Filter Controls: Tags & Pressure Level */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-border">
          {/* Experience Tabs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-muted-foreground font-bold">Experience:</span>
            <div className="p-1.5 rounded-2xl bg-muted border border-border flex flex-wrap items-center gap-1 shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--shadow-color)_6%,transparent)]">
              {tagFilters.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--shadow-color)_28%,transparent)] ring-1 ring-overlay-foreground/20 font-black'
                        : 'bg-card/60 hover:bg-card text-primary hover:text-primary border border-transparent hover:border-border hover:shadow-2xs'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pressure Level Tabs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs text-muted-foreground font-bold">Pressure:</span>
            <div className="p-1.5 rounded-2xl bg-muted border border-border flex items-center gap-1 shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--shadow-color)_6%,transparent)]">
              {pressureFilters.map((p) => {
                const isActive = selectedPressure === p;
                let activeStyle = 'bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--shadow-color)_28%,transparent)] ring-1 ring-overlay-foreground/20 font-black';
                let inactiveStyle = 'bg-card/60 hover:bg-card text-primary border border-transparent hover:border-border hover:shadow-2xs';

                if (p === 'LOW') {
                  activeStyle = 'bg-success text-success-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--success)_30%,transparent)] ring-1 ring-overlay-foreground/20 font-black';
                  inactiveStyle = 'bg-card/60 hover:bg-success/10 text-success border border-transparent hover:border-success/25 hover:shadow-2xs';
                } else if (p === 'MEDIUM') {
                  activeStyle = 'bg-warning text-warning-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--warning)_30%,transparent)] ring-1 ring-overlay-foreground/20 font-black';
                  inactiveStyle = 'bg-card/60 hover:bg-warning/10 text-warning border border-transparent hover:border-warning/25 hover:shadow-2xs';
                } else if (p === 'HIGH') {
                  activeStyle = 'bg-destructive text-destructive-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--destructive)_30%,transparent)] ring-1 ring-overlay-foreground/20 font-black';
                  inactiveStyle = 'bg-card/60 hover:bg-destructive/10 text-destructive border border-transparent hover:border-destructive/25 hover:shadow-2xs';
                }

                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setSelectedPressure(p)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive ? activeStyle : inactiveStyle
                    }`}
                  >
                    {p === 'All' ? 'All' : `${p.charAt(0) + p.slice(1).toLowerCase()}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Destinations Grid (Kleon Modern Cards) ───────────────────────── */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => {
            const isBookmarked = isSaved(dest.id);

            return (
              <div
                key={dest.id}
                className="group rounded-3xl bg-card border border-border overflow-hidden shadow-dashboard-card transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Section */}
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-overlay/85 via-transparent to-transparent pointer-events-none" />

                  {/* Pressure Pill */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-overlay/85 text-overlay-foreground border border-overlay-foreground/20 backdrop-blur-md">
                      {dest.pressure.level} PRESSURE
                    </span>
                  </div>

                  {/* Save Heart Button */}
                  <button
                    type="button"
                    onClick={() => handleSaveToggle(dest.id, dest.name)}
                    className="absolute top-3.5 right-3.5 p-2 rounded-full bg-card/90 hover:bg-card text-primary shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
                    title={isBookmarked ? 'Saved' : 'Save'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isBookmarked ? 'fill-destructive text-destructive' : 'text-primary'
                      }`}
                    />
                  </button>

                  {/* Title overlay on photo */}
                  <div className="absolute bottom-3.5 inset-x-4 text-overlay-foreground">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-frosted-blue uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{dest.district} District</span>
                    </div>
                    <h3 className="font-heading text-xl font-bold leading-tight mt-0.5 text-overlay-foreground">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs pb-2.5 border-b border-border">
                      <span className="text-muted-foreground font-semibold">Sustainability Index</span>
                      <span className="font-black text-primary">
                        {dest.sustainability.overall} / 100
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {dest.tagline || dest.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dest.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-muted text-primary border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Typical Budget</span>
                      <span className="text-xs font-black text-primary">
                        ~LKR {dest.typicalBudgetLKR.toLocaleString()}
                      </span>
                    </div>

                    <Link href={`/destinations/${dest.id}`}>
                      <Button
                        size="xs"
                        variant="outline"
                        className="rounded-xl gap-1 text-xs cursor-pointer border-border text-primary hover:bg-primary hover:text-primary-foreground transition-all font-bold"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-3 shadow-2xs">
          <Compass className="w-10 h-10 text-primary mx-auto" />
          <h3 className="text-base font-black text-foreground">No sanctuaries match your active filters</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try clearing your search query or selecting &quot;All&quot; in the category or pressure filters.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('All');
              setSelectedPressure('All');
            }}
            className="rounded-2xl mt-2 bg-card border-border text-primary hover:bg-muted font-bold cursor-pointer"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
