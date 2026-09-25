'use client';

import { useState } from 'react';
import {
  Leaf,
  DollarSign,
  Users,
  Download,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Layers,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

// CSS variables update chart series immediately when the theme changes.
const chartColors = {
  primarySeries: 'var(--chart-1)',
  secondarySeries: 'var(--chart-2)',
  accentSeries: 'var(--chart-3)',
  neutralSeries: 'var(--chart-4)',
  thresholdStroke: 'var(--destructive)',
};

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

// Custom Chart Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color?: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-3 shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-bold text-foreground">{label}</p>
        {payload.map((item, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color || chartColors.secondarySeries }}
              />
              <span className="text-muted-foreground">{item.name}:</span>
            </div>
            <span className="font-mono font-bold text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsPage() {
  const [exported, setExported] = useState(false);
  const [timeframe, setTimeframe] = useState<'30D' | 'Q3' | 'YTD'>('Q3');

  const categoryShareData = [
    { name: 'Eco-Trekking & Waterfalls', value: 38, color: chartColors.secondarySeries },
    { name: 'Heritage & Ancient Sanctuaries', value: 27, color: chartColors.primarySeries },
    { name: 'Rural Agro & Homestays', value: 21, color: chartColors.accentSeries },
    { name: 'Marine & Coast Sanctuaries', value: 14, color: chartColors.neutralSeries },
  ];

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <p className="text-xs sm:text-sm text-muted-foreground">
            Interactive charts, visitor dispersal trajectories, and carbon offset audits from AI visitor routing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Timeframe Filter */}
          <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border text-xs font-medium">
            {(['30D', 'Q3', 'YTD'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-bold ${
                  timeframe === t
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
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
            className="rounded-xl gap-1.5 cursor-pointer bg-card border-border hover:border-primary/40"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>{exported ? 'Report Downloaded!' : 'Export Dossier'}</span>
          </Button>
        </div>
      </div>

      {exported && (
        <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center gap-2 text-xs text-foreground">
          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
          <span className="font-semibold">
            Tourism Authority Sustainable Redistribution Report (Q3 2026) exported successfully.
          </span>
        </div>
      )}

      {/* Top 4 Macro Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border border-secondary/30 bg-card hover:border-secondary/60 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Carbon Footprint Avoided
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-heading text-3xl font-bold text-secondary">
                14.8 T
              </span>
              <div className="p-2.5 rounded-2xl bg-secondary/15 text-secondary">
                <Leaf className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-secondary font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +22% vs last quarter
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-primary/20 bg-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Travelers Dispersed
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-heading text-3xl font-bold text-foreground">
                3,840
              </span>
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-primary font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> Redirected to rural sites
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card hover:border-secondary/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Rural Community Revenue
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-heading text-3xl font-bold text-foreground">
                LKR 24.6M
              </span>
              <div className="p-2.5 rounded-2xl bg-secondary/15 text-secondary">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-secondary font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> Homestays &amp; local guides
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Conscious Traveler Index
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-heading text-3xl font-bold text-foreground">
                94.2%
              </span>
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
              Positive trip satisfaction
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Main Dispersal Trend Chart (Area Chart) */}
      <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-foreground">
                Visitor Dispersal Trajectory (2026)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Footfall strain reduction on saturated hotspots vs. regenerative absorption by alternative eco-destinations.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.primarySeries }} />
              <span className="text-muted-foreground">Saturated Hubs (Ella, Sigiriya)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.secondarySeries }} />
              <span className="text-muted-foreground">Eco-Destinations (Belihuloya, Meemure)</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dispersalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEco" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.secondarySeries} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColors.secondarySeries} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHotspots" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.primarySeries} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColors.primarySeries} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="currentColor" strokeOpacity={0.5} fontSize={12} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} stroke="currentColor" strokeOpacity={0.5} fontSize={12} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="saturatedHubs"
                name="Saturated Hubs Footfall"
                stroke={chartColors.primarySeries}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorHotspots)"
              />
              <Area
                type="monotone"
                dataKey="ecoAlternatives"
                name="Eco-Alternative Inflow"
                stroke={chartColors.secondarySeries}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEco)"
              />
              <Line
                type="monotone"
                dataKey="capacityThreshold"
                name="Max Safe Carrying Capacity"
                stroke={chartColors.thresholdStroke}
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/70 text-xs">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-secondary shrink-0" />
            <span><strong>-30.8%</strong> Saturated Hub peak congestion reduction</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary shrink-0" />
            <span><strong>+43.0%</strong> Rural dispersal absorption rate</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
            <span><strong>Zero</strong> carrying capacity violations in Q3</span>
          </div>
        </div>
      </Card>

      {/* Row 2: Destination Load Comparison & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 Cols): Pre vs Post Footfall Bar Chart */}
        <Card className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-foreground">
                  Baseline vs. Optimized Carrying Capacity
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pre-AI visitor overload vs. Post-AI balanced load across monitored destinations.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: chartColors.primarySeries }} /> Pre-AI
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: chartColors.secondarySeries }} /> Optimized
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="destination" tickLine={false} axisLine={false} stroke="currentColor" strokeOpacity={0.5} fontSize={12} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} stroke="currentColor" strokeOpacity={0.5} fontSize={12} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="baseline" name="Pre-AI Footfall %" fill={chartColors.primarySeries} radius={[6, 6, 0, 0]} />
                <Bar dataKey="current" name="Optimized Footfall %" fill={chartColors.secondarySeries} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Highlight:</span>
            <span className="font-semibold text-foreground">
              Belihuloya and Haputale safely absorbed 52% &amp; 56% load without exceeding 75% ecological bounds.
            </span>
          </div>
        </Card>

        {/* Right (5 Cols): Traveler Dispersal Category Donut Chart */}
        <Card className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-secondary/15 text-secondary">
                <PieIcon className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-foreground">
                Dispersal Share by Experience Type
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Category allocation of travelers guided into regenerative activities.
            </p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl font-bold text-foreground">3,840</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Dispersed</span>
            </div>
          </div>

          {/* Legend Table */}
          <div className="space-y-1.5 pt-2 border-t border-border/70">
            {categoryShareData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground truncate max-w-[200px]">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Environmental Offset & Rural Revenue Composed Chart */}
      <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-foreground">
                Carbon Offset Avoided vs. Rural Economic Inflow
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dual-metric correlation: Metric tonnes of CO2 saved (Bars) and direct LKR Millions injected into rural villages (Line).
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.secondarySeries }} />
              <span className="text-muted-foreground">CO2 Avoided (Tonnes)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: chartColors.primarySeries }} />
              <span className="text-muted-foreground">Rural Revenue (LKR Millions)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={impactTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="currentColor" strokeOpacity={0.5} fontSize={12} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} stroke="currentColor" strokeOpacity={0.5} fontSize={12} unit=" T" />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} stroke="currentColor" strokeOpacity={0.5} fontSize={12} unit="M" />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="co2Saved" name="CO2 Saved (Tonnes)" fill={chartColors.secondarySeries} radius={[6, 6, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenueM" name="Rural Revenue (LKR M)" stroke={chartColors.primarySeries} strokeWidth={3} dot={{ r: 4, fill: chartColors.primarySeries }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Dispersal Corridor Matrix */}
      <Card className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground">Active Travel Dispersal Corridors</h2>
          <p className="text-xs text-muted-foreground">
            Measured pressure relief on saturated hubs and direct economic benefit in receiving eco-destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Corridor 1 */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3 hover:border-secondary/50 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Central Highlands Corridor</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">OPTIMAL</Badge>
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
            <div className="pt-2 border-t border-border/70 text-[11px] text-muted-foreground">
              Estimated 1,420 tourists diverted per week. Zero trail over-capacity incidents logged.
            </div>
          </div>

          {/* Corridor 2 */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3 hover:border-secondary/50 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Cultural Triangle Corridor</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">OPTIMAL</Badge>
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
            <div className="pt-2 border-t border-border/70 text-[11px] text-muted-foreground">
              Estimated 880 tourists diverted per week. Staircase queue wait reduced by 35 minutes.
            </div>
          </div>

          {/* Corridor 3 */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3 hover:border-secondary/50 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Southern Coastline Corridor</span>
              <Badge variant="secondary" className="bg-secondary/15 text-secondary border-secondary/30 text-[10px] font-bold">EXPANDING</Badge>
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
            <div className="pt-2 border-t border-border/70 text-[11px] text-muted-foreground">
              Estimated 610 tourists diverted per week. Marine wildlife disturbance score reduced by 22%.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
