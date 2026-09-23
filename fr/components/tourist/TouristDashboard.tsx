'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Compass,
  Heart,
  Clock,
  Leaf,
  Sun,
  CloudRain,
  Wind,
  CheckCircle2,
  Bookmark,
  Share2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DESTINATIONS } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type VibeCategory = 'ALL' | 'HIGHLANDS' | 'WATERFALLS' | 'HERITAGE' | 'COASTAL';

export default function TouristDashboard() {
  const { user, isSaved, toggleSaveDestination, searchHistory } = useAuth();
  const [selectedVibe, setSelectedVibe] = useState<VibeCategory>('ALL');
  const [spotlightTab, setSpotlightTab] = useState<'overview' | 'eco' | 'season'>('overview');
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);

  // Vibe filter logic
  const getDestinationsByVibe = (vibe: VibeCategory) => {
    switch (vibe) {
      case 'HIGHLANDS':
        return DESTINATIONS.filter((d) =>
          ['haputale', 'belihuloya', 'knuckles', 'ella'].includes(d.id)
        );
      case 'WATERFALLS':
        return DESTINATIONS.filter((d) =>
          ['belihuloya', 'haputale', 'kitulgala'].includes(d.id)
        );
      case 'HERITAGE':
        return DESTINATIONS.filter((d) =>
          ['meemure', 'sigiriya', 'jaffna', 'ritigala'].includes(d.id)
        );
      case 'COASTAL':
        return DESTINATIONS.filter((d) =>
          ['kalpitiya', 'mirissa', 'tangalle', 'mannar'].includes(d.id)
        );
      default:
        return [
          DESTINATIONS.find((d) => d.id === 'belihuloya')!,
          DESTINATIONS.find((d) => d.id === 'haputale')!,
          DESTINATIONS.find((d) => d.id === 'meemure')!,
        ].filter(Boolean);
    }
  };

  const vibeDestinations = getDestinationsByVibe(selectedVibe);
  const spotlight = vibeDestinations[0] || DESTINATIONS[0];
  const secondaryDestinations = vibeDestinations.slice(1, 4);

  const handleSaveToggle = (destId: string, destName: string) => {
    const currentlySaved = isSaved(destId);
    toggleSaveDestination(destId);
    setLastSavedNotice(
      currentlySaved ? `Removed ${destName} from your saved trips` : `Saved ${destName} to your journey bucketlist!`
    );
    setTimeout(() => setLastSavedNotice(null), 3000);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">
            Tourist Explorer Portal
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
            {getTimeGreeting()}, {user?.name || 'Traveler'} 👋
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1.5 max-w-2xl">
            Where would you like to travel? Discover peaceful and beautiful places across Sri Lanka.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/map">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 cursor-pointer bg-card border-border hover:border-secondary/40">
              <Compass className="w-4 h-4 text-primary" />
              <span>Island Map</span>
            </Button>
          </Link>
          <Link href="/discover">
            <Button size="sm" className="rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>AI Trip Finder</span>
            </Button>
          </Link>
        </div>
      </div>

      {lastSavedNotice && (
        <div className="p-3.5 px-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-between text-xs text-foreground animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-secondary shrink-0" />
            <span className="font-semibold">{lastSavedNotice}</span>
          </div>
          <Link href="/saved" className="text-secondary font-bold hover:underline">
            View Saved
          </Link>
        </div>
      )}

      {/* Prominent Hero CTA Banner with Interactive Vibe Filter */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#003844] to-[#002B35] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-primary/30">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay">
          <Image
            src="/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg"
            alt="Sri Lanka landscape"
            fill
            className="object-cover"
          />
        </div>

        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-light-blue/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-light-blue" />
            <span>AI Conscious Trip Recommendation</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Find your next favorite place
          </h2>

          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl">
            Get travel ideas matched to your budget, time, interests, and quiet spots with nature in mind.
          </p>

          {/* Quick Mood & Vibe Chips */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-light-blue uppercase tracking-wider block mb-2">
              Explore by Experience Mood:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: 'All Curated Eco-Sites' },
                { id: 'HIGHLANDS', label: 'Misty Highlands' },
                { id: 'WATERFALLS', label: 'Quiet Waterfalls' },
                { id: 'HERITAGE', label: 'Ancient Sanctuaries' },
                { id: 'COASTAL', label: 'Coastal Havens' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedVibe(chip.id as VibeCategory)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
                    selectedVibe === chip.id
                      ? 'bg-secondary text-midnight-green font-bold shadow-md scale-102'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/discover">
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-light-blue hover:opacity-95 text-midnight-green font-bold text-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-102 cursor-pointer"
              >
                <span>Personalize My Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/destinations">
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3 rounded-2xl backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
              >
                <span>Browse All Places</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Regional Eco-Conditions Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex items-center justify-between text-xs shadow-xs hover:border-secondary/40 transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-secondary/15 text-secondary">
              <Sun className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-foreground block">Central Highlands</span>
              <span className="text-[11px] text-muted-foreground">Belihuloya &amp; Ohiya • 21°C</span>
            </div>
          </div>
          <Badge variant="success" className="text-[10px]">PEACEFUL • 24% LOAD</Badge>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex items-center justify-between text-xs shadow-xs hover:border-secondary/40 transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Wind className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-foreground">Knuckles Conservation</span>
              <span className="text-[11px] text-muted-foreground">Meemure Valley • 19°C</span>
            </div>
          </div>
          <Badge variant="success" className="text-[10px]">PRISTINE • 18% LOAD</Badge>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex items-center justify-between text-xs shadow-xs hover:border-secondary/40 transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-secondary/15 text-secondary">
              <Leaf className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-foreground">North-West Coast</span>
              <span className="text-[11px] text-muted-foreground">Kalpitiya Lagoon • 29°C</span>
            </div>
          </div>
          <Badge variant="success" className="text-[10px]">LOW CROWD • 28% LOAD</Badge>
        </div>
      </div>

      {/* Main Grid: Recommended For You & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Recommended for You Spotlight */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <h2 className="text-lg font-bold text-foreground">Spotlight Sustainable Destination</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Optimal ecological balance with rich traveler experience
              </p>
            </div>
            <Link href="/discover" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
              <span>Recalibrate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Spotlight Card with Interactive Tabs */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card hover:border-secondary/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-2/5 min-h-[220px] sm:min-h-full overflow-hidden">
              <Image
                src={spotlight.image}
                alt={spotlight.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 sm:from-transparent via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3">
                <Badge variant={getPressureBadgeVariant(spotlight.pressure.level)}>
                  {spotlight.pressure.level} PRESSURE
                </Badge>
              </div>

              <button
                type="button"
                onClick={() => handleSaveToggle(spotlight.id, spotlight.name)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 transition-all cursor-pointer hover:scale-110 active:scale-95"
                title={isSaved(spotlight.id) ? 'Saved' : 'Save'}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isSaved(spotlight.id) ? 'fill-rose-500 text-rose-500' : 'text-white'
                  }`}
                />
              </button>
            </div>

            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span>{spotlight.district} District</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Sustainability</span>
                    <span className="text-sm font-extrabold text-secondary">
                      {spotlight.sustainability.overall}/100
                    </span>
                  </div>
                </div>

                <h3 className="font-heading text-xl font-bold text-foreground mt-1 group-hover:text-secondary transition-colors">
                  {spotlight.name}
                </h3>

                {/* Interactive Detail Tabs */}
                <div className="flex items-center gap-1 mt-2.5 p-1 rounded-xl bg-muted/50 border border-border/60 text-[11px] font-semibold w-fit">
                  <button
                    type="button"
                    onClick={() => setSpotlightTab('overview')}
                    className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                      spotlightTab === 'overview' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpotlightTab('eco')}
                    className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                      spotlightTab === 'eco' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Eco Factors
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpotlightTab('season')}
                    className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                      spotlightTab === 'season' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Best Timing
                  </button>
                </div>

                {spotlightTab === 'overview' && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed animate-in fade-in">
                    {spotlight.description}
                  </p>
                )}

                {spotlightTab === 'eco' && (
                  <div className="mt-2 space-y-1 text-xs animate-in fade-in">
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Environmental Stewardship:</span>
                      <strong className="text-secondary">{spotlight.sustainability.environmental}/100</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Community Benefit:</span>
                      <strong className="text-foreground">{spotlight.sustainability.communityBenefit}/100</strong>
                    </div>
                  </div>
                )}

                {spotlightTab === 'season' && (
                  <div className="mt-2 text-xs text-muted-foreground animate-in fade-in">
                    <span>Ideal visiting window: <strong>Year-round</strong> with clearest trail skies from Dec to April.</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {spotlight.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-secondary" /> High Eco-Resilience
                </span>

                <Link href={`/destinations/${spotlight.id}`}>
                  <Button size="sm" variant="default" className="rounded-xl gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
                    <span>Explore Place</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Recent Searches Activity */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
              <p className="text-xs text-muted-foreground">Your travel recommendation history</p>
            </div>
            <Link href="/history" className="text-xs font-semibold text-secondary hover:underline">
              View all
            </Link>
          </div>

          {searchHistory.length > 0 ? (
            <div className="space-y-3">
              {searchHistory.slice(0, 2).map((item) => (
                <Card
                  key={item.id}
                  className="rounded-2xl border border-border/80 bg-card p-4 hover:border-secondary/40 transition-colors space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <span>{item.date}</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {item.recommendations.length} recommendations
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    {item.preferences.interests.map((int) => (
                      <span
                        key={int}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15"
                      >
                        {int}
                      </span>
                    ))}
                    <span className="text-[11px] text-muted-foreground">
                      • {item.preferences.durationDays} days • {item.preferences.crowdPreference} crowds
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="truncate max-w-[180px]">
                        Top: <span className="font-bold text-foreground">{item.recommendations[0]?.name}</span>
                      </span>
                    </div>

                    <Link href="/discover/results">
                      <Button variant="ghost" size="xs" className="gap-1 text-primary cursor-pointer hover:bg-muted">
                        <span>View again</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2 bg-muted/20">
              <Compass className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs font-semibold text-foreground">No recent searches</p>
              <p className="text-[11px] text-muted-foreground">Run your first discover search to see results logged here.</p>
              <Link href="/discover">
                <Button size="xs" variant="outline" className="mt-2 rounded-lg">
                  Start Discovering
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sustainable Places to Explore Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Sustainable places to explore ({selectedVibe === 'ALL' ? 'Curated' : selectedVibe})
            </h2>
            <p className="text-xs text-muted-foreground">
              Low-pressure regional destinations with high environmental stewardship
            </p>
          </div>
          <Link href="/destinations" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
            <span>Explore all {DESTINATIONS.length} places</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {secondaryDestinations.map((dest) => (
            <Card
              key={dest.id}
              className="group rounded-3xl border border-border/80 bg-card overflow-hidden hover:border-secondary/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3">
                  <Badge variant={getPressureBadgeVariant(dest.pressure.level)}>
                    {dest.pressure.level} PRESSURE
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveToggle(dest.id, dest.name)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors cursor-pointer hover:scale-110 active:scale-95"
                  title={isSaved(dest.id) ? 'Saved' : 'Save'}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isSaved(dest.id) ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
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

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border/60 text-xs">
                    <span className="text-muted-foreground">Sustainability Score</span>
                    <span className="font-bold text-secondary">
                      {dest.sustainability.overall} / 100
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span>{dest.tags.slice(0, 2).join(' • ')}</span>
                  </div>

                  <Link href={`/destinations/${dest.id}`}>
                    <Button size="xs" variant="outline" className="rounded-xl gap-1 text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
