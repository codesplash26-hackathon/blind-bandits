'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Heart,
  ArrowRight,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DESTINATIONS } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DestinationsCatalogPage() {
  const { isSaved, toggleSaveDestination } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedPressure, setSelectedPressure] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'sustainability' | 'name' | 'budget'>('sustainability');

  const tagFilters = ['All', 'Nature', 'Beach', 'Wildlife', 'Culture', 'Hiking', 'Adventure'];
  const pressureFilters = ['All', 'LOW', 'MEDIUM', 'HIGH'];

  const filteredDestinations = DESTINATIONS.filter((dest) => {
    // Search filter
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesTag =
      selectedTag === 'All' ||
      dest.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

    // Pressure filter
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
      {/* Header Banner */}
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Explore Sri Lanka Destinations
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Browse monitored pilot destinations with verified environmental scores and live pressure indicators.
        </p>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
        {/* Top Row: Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search destinations by name, district, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'sustainability' | 'name' | 'budget')}
              className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:border-primary outline-none transition-colors cursor-pointer"
            >
              <option value="sustainability">Sustainability (High to Low)</option>
              <option value="name">Name (A to Z)</option>
              <option value="budget">Typical Budget (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Category & Pressure Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-border/60">
          {/* Experience Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-semibold mr-1">Experience:</span>
            {tagFilters.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Pressure Filters */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground font-semibold mr-1">Pressure:</span>
            {pressureFilters.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setSelectedPressure(p)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedPressure === p
                    ? 'bg-secondary text-secondary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {p === 'All' ? 'All' : `${p.charAt(0) + p.slice(1).toLowerCase()}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => {
            const isBookmarked = isSaved(dest.id);

            return (
              <Card
                key={dest.id}
                className="group rounded-3xl border border-border/80 overflow-hidden hover:border-secondary/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                  {/* Pressure Pill */}
                  <div className="absolute top-3 left-3">
                    <Badge variant={getPressureBadgeVariant(dest.pressure.level)}>
                      {dest.pressure.level} PRESSURE
                    </Badge>
                  </div>

                  {/* Save Heart Button */}
                  <button
                    type="button"
                    onClick={() => toggleSaveDestination(dest.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isBookmarked ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </button>

                  {/* Title overlay on photo */}
                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-secondary">
                      <MapPin className="w-3 h-3" />
                      <span>{dest.district} District</span>
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold leading-tight">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                      <span className="text-muted-foreground">Sustainability Score</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {dest.sustainability.overall} / 100
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {dest.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="pt-3 border-t border-border/70 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground font-mono">
                      ~LKR {dest.typicalBudgetLKR.toLocaleString()}
                    </span>

                    <Link href={`/destinations/${dest.id}`}>
                      <Button size="xs" variant="default" className="rounded-xl gap-1 cursor-pointer">
                        <span>Explore</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center rounded-3xl border border-dashed border-border/80 space-y-3">
          <Compass className="w-10 h-10 text-muted-foreground/60 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No destinations matched your filters</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try loosening your search query or selecting &quot;All&quot; in the category or pressure filters.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('All');
              setSelectedPressure('All');
            }}
            className="rounded-xl mt-2"
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
