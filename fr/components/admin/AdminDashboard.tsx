'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  MapPin,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  SlidersHorizontal,
  RefreshCw,
  Send,
  Layers,
  Sparkles,
  Search,
  Eye,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getAdminDashboard } from '@/lib/destinations';
import { useAuth } from '@/context/AuthContext';
import type { AdminDashboardResponse } from '@/types/destination-api';
import describeApiError from '@/lib/apiError';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function AdminDashboard() {
  const [pressureFilter, setPressureFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [month, setMonth] = useState(currentMonth);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user, role, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading || !user || role !== 'ADMIN') return;
    let active = true;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setLoadError(null);
      getAdminDashboard(month)
        .then((response) => {
          if (active) setDashboard(response);
        })
        .catch((error) => {
          if (!active) return;
          setDashboard(null);
          setLoadError(describeApiError(error, 'Unable to load the admin dashboard.'));
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isAuthLoading, month, reloadKey, role, user]);

  if (isAuthLoading) return <div className="p-12 text-center text-sm text-muted-foreground">Restoring administrator session...</div>;
  if (!user || role !== 'ADMIN') {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-2">
        <h2 className="text-lg font-bold text-foreground">Administrator access required</h2>
        <p className="text-sm text-muted-foreground">This dashboard is available only to authorized administrators.</p>
      </div>
    );
  }
  if (isLoading && !dashboard) return <div className="p-12 text-center text-sm text-muted-foreground">Loading administrator dashboard...</div>;
  if (loadError) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
        <h2 className="text-lg font-bold text-foreground">Dashboard unavailable</h2>
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="text-sm font-bold text-primary hover:underline">Try again</button>
      </div>
    );
  }
  if (!dashboard) return null;

  const highestPressureList = dashboard.highest_pressure_destinations;
  const filteredDestinations = highestPressureList.filter((destination) => {
    const matchesFilter = pressureFilter === 'ALL' || destination.pressure_level === pressureFilter;
    const matchesSearch =
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const overviewChartData = highestPressureList.map((destination) => ({
    name: destination.name,
    pressure: destination.predicted_regional_occupancy_rate,
    sustainability: destination.sustainability_score ?? 0,
  }));

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto w-full">
      {/* ── 1. Top Action Bar & Header ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Admin Dashboard
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Live AI Monitoring
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Admin Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            Live crowd monitoring, congestion alerts, and eco-friendly recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={isLoading}
            className="rounded-xl gap-2 cursor-pointer bg-card border-primary/30 text-primary hover:bg-primary/10 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-secondary ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh dashboard</span>
          </Button>

        </div>
      </div>

      <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
          <span className="font-semibold">{dashboard.recommended_action.message}</span>
        </div>
        <label className="flex items-center gap-2 font-bold text-muted-foreground">
          Forecast month
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="h-8 rounded-lg border border-border bg-background px-2 text-[10px] text-foreground" />
        </label>
      </div>

      {/* ── 2. Top 4 Modern KPI Cards with Sparklines & Donut Rings ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monitored Sites */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Monitored Places
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">
                {dashboard.monitored_destinations}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">locations</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary pt-0.5">
              <span className="text-primary">● Active</span>
              <span className="text-muted-foreground font-normal">tracking</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-muted text-primary">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Card 2: Low Pressure Sites with Mini Donut Ring */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Quiet Places
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">
                {dashboard.pressure_counts.low}
              </span>
                <span className="text-xs text-muted-foreground font-semibold">/ {dashboard.total_active_destinations} sites</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary pt-0.5">
              <span className="text-primary">★ Optimal</span>
              <span className="text-muted-foreground font-normal">crowd levels</span>
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
                strokeDasharray={`${dashboard.total_active_destinations ? (dashboard.pressure_counts.low / dashboard.total_active_destinations) * 100 : 0}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-foreground">
              {dashboard.total_active_destinations ? Math.round((dashboard.pressure_counts.low / dashboard.total_active_destinations) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Card 3: Moderate Pressure with Mini Wave Sparkline */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Moderate Crowds
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">
                {dashboard.pressure_counts.medium}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">places</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary pt-0.5">
              <span className="text-primary">▲ Watch</span>
              <span className="text-muted-foreground font-normal">getting busy</span>
            </div>
          </div>

          {/* Mini Wave SVG Sparkline */}
          <div className="w-16 h-10 shrink-0">
            <svg viewBox="0 0 70 35" className="w-full h-full overflow-visible">
              <path
                d="M 0 25 Q 20 8, 35 18 T 60 12 T 70 14"
                fill="none"
                stroke="var(--chart-2)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="70" cy="14" r="3.5" fill="var(--chart-1)" />
            </svg>
          </div>
        </div>

        {/* Card 4: High Pressure Alerts */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Very Busy Alerts
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-destructive tracking-tight">
                {dashboard.pressure_counts.high}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">crowded</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-destructive pt-0.5">
              <span>▲ Alert</span>
              <span className="text-muted-foreground font-normal">too many visitors</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── 3. Quick Access Authority Modules Grid ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/admin/destinations" className="group">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-dashboard-panel hover:shadow-dashboard-card hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted text-primary group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-xs font-black text-foreground block">Manage Places</span>
                <span className="text-[10px] text-muted-foreground">Update details and rules</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/tourism-pressure" className="group">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-dashboard-panel hover:shadow-dashboard-card hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning/10 text-warning group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-foreground block">Crowd Simulator</span>
                <span className="text-[10px] text-muted-foreground">Test AI routing</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/analytics" className="group">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-dashboard-panel hover:shadow-dashboard-card hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted text-primary group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-xs font-black text-foreground block">Eco Reports</span>
                <span className="text-[10px] text-muted-foreground">View overall impact</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/settings" className="group">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-dashboard-panel hover:shadow-dashboard-card hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted text-primary group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-xs font-black text-foreground block">AI Settings</span>
                <span className="text-[10px] text-muted-foreground">Tweak recommendations</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── 4. Real-Time Capacity & Sustainability Load Bar Chart ─────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-muted text-primary">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-heading text-lg font-black text-foreground">
                Crowd Levels vs. Eco-Friendly Scores
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Compare how busy places are against their environmental scores.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="size-2.5 rounded-full bg-chart-1" />
              <span>Crowd Level %</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="size-2.5 rounded-full bg-chart-2" />
              <span>Eco-Friendly Score</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
                <XAxis
                  dataKey="name"
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
                  dataKey="pressure"
                  name="Crowd Level %"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                  barSize={16}
                />
                <Bar
                  dataKey="sustainability"
                  name="Eco-Friendly Score"
                  fill="var(--chart-2)"
                  radius={[6, 6, 0, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          
        </div>
      </div>

      {/* ── 5. Live Redistribution Flow Card ───────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-dashboard-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted border border-border text-primary shadow-2xs">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-black text-foreground">
                AI Tourist Routing Active
              </h2>
              <p className="text-xs text-muted-foreground">
                Suggesting quieter places to travelers to reduce crowding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Badge variant={dashboard.recommended_action.priority === 'HIGH' ? 'destructive' : 'success'}>
              {dashboard.recommended_action.priority} ACTION
            </Badge>
            <span className="text-xs font-mono font-bold text-foreground">{dashboard.monitored_destinations} monitored</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-background border border-border shadow-dashboard-panel space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-destructive">Busy Location</span>
              <Badge variant="destructive">82% Full</Badge>
            </div>
            <p className="font-heading text-base font-black text-foreground">{highestPressureList[0]?.name ?? 'No pressure data'}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {highestPressureList[0]
                ? `${highestPressureList[0].predicted_regional_occupancy_rate.toFixed(1)}% regional occupancy in ${highestPressureList[0].region}.`
                : 'No regional pressure forecast is available for this month.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background border border-border shadow-dashboard-panel space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-primary">Suggested Alternatives</span>
              <Send className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="font-heading text-base font-black text-foreground">
              {dashboard.recommended_action.destination_ids.length
                ? dashboard.recommended_action.destination_ids
                  .map((id) => highestPressureList.find((destination) => destination.id === id)?.name)
                  .filter(Boolean)
                  .join(' & ')
                : 'No destinations queued'}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {dashboard.recommended_action.message}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background border border-border shadow-dashboard-panel space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-success">Impact</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="font-heading text-base font-black text-foreground">
              {dashboard.sustainability.average_score === null
                ? 'Sustainability unavailable'
                : `${dashboard.sustainability.average_score.toFixed(1)} average index`}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {dashboard.sustainability.scored_destinations} destinations have scored sustainability factors.
            </p>
          </div>
        </div>
      </div>

      {/* ── 6. Highest Pressure Destinations Table with Interactive Filtering ──── */}
      <div className="rounded-3xl border border-border bg-card shadow-dashboard-card overflow-hidden space-y-4">
        <div className="p-6 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="font-heading text-lg font-black text-foreground">
                Live Destination Status
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time crowd levels and eco-scores for all tracked places.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pilot sites..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-secondary"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-muted border border-border text-xs font-bold shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--shadow-color)_6%,transparent)]">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPressureFilter(lvl)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                    pressureFilter === lvl
                      ? 'bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground shadow-xs font-black'
                      : 'bg-card/60 hover:bg-card text-primary hover:text-primary border border-transparent hover:border-border'
                  }`}
                >
                  {lvl === 'ALL'
                    ? `All (${highestPressureList.length})`
                    : `${lvl} (${highestPressureList.filter((destination) => destination.pressure_level === lvl).length})`}
                </button>
              ))}
            </div>

            <Link href="/admin/destinations">
              <Button size="xs" variant="outline" className="rounded-xl gap-1 shadow-xs">
                <span>Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="px-6 pb-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-muted-foreground uppercase tracking-wider text-[11px]">
                <TableHead className="py-3 px-3">Destination</TableHead>
                <TableHead className="py-3 px-3">Region</TableHead>
                <TableHead className="py-3 px-3">Load vs Limit</TableHead>
                <TableHead className="py-3 px-3">Capacity Gauge</TableHead>
                <TableHead className="py-3 px-3">Sustainability</TableHead>
                <TableHead className="py-3 px-3">Telemetry Feed</TableHead>
                <TableHead className="py-3 px-3 text-right">Inspect</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDestinations.map((dest) => (
                <TableRow key={dest.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="py-3.5 px-3 font-bold text-foreground">
                    <div>
                      <span>{dest.name}</span>
                      <span className="text-[10px] text-muted-foreground block font-normal truncate max-w-[200px]">
                        {dest.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-muted-foreground text-xs">{dest.region}</TableCell>
                  <TableCell className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs">{dest.predicted_regional_occupancy_rate.toFixed(1)}%</span>
                      <Badge
                        variant={
                          dest.pressure_level === 'HIGH'
                            ? 'destructive'
                            : dest.pressure_level === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {dest.pressure_level}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            dest.pressure_level === 'HIGH'
                              ? 'bg-destructive'
                              : dest.pressure_level === 'MEDIUM'
                              ? 'bg-primary'
                              : 'bg-secondary'
                          }`}
                          style={{ width: `${dest.predicted_regional_occupancy_rate}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 font-bold text-secondary text-xs">
                    {dest.sustainability_score === null ? '—' : dest.sustainability_score.toFixed(1)} / 100
                  </TableCell>
                  <TableCell className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      Live (5m)
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right">
                    <Link href={`/destinations/${dest.slug}`}>
                      <Button size="xs" variant="outline" className="rounded-xl gap-1 text-xs hover:border-secondary">
                        <Eye className="w-3 h-3 text-secondary" />
                        <span>Inspect</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">No destinations match your filter</p>
              <p>Try searching another name or selecting &apos;All&apos;.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
