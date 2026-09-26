'use client';

import React, { useState } from 'react';
import {
  Leaf,
  DollarSign,
  Users,
  Download,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

// 1. Time Series Dispersal Trajectory (Jan - Oct 2026)
const dispersalTrendData = [
  { month: 'Jan', saturatedHubs: 94, ecoAlternatives: 22, capacityThreshold: 75 },
  { month: 'Feb', saturatedHubs: 98, ecoAlternatives: 25, capacityThreshold: 75 },
  { month: 'Mar', saturatedHubs: 92, ecoAlternatives: 30, capacityThreshold: 75 },
  { month: 'Apr', saturatedHubs: 88, ecoAlternatives: 36, capacityThreshold: 75 },
  { month: 'May', saturatedHubs: 82, ecoAlternatives: 42, capacityThreshold: 75 },
  { month: 'Jun', saturatedHubs: 78, ecoAlternatives: 48, capacityThreshold: 75 },
  { month: 'Jul', saturatedHubs: 74, ecoAlternatives: 54, capacityThreshold: 75 },
  { month: 'Aug', saturatedHubs: 70, ecoAlternatives: 58, capacityThreshold: 75 },
  { month: 'Sep', saturatedHubs: 66, ecoAlternatives: 62, capacityThreshold: 75 },
  { month: 'Oct', saturatedHubs: 64, ecoAlternatives: 65, capacityThreshold: 75 },
];

// 2. Carrying Capacity & Footfall Optimization by Destination
const destinationComparisonData = [
  { destination: 'Ella', baseline: 92, current: 64, safeLimit: 70 },
  { destination: 'Sigiriya', baseline: 88, current: 66, safeLimit: 70 },
  { destination: 'Mirissa', baseline: 79, current: 60, safeLimit: 65 },
  { destination: 'Belihuloya', baseline: 18, current: 52, safeLimit: 75 },
  { destination: 'Haputale', baseline: 24, current: 56, safeLimit: 75 },
  { destination: 'Meemure', baseline: 14, current: 44, safeLimit: 60 },
  { destination: 'Knuckles', baseline: 20, current: 48, safeLimit: 65 },
];

// 3. Monthly Carbon Reduction & Community Revenue Inflow
const impactTimelineData = [
  { month: 'May', co2Saved: 8.2, revenueM: 14.2 },
  { month: 'Jun', co2Saved: 9.8, revenueM: 16.8 },
  { month: 'Jul', co2Saved: 11.4, revenueM: 19.5 },
  { month: 'Aug', co2Saved: 13.1, revenueM: 22.1 },
  { month: 'Sep', co2Saved: 14.8, revenueM: 24.6 },
  { month: 'Oct (Proj)', co2Saved: 16.2, revenueM: 27.8 },
];

const categoryShareData = [
  { name: 'Eco-Trekking & Waterfalls', value: 38, color: 'var(--chart-1)' },
  { name: 'Heritage & Ancient Sanctuaries', value: 27, color: 'var(--chart-2)' },
  { name: 'Rural Agro & Homestays', value: 21, color: 'var(--chart-3)' },
  { name: 'Marine & Coast Sanctuaries', value: 14, color: 'var(--chart-4)' },
];

const emptySubscribe = () => () => {};

export default function AdminAnalyticsPage() {
  const [exported, setExported] = useState(false);
  const [timeframe, setTimeframe] = useState<'30D' | 'Q3' | 'YTD'>('Q3');
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto w-full">
      {/* ── 1. Top Action Bar & Header ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Authority Macro Analytics
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              National Dispersal Audit 2026
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Redistribution &amp; Ecological Impact Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            Interactive charts, visitor dispersal trajectories, and carbon offset audits from AI visitor routing.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          {/* Segmented Timeframe Switcher */}
          <div className="p-1 rounded-xl bg-muted border border-border flex items-center text-xs font-bold shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--shadow-color)_6%,transparent)]">
            {(['30D', 'Q3', 'YTD'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-3.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeframe === t
                    ? 'bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground shadow-xs font-black'
                    : 'bg-card/60 hover:bg-card text-primary hover:text-primary border border-transparent hover:border-border'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="rounded-xl gap-1.5 cursor-pointer bg-card border-border hover:border-primary/40 shadow-xs"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>{exported ? 'Report Downloaded!' : 'Export Dossier'}</span>
          </Button>
        </div>
      </div>

      {exported && (
        <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center gap-2 text-xs text-foreground animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
          <span className="font-semibold">
            Tourism Authority Sustainable Redistribution Report ({timeframe} 2026) exported successfully.
          </span>
        </div>
      )}

      {/* ── 2. Top 4 Metric KPI Cards with Sparklines ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Carbon Footprint Avoided with Donut Gauge */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Carbon Avoided
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">14.8 T</span>
              <span className="text-xs text-muted-foreground font-semibold">CO2e</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary pt-0.5">
              <span className="text-primary">▲ +22%</span>
              <span className="text-muted-foreground font-normal">vs last quarter</span>
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
                strokeDasharray="86, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-foreground">86%</span>
          </div>
        </div>

        {/* Card 2: Travelers Dispersed with Wave Sparkline */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Travelers Dispersed
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">3,840</span>
              <span className="text-xs text-muted-foreground font-semibold">tourists</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary pt-0.5">
              <span className="text-primary">▲ +34%</span>
              <span className="text-muted-foreground font-normal">to rural sites</span>
            </div>
          </div>

          {/* Mini Wave SVG Sparkline */}
          <div className="w-16 h-10 shrink-0">
            <svg viewBox="0 0 70 35" className="w-full h-full overflow-visible">
              <path
                d="M 0 28 Q 18 6, 35 18 T 60 8 T 70 10"
                fill="none"
                stroke="var(--chart-2)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="70" cy="10" r="3.5" fill="var(--chart-1)" />
            </svg>
          </div>
        </div>

        {/* Card 3: Rural Community Revenue with Mini Bar Sparkline */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Rural Eco-Revenue
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">24.6M</span>
              <span className="text-xs text-muted-foreground font-semibold">LKR</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary pt-0.5">
              <span className="text-primary">● Injected</span>
              <span className="text-muted-foreground font-normal">to local homestays</span>
            </div>
          </div>

          {/* Mini Bar SVG Sparkline */}
          <div className="flex items-end gap-1.5 h-10 w-14 shrink-0">
            <div className="w-2.5 bg-muted h-4 rounded-full" />
            <div className="w-2.5 bg-accent h-6 rounded-full" />
            <div className="w-2.5 bg-secondary h-8 rounded-full" />
            <div className="w-2.5 bg-primary h-10 rounded-full" />
          </div>
        </div>

        {/* Card 4: Conscious Satisfaction Index with Donut Ring */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Satisfaction Index
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">94.2%</span>
              <span className="text-xs text-muted-foreground font-semibold">score</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary pt-0.5">
              <span className="text-primary">★ Optimal</span>
              <span className="text-muted-foreground font-normal">visitor feedback</span>
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
      </div>

      {/* ── 3. Main Dispersal Trend Trajectory Chart (Area Chart) ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-muted text-primary">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-heading text-lg font-black text-foreground">
                Visitor Dispersal Trajectory (2026)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Footfall strain reduction on saturated hotspots vs. regenerative absorption by alternative eco-destinations.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="size-2.5 rounded-full bg-chart-1" />
              <span>Saturated Hubs (Ella, Sigiriya)</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="size-2.5 rounded-full bg-chart-2" />
              <span>Eco-Destinations (Belihuloya, Meemure)</span>
            </div>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dispersalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHotspots" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorEco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  domain={[0, 100]}
                  unit="%"
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
                <Area
                  type="monotone"
                  dataKey="saturatedHubs"
                  name="Saturated Hubs Footfall"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorHotspots)"
                />
                <Area
                  type="monotone"
                  dataKey="ecoAlternatives"
                  name="Eco-Alternative Inflow"
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEco)"
                />
                <Line
                  type="monotone"
                  dataKey="capacityThreshold"
                  name="Max Safe Carrying Capacity"
                  stroke="var(--destructive)"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-muted/40 border border-border">
            <TrendingDown className="w-4 h-4 text-primary shrink-0" />
            <span><strong className="text-foreground">-30.8%</strong> Peak congestion reduction</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-muted/40 border border-border">
            <TrendingUp className="w-4 h-4 text-primary shrink-0" />
            <span><strong className="text-foreground">+43.0%</strong> Rural dispersal absorption</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-muted/40 border border-border">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span><strong className="text-foreground">Zero</strong> capacity violations in {timeframe}</span>
          </div>
        </div>
      </div>

      {/* ── 4. Mid Row: Destination Carrying Capacity Bar Chart + Categories Donut ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 Cols): Pre vs Post Footfall Bar Chart */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-muted text-primary">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-heading text-lg font-black text-foreground">
                  Baseline vs. Optimized Carrying Capacity
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pre-AI visitor overload vs. Post-AI balanced load across monitored destinations.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-foreground">
                <span className="size-2.5 rounded-full bg-chart-1" /> Pre-AI
              </span>
              <span className="flex items-center gap-1.5 text-foreground">
                <span className="size-2.5 rounded-full bg-chart-2" /> Optimized
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destinationComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
                  <XAxis
                    dataKey="destination"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    domain={[0, 100]}
                    unit="%"
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
                    dataKey="baseline"
                    name="Pre-AI Footfall %"
                    fill="var(--chart-1)"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="current"
                    name="Optimized Footfall %"
                    fill="var(--chart-2)"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between text-xs">
            <span className="font-bold text-primary uppercase tracking-wider text-[11px]">Capacity Safe:</span>
            <span className="font-medium text-foreground">
              Belihuloya and Haputale safely absorbed 52% &amp; 56% load without exceeding 75% ecological bounds.
            </span>
          </div>
        </div>

        {/* Right (4 Cols): Traveler Dispersal Category Donut Chart */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-muted text-primary">
                <PieIcon className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-heading text-lg font-black text-foreground">
                Dispersal Share
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Category allocation of travelers guided into regenerative activities.
            </p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      color: 'var(--popover-foreground)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 24px color-mix(in srgb,var(--shadow-color) 8%,transparent)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Center Label in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="font-heading text-2xl font-black text-foreground">3,840</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Dispersed</span>
            </div>
          </div>

          {/* Legend Table */}
          <div className="space-y-1.5 pt-3 border-t border-border">
            {categoryShareData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground font-medium truncate max-w-[180px]">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Environmental Offset & Rural Revenue Composed Chart ─────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-muted text-primary">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-heading text-lg font-black text-foreground">
                Carbon Offset Avoided vs. Rural Economic Inflow
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dual-metric correlation: Metric tonnes of CO2 saved (Bars) and direct LKR Millions injected into rural villages (Line).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="size-2.5 rounded-full bg-chart-2" />
              <span>CO2 Avoided (Tonnes)</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="size-2.5 rounded-full bg-chart-1" />
              <span>Rural Revenue (LKR Millions)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={impactTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  unit=" T"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  unit="M"
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
                  yAxisId="left"
                  dataKey="co2Saved"
                  name="CO2 Saved (Tonnes)"
                  fill="var(--chart-2)"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenueM"
                  name="Rural Revenue (LKR M)"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--chart-1)' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── 6. Dispersal Corridor Matrix ────────────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl border border-border bg-card shadow-dashboard-card space-y-4">
        <div>
          <h2 className="font-heading text-lg font-black text-foreground">
            Active Travel Dispersal Corridors
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Measured pressure relief on saturated hubs and direct economic benefit in receiving eco-destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Corridor 1 */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3 hover:border-primary/50 transition-colors shadow-dashboard-panel">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-foreground">Central Highlands Corridor</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                OPTIMAL
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-primary font-semibold">Ella Hub Relief:</span>
                <span className="font-mono font-bold text-primary">-32% footfall strain</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-semibold">Belihuloya Absorption:</span>
                <span className="font-mono font-bold text-secondary">+18% eco-stays</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-semibold">Haputale Absorption:</span>
                <span className="font-mono font-bold text-secondary">+14% trail visits</span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-border text-[11px] text-muted-foreground font-medium">
              Estimated 1,420 tourists diverted per week. Zero trail over-capacity incidents logged.
            </div>
          </div>

          {/* Corridor 2 */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3 hover:border-primary/50 transition-colors shadow-dashboard-panel">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-foreground">Cultural Triangle Corridor</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                OPTIMAL
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-primary font-semibold">Sigiriya Rock Relief:</span>
                <span className="font-mono font-bold text-primary">-24% peak queue</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-semibold">Pidurangala Dispersal:</span>
                <span className="font-mono font-bold text-secondary">+16% sunrise share</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-semibold">Ritigala Monastery:</span>
                <span className="font-mono font-bold text-secondary">+8% conscious visits</span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-border text-[11px] text-muted-foreground font-medium">
              Estimated 880 tourists diverted per week. Staircase queue wait reduced by 35 minutes.
            </div>
          </div>

          {/* Corridor 3 */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3 hover:border-primary/50 transition-colors shadow-dashboard-panel">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-foreground">Southern Coastline Corridor</span>
              <Badge variant="secondary" className="bg-secondary/15 text-secondary border-secondary/30 text-[10px] font-bold">
                EXPANDING
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-primary font-semibold">Mirissa Whale Relief:</span>
                <span className="font-mono font-bold text-primary">-19% boat density</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-semibold">Kite Kalpitiya Influx:</span>
                <span className="font-mono font-bold text-secondary">+12% eco-watersports</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-semibold">Tangalle Marine Sanctuaries:</span>
                <span className="font-mono font-bold text-secondary">+7% turtle conservation</span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-border text-[11px] text-muted-foreground font-medium">
              Estimated 610 tourists diverted per week. Marine wildlife disturbance score reduced by 22%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
