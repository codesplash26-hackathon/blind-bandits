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

  const highPressureList = DESTINATIONS.filter((d) => d.pressure.level === 'HIGH');
  const mediumPressureList = DESTINATIONS.filter((d) => d.pressure.level === 'MEDIUM');
  const lowPressureList = DESTINATIONS.filter((d) => d.pressure.level === 'LOW');

  const handleTriggerRedistribution = () => {
    setIsRedistributing(true);
    setTimeout(() => {
      setIsRedistributing(false);
      setRedistributeStatus('Active: Dynamic routing bias increased by +35% for Ella & Sigiriya alternatives.');
    }, 900);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 font-bold">Tourism Authority Mode</Badge>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> TreeSHAP Model Live
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Tourism Authority Oversight Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Live visitor carrying capacity monitoring, overtourism warnings, and sustainable redistribution metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerRedistribution}
            disabled={isRedistributing}
            className="rounded-xl gap-1.5 cursor-pointer bg-card border-primary/30 text-primary hover:bg-primary/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRedistributing ? 'animate-spin' : ''}`} />
            <span>{isRedistributing ? 'Broadcasting Policy...' : 'Trigger Rebalance'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loginAs('TOURIST')}
            className="rounded-xl gap-1.5 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-primary" />
            <span>Switch to Tourist View</span>
          </Button>
        </div>
      </div>

      {redistributeStatus && (
        <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-between gap-3 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
            <span className="font-semibold">{redistributeStatus}</span>
          </div>
          <button
            type="button"
            onClick={() => setRedistributeStatus(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer font-bold"
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
          <Card className="p-4 rounded-2xl border border-border/80 hover:border-primary/50 transition-all hover:shadow-md">
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
          <Card className="p-4 rounded-2xl border border-border/80 hover:border-secondary/50 transition-all hover:shadow-md">
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
          <Card className="p-4 rounded-2xl border border-border/80 hover:border-primary/50 transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Impact Analytics</span>
                <span className="text-[10px] text-muted-foreground">Carbon &amp; dispersal metrics</span>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/settings" className="group">
          <Card className="p-4 rounded-2xl border border-border/80 hover:border-secondary/50 transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary/15 text-secondary group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Policy Thresholds</span>
                <span className="text-[10px] text-muted-foreground">Model trigger bounds</span>
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

      {/* Highest Pressure Destinations Table */}
      <Card className="rounded-3xl border border-border/80 shadow-sm overflow-hidden">
        <div className="p-6 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Pilot Destinations Carrying Capacity Audit</h2>
            <p className="text-xs text-muted-foreground">Ranked by monitored environmental & visitor load strain</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/destinations">
              <Button size="xs" variant="outline" className="rounded-lg gap-1">
                <span>View Full Registry</span>
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
                <TableHead className="py-3 px-3">Confidence</TableHead>
                <TableHead className="py-3 px-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DESTINATIONS.slice()
                .sort((a, b) => b.pressure.score - a.pressure.score)
                .map((dest) => (
                  <TableRow key={dest.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="py-3.5 px-3 font-bold text-foreground">
                      <div>
                        <span>{dest.name}</span>
                        <span className="text-[10px] text-muted-foreground block font-normal">{dest.tagline}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-muted-foreground">{dest.district}</TableCell>
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
                            className={`h-full rounded-full transition-all ${
                              dest.pressure.level === 'HIGH'
                                ? 'bg-rose-500'
                                : dest.pressure.level === 'MEDIUM'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${dest.pressure.score}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {dest.sustainability.overall} / 100
                    </TableCell>
                    <TableCell className="py-3.5 px-3">
                      <Badge variant="outline">{dest.dataConfidence || 'HIGH'}</Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right">
                      <Link href={`/destinations/${dest.id}`}>
                        <Button size="xs" variant="outline" className="rounded-lg">
                          Inspect
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
