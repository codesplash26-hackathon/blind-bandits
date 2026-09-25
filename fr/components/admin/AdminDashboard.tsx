'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  MapPin,
  TrendingUp,
  Compass,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  SlidersHorizontal,
  RefreshCw,
  Send,
  Layers,
  Sparkles,
  Search,
  Filter,
  Eye,
  Activity,
  ArrowUpRight,
  Radio,
} from 'lucide-react';
import { DESTINATIONS } from '@/lib/mockData';
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
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { loginAs } = useAuth();
  const [isRedistributing, setIsRedistributing] = useState(false);
  const [redistributeStatus, setRedistributeStatus] = useState<string | null>(null);
  const [pressureFilter, setPressureFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [rebalanceStep, setRebalanceStep] = useState<string>('');

  const highPressureList = DESTINATIONS.filter((d) => d.pressure.level === 'HIGH');
  const mediumPressureList = DESTINATIONS.filter((d) => d.pressure.level === 'MEDIUM');
  const lowPressureList = DESTINATIONS.filter((d) => d.pressure.level === 'LOW');

  const filteredDestinations = DESTINATIONS.filter((d) => {
    const matchesFilter =
      pressureFilter === 'ALL' ? true : d.pressure.level === pressureFilter;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => b.pressure.score - a.pressure.score);

  const handleTriggerRedistribution = () => {
    setIsRedistributing(true);
    setRebalanceStep('Analyzing real-time sensor surge vectors...');
    
    setTimeout(() => {
      setRebalanceStep('Broadcasting +35% alternative weight to TreeSHAP routing...');
    }, 450);

    setTimeout(() => {
      setIsRedistributing(false);
      setRebalanceStep('');
      setRedistributeStatus(
        'Redistribution Deployed: Dynamic bias increased by +35% for Belihuloya & Haputale alternatives. Ella footfall dropped by -22%.'
      );
    }, 1100);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Tourism Authority Oversight
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              TreeSHAP Live Model Telemetry
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Tourism Authority Oversight Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            Live visitor carrying capacity monitoring, overtourism warnings, and sustainable redistribution metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerRedistribution}
            disabled={isRedistributing}
            className="rounded-xl gap-2 cursor-pointer bg-card border-primary/30 text-primary hover:bg-primary/10 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-secondary ${isRedistributing ? 'animate-spin' : ''}`} />
            <span>{isRedistributing ? rebalanceStep || 'Broadcasting...' : 'Trigger Rebalance'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loginAs('TOURIST')}
            className="rounded-xl gap-1.5 cursor-pointer bg-card border-border hover:border-secondary/40"
          >
            <Compass className="w-4 h-4 text-primary" />
            <span>Switch to Tourist View</span>
          </Button>
        </div>
      </div>

      {redistributeStatus && (
        <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-between gap-3 text-xs text-foreground animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
            <span className="font-semibold">{redistributeStatus}</span>
          </div>
          <button
            type="button"
            onClick={() => setRedistributeStatus(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Monitored Pilot Sites
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="font-heading text-3xl font-black text-foreground tracking-tight">
              {DESTINATIONS.length}
            </span>
            <div className="p-2.5 rounded-2xl bg-muted text-primary">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium block">Island-wide sensor coverage</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Low Pressure Sites
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="font-heading text-3xl font-black text-foreground tracking-tight">
              {lowPressureList.length}
            </span>
            <div className="p-2.5 rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-success font-semibold block">Within safe carrying capacity</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Moderate Pressure
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="font-heading text-3xl font-black text-foreground tracking-tight">
              {mediumPressureList.length}
            </span>
            <div className="p-2.5 rounded-2xl bg-warning/10 text-warning">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium block">Seasonal footfall peak watch</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            High Pressure Alerts
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="font-heading text-3xl font-black text-foreground tracking-tight">
              {highPressureList.length}
            </span>
            <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-destructive font-semibold block">Carrying capacity threshold exceeded</span>
        </div>
      </div>

      {/* Quick Access Authority Modules Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/admin/destinations" className="group">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-dashboard-panel hover:shadow-dashboard-card hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted text-primary group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-xs font-black text-foreground block">Registry &amp; Limits</span>
                <span className="text-[10px] text-muted-foreground">Manage carrying capacity</span>
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
                <span className="text-xs font-black text-foreground block">Pressure Simulator</span>
                <span className="text-[10px] text-muted-foreground">TreeSHAP factor audit</span>
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
                <span className="text-xs font-black text-foreground block">Impact Analytics</span>
                <span className="text-[10px] text-muted-foreground">Charts, dispersal &amp; carbon</span>
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
                <span className="text-xs font-black text-foreground block">Policy Thresholds</span>
                <span className="text-[10px] text-muted-foreground">Live algorithm simulator</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Live Redistribution Flow Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-dashboard-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted border border-border text-primary shadow-2xs">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-black text-foreground">
                Active AI Tourist Redistribution Flow
              </h2>
              <p className="text-xs text-muted-foreground">
                Algorithm dynamically steers conscious travelers away from over-saturated hotspots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Badge variant="success">ACTIVE REDIRECTION</Badge>
            <span className="text-xs font-mono font-bold text-foreground">~1,420 diverted/week</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-background border border-border shadow-dashboard-panel space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-destructive">Bottleneck Origin</span>
              <Badge variant="destructive">82% Load</Badge>
            </div>
            <p className="font-heading text-base font-black text-foreground">Ella (Badulla)</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Water stress index 78/100, local trail congestion peaking at 142% capacity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background border border-border shadow-dashboard-panel space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-primary">Redistribution Vectors</span>
              <Send className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="font-heading text-base font-black text-foreground">Haputale &amp; Belihuloya</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              34% &amp; 28% load, matching hiking and scenic tea country preferences with minimal footprint.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background border border-border shadow-dashboard-panel space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-success">Net Eco-Impact</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="font-heading text-base font-black text-foreground">-28% Strain on Ella</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              +LKR 4.2M distributed to rural eco-homestays in Belihuloya and Haputale this month.
            </p>
          </div>
        </div>
      </div>

      {/* Highest Pressure Destinations Table with Interactive Filtering */}
      <div className="rounded-3xl border border-border bg-card shadow-dashboard-card overflow-hidden space-y-4">
        <div className="p-6 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="font-heading text-lg font-black text-foreground">
                Pilot Destinations Carrying Capacity Audit
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time ecological carrying capacity status across Sri Lanka pilot monitoring nodes.
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
                  {lvl === 'ALL' ? 'All (10)' : `${lvl} (${DESTINATIONS.filter((d) => d.pressure.level === lvl).length})`}
                </button>
              ))}
            </div>

            <Link href="/admin/destinations">
              <Button size="xs" variant="outline" className="rounded-xl gap-1">
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
                <TableHead className="py-3 px-3">District</TableHead>
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
                        {dest.tagline}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-muted-foreground text-xs">{dest.district}</TableCell>
                  <TableCell className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs">{dest.pressure.score}%</span>
                      <Badge
                        variant={
                          dest.pressure.level === 'HIGH'
                            ? 'destructive'
                            : dest.pressure.level === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {dest.pressure.level}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            dest.pressure.level === 'HIGH'
                              ? 'bg-destructive'
                              : dest.pressure.level === 'MEDIUM'
                              ? 'bg-primary'
                              : 'bg-secondary'
                          }`}
                          style={{ width: `${dest.pressure.score}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 font-bold text-secondary text-xs">
                    {dest.sustainability.overall} / 100
                  </TableCell>
                  <TableCell className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      Live (5m)
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right">
                    <Link href={`/destinations/${dest.id}`}>
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
