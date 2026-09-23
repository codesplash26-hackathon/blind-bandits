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
import { Card, CardContent } from '@/components/ui/card';
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
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 font-bold">
              Tourism Authority Mode
            </Badge>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              TreeSHAP Model Live Telemetry
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Tourism Authority Oversight Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
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
        <Card className="rounded-3xl border border-border/80 bg-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Monitored Pilot Sites
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-heading text-3xl font-bold text-foreground">
                {DESTINATIONS.length}
              </span>
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground">Island-wide sensor coverage</span>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-secondary/30 bg-card hover:border-secondary/60 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Low Pressure Sites
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-heading text-3xl font-bold text-secondary">
                {lowPressureList.length}
              </span>
              <div className="p-2.5 rounded-2xl bg-secondary/15 text-secondary">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-secondary font-medium">Within safe carrying capacity</span>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card hover:border-secondary/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Moderate Pressure
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-heading text-3xl font-bold text-foreground">
                {mediumPressureList.length}
              </span>
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Seasonal footfall peak watch</span>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-destructive/25 bg-card hover:border-destructive/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              High Pressure Alerts
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-heading text-3xl font-bold text-destructive">
                {highPressureList.length}
              </span>
              <div className="p-2.5 rounded-2xl bg-destructive/15 text-destructive">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-destructive font-medium">Carrying capacity threshold exceeded</span>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Authority Modules Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/admin/destinations" className="group">
          <Card className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Registry &amp; Limits</span>
                <span className="text-[10px] text-muted-foreground">Manage carrying capacity</span>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/tourism-pressure" className="group">
          <Card className="p-4 rounded-2xl border border-border/80 bg-card hover:border-secondary/50 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary/15 text-secondary group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Pressure Simulator</span>
                <span className="text-[10px] text-muted-foreground">TreeSHAP factor audit</span>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/analytics" className="group">
          <Card className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Impact Analytics</span>
                <span className="text-[10px] text-muted-foreground">Charts, dispersal &amp; carbon</span>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/settings" className="group">
          <Card className="p-4 rounded-2xl border border-border/80 bg-card hover:border-secondary/50 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary/15 text-secondary group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Policy Thresholds</span>
                <span className="text-[10px] text-muted-foreground">Live algorithm simulator</span>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Live Redistribution Flow Card */}
      <Card className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Active AI Tourist Redistribution Flow
              </h3>
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
          <div className="p-4 rounded-2xl bg-card border border-destructive/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-destructive">Bottleneck Origin</span>
              <Badge variant="destructive">82% Load</Badge>
            </div>
            <p className="font-heading text-lg font-bold text-foreground">Ella (Badulla)</p>
            <p className="text-[11px] text-muted-foreground">
              Water stress index 78/100, local trail congestion peaking at 142% capacity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-secondary/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-secondary">Redistribution Vectors</span>
              <Send className="w-3.5 h-3.5 text-secondary" />
            </div>
            <p className="font-heading text-lg font-bold text-foreground">Haputale &amp; Belihuloya</p>
            <p className="text-[11px] text-muted-foreground">
              34% &amp; 28% load, matching hiking and scenic tea country preferences with minimal footprint.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-secondary/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-secondary">Net Eco-Impact</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
            </div>
            <p className="font-heading text-lg font-bold text-foreground">-28% Strain on Ella</p>
            <p className="text-[11px] text-muted-foreground">
              +LKR 4.2M distributed to rural eco-homestays in Belihuloya and Haputale this month.
            </p>
          </div>
        </div>
      </Card>

      {/* Highest Pressure Destinations Table with Interactive Filtering */}
      <Card className="rounded-3xl border border-border/80 bg-card shadow-xs overflow-hidden space-y-4">
        <div className="p-6 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
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
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border text-xs font-semibold">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPressureFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    pressureFilter === lvl
                      ? 'bg-card text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
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
      </Card>
    </div>
  );
}
