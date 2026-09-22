'use client';

import React, { useState } from 'react';
import {
  Leaf,
  DollarSign,
  Users,
  Download,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminAnalyticsPage() {
  const [exported, setExported] = useState(false);

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
            <Badge variant="info">Authority Macro Analytics</Badge>
            <span className="text-xs font-mono text-muted-foreground">National Dispersal Audit 2026</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Redistribution & Ecological Impact Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Measurable environmental footprint reductions and community economic benefits from AI visitor routing.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          className="rounded-xl gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>{exported ? 'Report Downloaded!' : 'Export Impact Dossier'}</span>
        </Button>
      </div>

      {exported && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-semibold">
            Tourism Authority Sustainable Redistribution Report (Q3 2026) exported successfully.
          </span>
        </div>
      )}

      {/* Top 4 Macro Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border border-emerald-500/20 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Carbon Footprint Avoided
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                14.8 T
              </span>
              <Leaf className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +22% vs last quarter
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-primary/20 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Travelers Dispersed
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-3xl font-bold text-primary">
                3,840
              </span>
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-primary font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> Redirected to rural sites
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-secondary/20 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Rural Community Revenue
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-3xl font-bold text-foreground">
                LKR 24.6M
              </span>
              <DollarSign className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-secondary font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> Homestays & local guides
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Conscious Traveler Index
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-3xl font-bold text-foreground">
                94.2%
              </span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
              Positive trip satisfaction
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispersal Corridor Matrix */}
      <Card className="rounded-3xl border border-border/80 p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-foreground">Active Travel Dispersal Corridors</h2>
          <p className="text-xs text-muted-foreground">
            Measured pressure relief on saturated hubs and direct economic benefit in receiving eco-destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Corridor 1 */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Central Highlands Corridor</span>
              <Badge variant="success">OPTIMAL</Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Ella Hub Relief:</span>
                <span className="font-mono font-bold text-rose-600">-32% footfall strain</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Belihuloya Absorption:</span>
                <span className="font-mono font-bold text-emerald-600">+18% eco-stays</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Haputale Absorption:</span>
                <span className="font-mono font-bold text-emerald-600">+14% trail visits</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/70 text-[11px] text-muted-foreground">
              Estimated 1,420 tourists diverted per week. Zero trail over-capacity incidents logged.
            </div>
          </div>

          {/* Corridor 2 */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Cultural Triangle Corridor</span>
              <Badge variant="success">OPTIMAL</Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Sigiriya Rock Relief:</span>
                <span className="font-mono font-bold text-rose-600">-24% peak queue</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Pidurangala Dispersal:</span>
                <span className="font-mono font-bold text-emerald-600">+16% sunrise share</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ritigala Monastery:</span>
                <span className="font-mono font-bold text-emerald-600">+8% conscious visits</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/70 text-[11px] text-muted-foreground">
              Estimated 880 tourists diverted per week. Staircase queue wait reduced by 35 minutes.
            </div>
          </div>

          {/* Corridor 3 */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Southern Coastline Corridor</span>
              <Badge variant="warning">EXPANDING</Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Mirissa Whale Relief:</span>
                <span className="font-mono font-bold text-rose-600">-19% boat density</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Kite Kalpitiya Influx:</span>
                <span className="font-mono font-bold text-emerald-600">+12% eco-watersports</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tangalle Marine Sanctuaries:</span>
                <span className="font-mono font-bold text-emerald-600">+7% turtle conservation</span>
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
