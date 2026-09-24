'use client';

import React, { useState, useMemo } from 'react';
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
import { DESTINATIONS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

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
  { name: 'Misty Highlands', value: 38, color: '#004554' },
  { name: 'Quiet Waterfalls', value: 26, color: '#44A6B5' },
  { name: 'Ancient Heritage', value: 22, color: '#B2D5E2' },
  { name: 'Coastal Havens', value: 14, color: '#D3D0C8' },
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

  // Vibe filter logic
  const filteredDestinations = useMemo(() => {
    let list = DESTINATIONS;

    if (selectedVibe === 'HIGHLANDS') {
      list = list.filter((d) => ['haputale', 'belihuloya', 'knuckles', 'ella'].includes(d.id));
    } else if (selectedVibe === 'WATERFALLS') {
      list = list.filter((d) => ['belihuloya', 'haputale', 'kitulgala'].includes(d.id));
    } else if (selectedVibe === 'HERITAGE') {
      list = list.filter((d) => ['meemure', 'sigiriya', 'jaffna', 'ritigala'].includes(d.id));
    } else if (selectedVibe === 'COASTAL') {
      list = list.filter((d) => ['kalpitiya', 'mirissa', 'tangalle', 'mannar'].includes(d.id));
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
  }, [selectedVibe, searchQuery]);

  const handleSaveToggle = (destId: string, destName: string) => {
    const currentlySaved = isSaved(destId);
    toggleSaveDestination(destId);
    setLastSavedNotice(
      currentlySaved ? `Removed ${destName} from your saved trips` : `Saved ${destName} to your journey bucketlist!`
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#44A6B5]">
              Traveler Overview &amp; Analytics
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-black">
              <span className="size-2 rounded-full bg-[#44A6B5] animate-pulse" />
              Live Island Feed
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-black tracking-tight mt-0.5">
            {user?.name ? `${user.name}'s Overview` : 'Conscious Travel Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A737D] mt-0.5 font-medium">
            Monitor real-time carrying capacities, eco-footprint, and curated crowd-free sanctuaries.
          </p>
        </div>

        {/* Center / Right Filter & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center min-w-[220px] sm:min-w-[260px]">
            <Search className="absolute left-3.5 w-4 h-4 text-[#5A737D] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search here..."
              className="w-full pl-10 pr-8 py-2 rounded-2xl bg-white border border-[#004554]/15 text-[#004554] placeholder:text-[#5A737D] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#44A6B5] focus:border-transparent shadow-[0_2px_8px_rgba(0,69,84,0.03)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-[#5A737D] hover:text-[#004554] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Period Selector Dropdown Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#004554]/15 shadow-[0_2px_8px_rgba(0,69,84,0.03)] text-xs font-bold text-[#004554]">
            <Calendar className="w-3.5 h-3.5 text-[#44A6B5]" />
            <span className="hidden sm:inline">Aug 2026 - Oct 2026</span>
            <span className="sm:hidden">Q3 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5A737D] ml-1" />
          </div>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-[#EAF4F7] border border-[#004554]/15 text-[#004554] text-xs font-bold shadow-[0_2px_8px_rgba(0,69,84,0.03)] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#44A6B5]" />
            <span>{downloadNotice ? 'Exported!' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {lastSavedNotice && (
        <div className="p-3.5 px-4 rounded-2xl bg-alice-blue border border-moonstone/50 flex items-center justify-between text-xs text-midnight-green shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-full bg-moonstone/20 text-moonstone">
              <Bookmark className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold">{lastSavedNotice}</span>
          </div>
          <Link href="/saved" className="text-moonstone font-bold hover:underline">
            View Bucketlist →
          </Link>
        </div>
      )}

      {/* ── 2. Top 4 Modern Kleon Metric KPI Cards with Sparklines ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Eco-Score with Circular Donut Gauge */}
        <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Eco Travel Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-black tracking-tight">94</span>
              <span className="text-xs text-[#5A737D] font-semibold">/100</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#004554] pt-0.5">
              <span className="text-[#44A6B5]">▲ +4.2%</span>
              <span className="text-[#5A737D] font-normal">than last trip</span>
            </div>
          </div>

          {/* Mini Donut Progress Ring */}
          <div className="relative size-14 shrink-0 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E9F1F6]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#44A6B5]"
                strokeDasharray="94, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-black">94%</span>
          </div>
        </div>

        {/* Card 2: Crowd Avoidance with Mini Smooth Curve */}
        <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
              Crowd Congestion
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-black tracking-tight">68%</span>
              <span className="text-xs text-[#5A737D] font-semibold">less</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#004554] pt-0.5">
              <span className="text-[#44A6B5]">▲ +12%</span>
              <span className="text-[#5A737D] font-normal">vs Ella corridor</span>
            </div>
          </div>

          {/* Mini Wave SVG Sparkline */}
          <div className="w-16 h-10 shrink-0">
            <svg viewBox="0 0 70 35" className="w-full h-full overflow-visible">
              <path
                d="M 0 30 Q 15 5, 30 20 T 60 8 T 70 12"
                fill="none"
                stroke="#44A6B5"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="70" cy="12" r="3.5" fill="#004554" />
            </svg>
          </div>
        </div>

        {/* Card 3: Saved Sanctuaries with Mini Bar Sparkline */}
        <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
              Saved Sanctuaries
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-black tracking-tight">
                {savedDestinationIds.length > 0 ? savedDestinationIds.length : 4}
              </span>
              <span className="text-xs text-[#5A737D] font-semibold">destinations</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#004554] pt-0.5">
              <span className="text-[#44A6B5]">● Ready</span>
              <span className="text-[#5A737D] font-normal">for trip routing</span>
            </div>
          </div>

          {/* Mini Bar SVG Sparkline */}
          <div className="flex items-end gap-1.5 h-10 w-14 shrink-0">
            <div className="w-2.5 bg-[#E9F1F6] h-5 rounded-full" />
            <div className="w-2.5 bg-[#B2D5E2] h-8 rounded-full" />
            <div className="w-2.5 bg-[#44A6B5] h-10 rounded-full" />
            <div className="w-2.5 bg-[#004554] h-7 rounded-full" />
          </div>
        </div>

        {/* Card 4: Direct Homestay Benefit with Circular Donut */}
        <div className="p-5 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#5A737D] uppercase tracking-wider block">
              Direct Host Benefit
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-black tracking-tight">88%</span>
              <span className="text-xs text-[#5A737D] font-semibold">income</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#004554] pt-0.5">
              <span className="text-[#44A6B5]">★ Certified</span>
              <span className="text-[#5A737D] font-normal">village homestays</span>
            </div>
          </div>

          {/* Mini Donut Progress Ring */}
          <div className="relative size-14 shrink-0 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E9F1F6]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#004554]"
                strokeDasharray="88, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-black">88%</span>
          </div>
        </div>
      </div>

      {/* ── 3. Mid-Top Row: Bar Chart + Donut Categories Breakdown ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Project Statistics / Regional Visitor Load Bar Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-black text-black">
                Visitor Load vs. Conscious Dispersal
              </h2>
              <p className="text-xs text-[#5A737D]">
                Compares saturated peak corridors against CeylonTour crowd-free alternatives
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Stat Chips */}
              <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#004554]">
                  <span className="size-2.5 rounded-full bg-[#004554]" /> Peak Influx
                </span>
                <span className="flex items-center gap-1.5 text-[#44A6B5]">
                  <span className="size-2.5 rounded-full bg-[#44A6B5]" /> CeylonTour Flow
                </span>
              </div>

              {/* Daily / Weekly Segmented Tab Control */}
              <div className="p-1 rounded-xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] border border-[#B5D7E4] flex items-center text-xs font-bold shadow-[inset_0_1px_3px_rgba(0,69,84,0.06)]">
                {(['Daily', 'Weekly'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setChartPeriod(period)}
                    className={`px-3.5 py-1 rounded-lg transition-all cursor-pointer ${
                      chartPeriod === period
                        ? 'bg-gradient-to-r from-[#003E4C] via-[#004E5F] to-[#04667C] text-white shadow-xs font-black'
                        : 'bg-white/60 hover:bg-white text-[#004554] hover:text-[#002D38] border border-transparent hover:border-[#B5D7E4]'
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF2F6" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#5A737D', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#5A737D', fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,69,84,0.12)',
                      boxShadow: '0 8px 24px rgba(0,69,84,0.08)',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: '#F0F6F8', opacity: 0.6 }}
                  />
                  <Bar
                    dataKey="saturated"
                    name="Peak Hubs (Ella/Sigiriya)"
                    fill="#004554"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="conscious"
                    name="Conscious Escapes (Belihuloya)"
                    fill="#44A6B5"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Travel Mood Categories Donut Chart (4 cols) */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-white border border-[#004554]/10 shadow-[0_8px_30px_rgba(0,69,84,0.03)] flex flex-col justify-between space-y-4">
          <div>
            <h2 className="font-heading text-lg font-black text-black">
              Travel Categories
            </h2>
            <p className="text-xs text-[#5A737D]">
              Distribution of curated eco-sanctuaries
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
                      <Cell key={`cell-${index}`} fill={entry.color === '#004554' ? '#111827' : entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-heading text-xl font-black text-black">100%</span>
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Curated</span>
            </div>
          </div>

          {/* Custom Category Legends */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/8 text-xs">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cat.color === '#004554' ? '#111827' : cat.color }} />
                <span className="text-[#64748B] truncate font-medium">{cat.name}</span>
                <span className="font-bold text-black ml-auto">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Mid-Bottom Row: Area Trajectory Curve + Concentric Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hourly Visitor Pressure Trajectory (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white border border-black/8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-black text-black">
                Hourly Visitor Pressure Trajectory
              </h2>
              <p className="text-xs text-[#64748B]">
                Optimal time windows to explore with zero bottleneck queues
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#F1F5F9] text-black text-xs font-bold border border-black/10">
              Optimal: 06:00 - 10:00
            </span>
          </div>

          <div className="h-56 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyTrajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConscious" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#44A6B5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#44A6B5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="quiet"
                    name="Conscious Sanctuary Load"
                    stroke="#44A6B5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorConscious)"
                  />
                  <Area
                    type="monotone"
                    dataKey="saturated"
                    name="Saturated Corridors"
                    stroke="#111827"
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
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-black text-black">
                Profile Summary
              </h2>
              <p className="text-xs text-[#5A737D]">
                Your conscious travel compliance &amp; impact
              </p>
            </div>
            <span className="size-8 rounded-full bg-[#EAF4F7] flex items-center justify-center text-[#004554]">
              <ShieldCheck className="w-4 h-4 text-[#44A6B5]" />
            </span>
          </div>

          {/* Concentric Circular Rings SVG Widget */}
          <div className="relative h-44 w-full flex items-center justify-center">
            <svg className="size-40 -rotate-90" viewBox="0 0 100 100">
              {/* Outer Ring: Eco-Footprint (94%) */}
              <circle cx="50" cy="50" r="42" stroke="#EAF4F7" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#004554"
                strokeWidth="6"
                strokeDasharray="264"
                strokeDashoffset="264 - (264 * 0.94)"
                strokeLinecap="round"
                fill="none"
              />

              {/* Middle Ring: Homestay Benefit (88%) */}
              <circle cx="50" cy="50" r="32" stroke="#EAF4F7" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="32"
                stroke="#44A6B5"
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset="201 - (201 * 0.88)"
                strokeLinecap="round"
                fill="none"
              />

              {/* Inner Ring: Crowd Reduction (68%) */}
              <circle cx="50" cy="50" r="22" stroke="#EAF4F7" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="22"
                stroke="#B2D5E2"
                strokeWidth="6"
                strokeDasharray="138"
                strokeDashoffset="138 - (138 * 0.68)"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-[#5A737D]">Eco Tier</span>
              <span className="font-heading text-lg font-black text-[#004554]">Pioneer</span>
            </div>
          </div>

          {/* Concentric Legend List */}
          <div className="space-y-2 pt-2 border-t border-[#004554]/10 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#5A737D] font-medium">
                <span className="size-2.5 rounded-full bg-[#004554]" /> Environmental Score
              </span>
              <strong className="text-[#004554] font-bold">94%</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#5A737D] font-medium">
                <span className="size-2.5 rounded-full bg-[#44A6B5]" /> Homestay Benefit
              </span>
              <strong className="text-[#004554] font-bold">88%</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#5A737D] font-medium">
                <span className="size-2.5 rounded-full bg-[#B2D5E2]" /> Crowd Avoidance
              </span>
              <strong className="text-[#004554] font-bold">68%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Bottom Gallery: Curated Destinations with Clean Vibe Filter ───── */}
      <div className="space-y-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-black text-black">
              Curated Sanctuaries to Explore
            </h2>
            <p className="text-xs text-[#5A737D]">
              {filteredDestinations.length} destinations calibrated for peace, verified homestays &amp; pristine trails
            </p>
          </div>

          {/* Vibe Category Tabs (Elegant Ceylon Lagoon Blue Segmented Control) */}
          <div className="p-1.5 rounded-2xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] border border-[#B5D7E4] flex flex-wrap items-center gap-1.5 shadow-[inset_0_1px_3px_rgba(0,69,84,0.06)]">
            {[
              { id: 'ALL', label: 'All Sanctuaries' },
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
                      ? 'bg-gradient-to-r from-[#003E4C] via-[#004E5F] to-[#04667C] text-white shadow-[0_3px_12px_rgba(0,69,84,0.28)] ring-1 ring-white/20 font-black'
                      : 'bg-white/60 hover:bg-white text-[#004554] hover:text-[#002D38] border border-transparent hover:border-[#B5D7E4] hover:shadow-2xs'
                  }`}
                >
                  {vibe.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDestinations.slice(0, 3).map((dest) => (
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
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#004554]/85 text-white backdrop-blur-md border border-white/20">
                    {dest.pressure.level} PRESSURE
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveToggle(dest.id, dest.name)}
                  className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 hover:bg-white text-[#004554] shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title={isSaved(dest.id) ? 'Saved' : 'Save'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isSaved(dest.id) ? 'fill-rose-500 text-rose-500' : 'text-[#004554]'
                    }`}
                  />
                </button>

                <div className="absolute bottom-3.5 inset-x-4 text-white">
                  <span className="text-[10px] font-bold text-[#B2D5E2] uppercase tracking-wider block">
                    {dest.district} District
                  </span>
                  <h3 className="font-heading text-xl font-bold leading-tight mt-0.5 text-white">
                    {dest.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#004554]/10 text-xs">
                    <span className="text-[#5A737D] font-medium">Sustainability Index</span>
                    <span className="font-black text-[#004554]">
                      {dest.sustainability.overall} / 100
                    </span>
                  </div>

                  <p className="text-xs text-[#5A737D] line-clamp-2 mt-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-[#5A737D] font-medium">
                    <span>{dest.tags.slice(0, 2).join(' • ')}</span>
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
      </div>
    </div>
  );
}
