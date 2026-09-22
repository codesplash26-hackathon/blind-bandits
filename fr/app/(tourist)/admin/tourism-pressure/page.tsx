'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  TrendingUp,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';
import { DESTINATIONS } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminTourismPressurePage() {
  const [surgeModifier, setSurgeModifier] = useState<number>(15); // +15% surge
  const [redistributionBias, setRedistributionBias] = useState<'LOW' | 'BALANCED' | 'AGGRESSIVE'>('BALANCED');

  // Compute simulated pressure
  const simulatedDestinations = DESTINATIONS.map((dest) => {
    let delta = surgeModifier * 0.7; // baseline surge impact
    if (redistributionBias === 'AGGRESSIVE') {
      if (dest.pressure.level === 'HIGH') {
        delta -= 18; // strong diversion away from Ella, Sigiriya
      } else if (dest.pressure.level === 'LOW') {
        delta += 8; // slight absorption into Belihuloya, Meemure
      }
    } else if (redistributionBias === 'BALANCED') {
      if (dest.pressure.level === 'HIGH') {
        delta -= 10;
      } else if (dest.pressure.level === 'LOW') {
        delta += 4;
      }
    }

    const newScore = Math.max(10, Math.min(98, Math.round(dest.pressure.score + delta)));
    const newLevel = newScore >= 70 ? 'HIGH' : newScore >= 40 ? 'MEDIUM' : 'LOW';

    return {
      ...dest,
      simulatedScore: newScore,
      simulatedLevel: newLevel,
      scoreDiff: newScore - dest.pressure.score,
    };
  });

  const highPressureCount = simulatedDestinations.filter((d) => d.simulatedLevel === 'HIGH').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Tourism Pressure Engine</Badge>
            <span className="text-xs font-mono text-muted-foreground">TreeSHAP Explainable AI</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Tourism Pressure & Carrying Capacity Simulator
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Audit TreeSHAP carrying capacity drivers and run predictive what-if scenarios on visitor surges.
          </p>
        </div>

        <Link href="/admin/analytics">
          <Button size="sm" variant="outline" className="rounded-xl gap-1.5 cursor-pointer">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>View Impact Analytics</span>
          </Button>
        </Link>
      </div>

      {/* Interactive Simulation Sandbox Card */}
      <Card className="rounded-3xl border border-primary/30 p-6 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">Interactive Capacity Stress Simulator</h2>
              <p className="text-xs text-muted-foreground">Simulate high-season visitor surges and test AI mitigation rules</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">High Pressure Sites:</span>
            <span className={`font-mono text-sm font-bold ${highPressureCount > 3 ? 'text-rose-600' : 'text-amber-600'}`}>
              {highPressureCount} of {DESTINATIONS.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Seasonal Surge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Peak Season National Influx:</span>
              <span className="font-mono font-bold text-primary text-sm">+{surgeModifier}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={surgeModifier}
              onChange={(e) => setSurgeModifier(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Standard (0%)</span>
              <span>Moderate (+25%)</span>
              <span>Extreme (+50%)</span>
            </div>
          </div>

          {/* Selector 2: AI Redistribution Bias */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">AI Redistribution Aggressiveness:</span>
              <span className="font-mono font-bold text-secondary text-sm">{redistributionBias}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'BALANCED', 'AGGRESSIVE'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRedistributionBias(mode)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    redistributionBias === mode
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {redistributionBias === 'AGGRESSIVE'
                ? 'Strongly suppresses over-capacity spots from tourist recommendations.'
                : redistributionBias === 'BALANCED'
                ? 'Standard weighted dispersal matching traveler preferences.'
                : 'Minimal intervention; relies strictly on organic tourist choices.'}
            </span>
          </div>
        </div>

        {/* Dynamic Simulation Outcome Callout */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>
              Under <strong className="text-foreground">+{surgeModifier}% surge</strong> and{' '}
              <strong className="text-foreground">{redistributionBias} policy</strong>, Ella carrying capacity stays at{' '}
              <strong className="text-foreground font-mono">
                {simulatedDestinations.find((d) => d.id === 'ella')?.simulatedScore}%
              </strong>{' '}
              (vs 82% unmitigated).
            </span>
          </div>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              setSurgeModifier(15);
              setRedistributionBias('BALANCED');
            }}
            className="rounded-lg shrink-0 gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </Button>
        </div>
      </Card>

      {/* Simulated Destination Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Destination Stress Projections</h2>
          <p className="text-xs text-muted-foreground">Compare baseline carrying capacity with simulated policy output</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {simulatedDestinations.map((dest) => (
            <Card
              key={dest.id}
              className={`p-5 rounded-3xl border transition-all ${
                dest.simulatedLevel === 'HIGH'
                  ? 'border-rose-500/40 bg-card shadow-xs'
                  : dest.simulatedLevel === 'MEDIUM'
                  ? 'border-amber-500/30 bg-card'
                  : 'border-emerald-500/30 bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">{dest.name}</h3>
                  <span className="text-[11px] text-muted-foreground">{dest.district} District</span>
                </div>
                <Badge
                  variant={
                    dest.simulatedLevel === 'HIGH'
                      ? 'destructive'
                      : dest.simulatedLevel === 'MEDIUM'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {dest.simulatedLevel}
                </Badge>
              </div>

              {/* Stress Score Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Projected Pressure</span>
                  <div className="flex items-center gap-1 font-mono font-bold">
                    <span className="text-foreground text-sm">{dest.simulatedScore}%</span>
                    <span
                      className={`text-[10px] ${
                        dest.scoreDiff > 0
                          ? 'text-rose-500'
                          : dest.scoreDiff < 0
                          ? 'text-emerald-500'
                          : 'text-muted-foreground'
                      }`}
                    >
                      ({dest.scoreDiff >= 0 ? `+${dest.scoreDiff}` : dest.scoreDiff}%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dest.simulatedLevel === 'HIGH'
                        ? 'bg-rose-500'
                        : dest.simulatedLevel === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${dest.simulatedScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Baseline: {dest.pressure.score}%</span>
                <Link href={`/destinations/${dest.id}`}>
                  <span className="text-primary hover:underline font-semibold flex items-center gap-0.5">
                    Inspect XAI <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
