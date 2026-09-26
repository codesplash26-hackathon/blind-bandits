'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Heart,
  Bookmark,
  ShieldCheck,
  Search,
  Calendar,
  Download,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { listDestinations } from '@/lib/destinations';
import { mapDestinations, type DestinationViewModel } from '@/lib/destinationMapper';
import describeApiError from '@/lib/apiError';

type VibeCategory = 'ALL' | 'HIGHLANDS' | 'WATERFALLS' | 'HERITAGE' | 'COASTAL';

// ── Mock Chart Data matching Kleon style & Ceylon Theme Colors ──────────────
const weeklyVisitorData = [
  { day: 'Mon', saturated: 78, conscious: 24 },
  { day: 'Tue', saturated: 72, conscious: 28 },
  { day: 'Wed', saturated: 85, conscious: 32 },
  { day: 'Thu', saturated: 80, conscious: 30 },
  { day: 'Fri', saturated: 92, conscious: 36 },
  { day: 'Sat', saturated: 98, conscious: 42 },
  { day: 'Sun', saturated: 95, conscious: 38 },
];

const categoryData = [
  { name: 'Misty Highlands', value: 38, color: 'var(--chart-1)' },
  { name: 'Quiet Waterfalls', value: 26, color: 'var(--chart-2)' },
  { name: 'Ancient Heritage', value: 22, color: 'var(--chart-3)' },
  { name: 'Coastal Havens', value: 14, color: 'var(--chart-4)' },
];

const hourlyTrajectoryData = [
  { time: '06:00', saturated: 25, quiet: 8 },
  { time: '08:00', saturated: 62, quiet: 15 },
  { time: '10:00', saturated: 94, quiet: 24 },
  { time: '12:00', saturated: 88, quiet: 22 },
  { time: '14:00', saturated: 76, quiet: 20 },
  { time: '16:00', saturated: 96, quiet: 28 },
  { time: '18:00', saturated: 80, quiet: 18 },
  { time: '20:00', saturated: 40, quiet: 10 },
];

const emptySubscribe = () => () => {};

export default function TouristDashboard() {
  const router = useRouter();
  const { user, isSaved, toggleSaveDestination, savedDestinationIds } = useAuth();
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [selectedVibe, setSelectedVibe] = useState<VibeCategory>('ALL');
  const [chartPeriod, setChartPeriod] = useState<'Daily' | 'Weekly'>('Weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState(false);
  const [destinations, setDestinations] = useState<DestinationViewModel[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listDestinations({ active: true })
      .then((response) => {
        if (active) setDestinations(mapDestinations(response));
      })
      .catch((error) => {
        if (active) setDestinationsError(describeApiError(error, 'Unable to load destinations.'));
      })
      .finally(() => {
        if (active) setDestinationsLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Vibe filter logic
  const filteredDestinations = useMemo(() => {
    let list = destinations;

    if (selectedVibe === 'HIGHLANDS') {
      list = list.filter((d) => d.landscape.toLowerCase().includes('mountain'));
    } else if (selectedVibe === 'WATERFALLS') {
      list = list.filter((d) => d.tags.some((tag) => tag.toLowerCase() === 'waterfalls'));
    } else if (selectedVibe === 'HERITAGE') {
      list = list.filter((d) => d.tags.some((tag) => tag.toLowerCase() === 'heritage'));
    } else if (selectedVibe === 'COASTAL') {
      list = list.filter((d) => d.landscape.toLowerCase().includes('coastal'));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.district.toLowerCase().includes(q) ||
          d.tagline.toLowerCase().includes(q)
      );
    }

    return list;
  }, [destinations, selectedVibe, searchQuery]);

  const handleSaveToggle = (destination: DestinationViewModel) => {
    const currentlySaved = isSaved(destination.api.id);
    void toggleSaveDestination(destination.api.id);
    setLastSavedNotice(
      currentlySaved ? `Removed ${destination.name} from your saved trips` : `Saved ${destination.name} to your journey bucketlist!`
    );
    setTimeout(() => setLastSavedNotice(null), 3000);
  };

  const handleExport = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto w-full">
      {/* ── 1. Modern Kleon-Style Top Action Bar ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Your Travel Dashboard
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Live Updates
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            {user?.name ? `Welcome back, ${user.name}!` : 'Travel Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            Find peaceful spots, avoid crowds, and travel responsibly across Sri Lanka.
          </p>
        </div>

        {/* Center / Right Filter & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center min-w-[220px] sm:min-w-[260px]">
            <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search here..."
              className="w-full pl-10 pr-8 py-2 rounded-2xl bg-card border border-border text-primary placeholder:text-muted-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent shadow-[0_2px_8px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-muted-foreground hover:text-primary cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Period Selector Dropdown Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-card border border-border shadow-[0_2px_8px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] text-xs font-bold text-primary">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Aug 2026 - Oct 2026</span>
            <span className="sm:hidden">Q3 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
          </div>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-card hover:bg-muted border border-border text-primary text-xs font-bold shadow-[0_2px_8px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{downloadNotice ? 'Exported!' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {lastSavedNotice && (
        <div className="p-3.5 px-4 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-between text-xs text-success shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-full bg-success/20 text-success">
              <Bookmark className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold text-foreground">{lastSavedNotice}</span>
          </div>
          <Link href="/saved" className="text-success font-bold hover:underline">
            View Bucketlist →
          </Link>
        </div>
      )}

      {/* ── 2. Top 4 Modern Kleon Metric KPI Cards with Sparklines ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Eco-Score with Circular Donut Gauge */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Green Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">94</span>
              <span className="text-xs text-muted-foreground font-semibold">/100</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-success pt-0.5">
              <span className="text-success">▲ +4.2%</span>
              <span className="text-muted-foreground font-normal">than last trip</span>
            </div>
          </div>

          {/* Mini Donut Progress Ring */}
          <div className="relative size-14 shrink-0 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary"
                strokeDasharray="94, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-foreground">94%</span>
          </div>
        </div>

        {/* Card 2: Crowd Avoidance with Mini Smooth Curve */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Crowd Levels
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">68%</span>
              <span className="text-xs text-muted-foreground font-semibold">less crowded</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-success pt-0.5">
              <span className="text-success">▲ 12%</span>
              <span className="text-muted-foreground font-normal">better than popular areas</span>
            </div>
          </div>

          {/* Mini Wave SVG Sparkline */}
          <div className="w-16 h-10 shrink-0">
            <svg viewBox="0 0 70 35" className="w-full h-full overflow-visible">
              <path
                d="M 0 30 Q 15 5, 30 20 T 60 8 T 70 12"
                fill="none"
                stroke="var(--chart-2)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="70" cy="12" r="3.5" fill="var(--chart-1)" />
            </svg>
          </div>
        </div>

        {/* Card 3: Saved Sanctuaries with Mini Bar Sparkline */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Saved Places
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">
                {savedDestinationIds.length > 0 ? savedDestinationIds.length : 4}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">places</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary pt-0.5">
              <span className="text-primary">● Ready</span>
              <span className="text-muted-foreground font-normal">for your trip</span>
            </div>
          </div>

          {/* Mini Bar SVG Sparkline */}
          <div className="flex items-end gap-1.5 h-10 w-14 shrink-0">
            <div className="w-2.5 bg-muted h-5 rounded-full" />
            <div className="w-2.5 bg-accent h-8 rounded-full" />
            <div className="w-2.5 bg-primary h-10 rounded-full" />
            <div className="w-2.5 bg-primary h-7 rounded-full" />
          </div>
        </div>

        {/* Card 4: Direct Homestay Benefit with Circular Donut */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Local Support
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">88%</span>
              <span className="text-xs text-muted-foreground font-semibold">direct</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary pt-0.5">
              <span className="text-primary">★ Verified</span>
              <span className="text-muted-foreground font-normal">local stays</span>
            </div>
          </div>

          {/* Mini Donut Progress Ring */}
          <div className="relative size-14 shrink-0 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary"
                strokeDasharray="88, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-foreground">88%</span>
          </div>
        </div>
      </div>

      {/* ── 3. Mid-Top Row: Bar Chart + Donut Categories Breakdown ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Project Statistics / Regional Visitor Load Bar Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-black text-foreground">
                Crowd Levels: Popular vs. Hidden Gems
              </h2>
              <p className="text-xs text-muted-foreground">
                Compare crowds in popular spots against our peaceful alternatives
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Stat Chips */}
              <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="size-2.5 rounded-full bg-chart-1" /> Crowded Spots
                </span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="size-2.5 rounded-full bg-chart-2" /> Hidden Gems
                </span>
              </div>

              {/* Daily / Weekly Segmented Tab Control */}
              <div className="p-1 rounded-xl bg-muted border border-border flex items-center text-xs font-bold shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--shadow-color)_6%,transparent)]">
                {(['Daily', 'Weekly'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setChartPeriod(period)}
                    className={`px-3.5 py-1 rounded-lg transition-all cursor-pointer ${
                      chartPeriod === period
                        ? 'bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground shadow-xs font-black'
                        : 'bg-card/60 hover:bg-card text-primary hover:text-primary border border-transparent hover:border-border'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyVisitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      color: 'var(--popover-foreground)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 24px color-mix(in srgb,var(--shadow-color) 8%,transparent)',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
                  />
                  <Bar
                    dataKey="saturated"
                    name="Popular Places"
                    fill="var(--chart-1)"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="conscious"
                    name="Peaceful Alternatives"
                    fill="var(--chart-2)"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Travel Mood Categories Donut Chart (4 cols) */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] flex flex-col justify-between space-y-4">
          <div>
            <h2 className="font-heading text-lg font-black text-foreground">
              Travel Categories
            </h2>
            <p className="text-xs text-muted-foreground">
              Types of places you can visit
            </p>
          </div>

          {/* Donut Chart with Centered Total */}
          <div className="relative h-48 w-full flex items-center justify-center">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      color: 'var(--popover-foreground)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-heading text-xl font-black text-foreground">100%</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Selected</span>
            </div>
          </div>

          {/* Custom Category Legends */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border text-xs">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-muted-foreground truncate font-medium">{cat.name}</span>
                <span className="font-bold text-foreground ml-auto">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Mid-Bottom Row: Area Trajectory Curve + Concentric Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hourly Visitor Pressure Trajectory (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-black text-foreground">
                Best Times to Visit
              </h2>
              <p className="text-xs text-muted-foreground">
                Find the best times to enjoy without waiting in line
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-muted text-foreground text-xs font-bold border border-border">
              Optimal: 06:00 - 10:00
            </span>
          </div>

          <div className="h-56 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyTrajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConscious" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      color: 'var(--popover-foreground)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="quiet"
                    name="Hidden Gems Crowds"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorConscious)"
                  />
                  <Area
                    type="monotone"
                    dataKey="saturated"
                    name="Popular Places Crowds"
                    stroke="var(--chart-1)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Kleon-Style Profile Summary with Concentric Rings (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-black text-foreground">
                Profile Summary
              </h2>
              <p className="text-xs text-muted-foreground">
                Your travel impact and preferences
              </p>
            </div>
            <span className="size-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </span>
          </div>

          {/* Concentric Circular Rings SVG Widget */}
          <div className="relative h-44 w-full flex items-center justify-center">
            <svg className="size-40 -rotate-90" viewBox="0 0 100 100">
              {/* Outer Ring: Eco-Footprint (94%) */}
              <circle cx="50" cy="50" r="42" stroke="var(--muted)" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="var(--chart-1)"
                strokeWidth="6"
                strokeDasharray="264"
                strokeDashoffset="264 - (264 * 0.94)"
                strokeLinecap="round"
                fill="none"
              />

              {/* Middle Ring: Homestay Benefit (88%) */}
              <circle cx="50" cy="50" r="32" stroke="var(--muted)" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="32"
                stroke="var(--chart-2)"
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset="201 - (201 * 0.88)"
                strokeLinecap="round"
                fill="none"
              />

              {/* Inner Ring: Crowd Reduction (68%) */}
              <circle cx="50" cy="50" r="22" stroke="var(--muted)" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="22"
                stroke="var(--chart-3)"
                strokeWidth="6"
                strokeDasharray="138"
                strokeDashoffset="138 - (138 * 0.68)"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Your Level</span>
              <span className="font-heading text-lg font-black text-primary">Eco Explorer</span>
            </div>
          </div>

          {/* Concentric Legend List */}
          <div className="space-y-2 pt-2 border-t border-border text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <span className="size-2.5 rounded-full bg-primary" /> Eco-Friendly Score
              </span>
              <strong className="text-primary font-bold">94%</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <span className="size-2.5 rounded-full bg-primary" /> Local Support
              </span>
              <strong className="text-primary font-bold">88%</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <span className="size-2.5 rounded-full bg-accent" /> Crowd Avoidance
              </span>
              <strong className="text-primary font-bold">68%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Bottom Gallery: Curated Destinations with Clean Vibe Filter ───── */}
      <div className="space-y-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-black text-foreground">
              Beautiful Places to Explore
            </h2>
            <p className="text-xs text-muted-foreground">
              {filteredDestinations.length} peaceful destinations with verified local stays and nature trails
            </p>
          </div>

          {/* Vibe Category Tabs (Elegant Ceylon Lagoon Blue Segmented Control) */}
          <div className="p-1.5 rounded-2xl bg-muted border border-border flex flex-wrap items-center gap-1.5 shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--shadow-color)_6%,transparent)]">
            {[
              { id: 'ALL', label: 'All Places' },
              { id: 'HIGHLANDS', label: 'Highlands' },
              { id: 'WATERFALLS', label: 'Waterfalls' },
              { id: 'HERITAGE', label: 'Heritage' },
              { id: 'COASTAL', label: 'Coastal' },
            ].map((vibe) => {
              const isActive = selectedVibe === vibe.id;
              return (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => setSelectedVibe(vibe.id as VibeCategory)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground shadow-[0_3px_12px_color-mix(in_srgb,var(--shadow-color)_28%,transparent)] ring-1 ring-overlay-foreground/20 font-black'
                      : 'bg-card/60 hover:bg-card text-primary hover:text-primary border border-transparent hover:border-border hover:shadow-2xs'
                  }`}
                >
                  {vibe.label}
                </button>
              );
            })}
          </div>
        </div>

        {destinationsLoading && (
          <p className="text-sm text-muted-foreground">Loading destination sustainability data...</p>
        )}
        {destinationsError && (
          <p className="text-sm text-destructive">{destinationsError}</p>
        )}

        {/* 3 Destination Cards Grid */}
        {!destinationsLoading && !destinationsError && <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDestinations.slice(0, 3).map((dest) => (
            <div
              key={dest.id}
              className="group rounded-3xl bg-card border border-border overflow-hidden shadow-dashboard-card transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-106 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-overlay/85 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-overlay/85 text-overlay-foreground backdrop-blur-md border border-overlay-foreground/20">
                    {dest.pressure.level} CROWDS
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveToggle(dest)}
                  className="absolute top-3.5 right-3.5 p-2 rounded-full bg-card/90 hover:bg-card text-primary shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title={isSaved(dest.id) ? 'Saved' : 'Save'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isSaved(dest.id) ? 'fill-destructive text-destructive' : 'text-primary'
                    }`}
                  />
                </button>

                <div className="absolute bottom-3.5 inset-x-4 text-overlay-foreground">
                  <span className="text-[10px] font-bold text-frosted-blue uppercase tracking-wider block">
                    {dest.district} District
                  </span>
                  <h3 className="font-heading text-xl font-bold leading-tight mt-0.5 text-overlay-foreground">
                    {dest.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-border text-xs">
                    <span className="text-muted-foreground font-medium">Eco-Friendly Score</span>
                    <span className="font-black text-primary">
                      {dest.sustainability.overall} / 100
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                    <span>{dest.tags.slice(0, 2).join(' • ')}</span>
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
          ))}
        </div>}
      </div>
    </div>
  );
}
