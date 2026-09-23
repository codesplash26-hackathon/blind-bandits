'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Database,
  Save,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  Leaf,
  Users,
  DollarSign,
  Activity,
  RefreshCw,
  Zap,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const [warningThreshold, setWarningThreshold] = useState<number>(75);
  const [diversionBias, setDiversionBias] = useState<number>(35);
  const [ecoWeight, setEcoWeight] = useState<number>(50);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [isSimulatingSync, setIsSimulatingSync] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('balanced');

  // Sensor Feed States
  const [sensorFeeds, setSensorFeeds] = useState([
    {
      id: 'cea',
      name: 'Central Environmental Authority (CEA) Sensors',
      desc: 'River turbidity, waste collection logs, and noise monitors',
      status: 'ONLINE',
      latency: '24ms',
      rate: '142 pkts/min',
      active: true,
    },
    {
      id: 'dwc',
      name: 'Wildlife Conservation (DWC) Trail Gate Telemetry',
      desc: 'Horton Plains, Yala, and Knuckles entry ticketing feed',
      status: 'ONLINE',
      latency: '38ms',
      rate: '88 pkts/min',
      active: true,
    },
    {
      id: 'met',
      name: 'Department of Meteorology Weather & Monsoon Radar',
      desc: 'Rainfall intensity and landslide risk warning layers',
      status: 'ONLINE',
      latency: '62ms',
      rate: '24 pkts/min',
      active: true,
    },
    {
      id: 'gsm',
      name: 'Cellular Tower Density & Transit Mesh',
      desc: 'Anonymized footfall crowd surges across high-density junctions',
      status: 'ONLINE',
      latency: '18ms',
      rate: '310 pkts/min',
      active: true,
    },
  ]);

  // Derived real-time impact calculations from sliders
  const projectedReliefRate = Math.min(
    95,
    Math.round(diversionBias * 0.75 + (100 - warningThreshold) * 0.4)
  );
  const projectedDispersedDaily = Math.round(diversionBias * 42 + ecoWeight * 16);
  const projectedMonthlyRevenue = (
    (diversionBias * 0.36 + ecoWeight * 0.18) *
    0.95
  ).toFixed(1);

  const applyPreset = (preset: 'strict' | 'balanced' | 'relaxed') => {
    setActivePreset(preset);
    if (preset === 'strict') {
      setWarningThreshold(65);
      setDiversionBias(55);
      setEcoWeight(75);
    } else if (preset === 'balanced') {
      setWarningThreshold(75);
      setDiversionBias(35);
      setEcoWeight(50);
    } else if (preset === 'relaxed') {
      setWarningThreshold(85);
      setDiversionBias(20);
      setEcoWeight(30);
    }
  };

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3500);
  };

  const handleTestPing = (feedId: string) => {
    setIsSimulatingSync(feedId);
    setTimeout(() => {
      setIsSimulatingSync(null);
    }, 1200);
  };

  const toggleFeed = (feedId: string) => {
    setSensorFeeds((prev) =>
      prev.map((f) => (f.id === feedId ? { ...f, active: !f.active } : f))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 font-bold">
              System Policy Engine
            </Badge>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              TreeSHAP Model v3.2 Active
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Sustainability &amp; Algorithm Policy Console
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure carrying capacity thresholds, real-time routing biases, and external sensor data pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={handleSave}
            className="rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Save className="w-4 h-4 text-secondary" />
            <span>Deploy Policy Updates</span>
          </Button>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-between text-xs text-foreground animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
            <span className="font-semibold">
              Authority policy updated and synced across all traveler recommendation endpoints.
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">ACK: 200 OK</span>
        </div>
      )}

      {/* Policy Presets Switcher */}
      <Card className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-secondary" />
              Quick Policy Archetypes
            </span>
            <p className="text-[11px] text-muted-foreground">
              Select an established operational preset or fine-tune parameters below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset('strict')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activePreset === 'strict'
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-muted/50 text-muted-foreground border-border/70 hover:text-foreground'
              }`}
            >
              Eco-Dominant (Strict)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('balanced')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activePreset === 'balanced'
                  ? 'bg-secondary text-white border-secondary shadow-xs'
                  : 'bg-muted/50 text-muted-foreground border-border/70 hover:text-foreground'
              }`}
            >
              Balanced Redistribution (Recommended)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('relaxed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activePreset === 'relaxed'
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-muted/50 text-muted-foreground border-border/70 hover:text-foreground'
              }`}
            >
              High-Mobility Peak Surge
            </button>
          </div>
        </div>
      </Card>

      {/* Main Grid: Sliders on Left (7 cols), Live Impact Simulator on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders */}
        <Card className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Recommendation Algorithm Calibration
              </h2>
              <p className="text-xs text-muted-foreground">
                TreeSHAP multi-factor weights governing tourist destination rerouting.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Slider 1: Warning Threshold */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Critical Carrying Capacity Alert Threshold</span>
                <span className="font-mono font-bold text-destructive px-2 py-0.5 rounded-md bg-destructive/10 text-xs">
                  {warningThreshold}% Footfall Limit
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                step="5"
                value={warningThreshold}
                onChange={(e) => {
                  setWarningThreshold(Number(e.target.value));
                  setActivePreset('custom');
                }}
                className="w-full accent-destructive cursor-pointer h-2 bg-muted rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Conservative (60%)</span>
                <span>Standard (75%)</span>
                <span>High Tolerance (90%)</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Destinations exceeding this threshold trigger automated overtourism warnings and immediate diversion vectors.
              </p>
            </div>

            {/* Slider 2: Diversion Bias */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Alternative Redistribution Routing Bias</span>
                <span className="font-mono font-bold text-secondary px-2 py-0.5 rounded-md bg-secondary/15 text-xs">
                  +{diversionBias}% Steering Bias
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={diversionBias}
                onChange={(e) => {
                  setDiversionBias(Number(e.target.value));
                  setActivePreset('custom');
                }}
                className="w-full accent-secondary cursor-pointer h-2 bg-muted rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Gentle (+10%)</span>
                <span>Balanced (+35%)</span>
                <span>Aggressive (+60%)</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Determines how aggressively conscious travelers are rerouted away from Ella and Sigiriya to Belihuloya and Haputale.
              </p>
            </div>

            {/* Slider 3: Eco Weight in Matching */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Sustainability Score Weight in Ranking</span>
                <span className="font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 text-xs">
                  {ecoWeight}% Eco-Priority
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={ecoWeight}
                onChange={(e) => {
                  setEcoWeight(Number(e.target.value));
                  setActivePreset('custom');
                }}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Preference Dominant (20%)</span>
                <span>Balanced (50%)</span>
                <span>Eco-First (80%)</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Higher ratio favors rural stewardship, low-emissions transit, and eco-homestays in traveler match scores.
              </p>
            </div>
          </div>
        </Card>

        {/* Right Column: Real-Time Policy Impact Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-3xl border border-secondary/30 bg-gradient-to-br from-card via-card to-secondary/5 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-secondary/15 text-secondary">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Live Policy Impact Simulator
                  </h3>
                  <span className="text-[10px] font-mono text-secondary">
                    Dynamic Real-Time Projection
                  </span>
                </div>
              </div>
              <span className="p-1 px-2 rounded-full bg-secondary/15 text-secondary text-[10px] font-extrabold">
                SIM ACTIVE
              </span>
            </div>

            {/* Metric 1: Projected Hotspot Relief */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-secondary" />
                  Projected Overcrowding Relief
                </span>
                <span className="font-mono font-bold text-foreground text-sm">
                  {projectedReliefRate}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-300 rounded-full"
                  style={{ width: `${projectedReliefRate}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground block">
                Estimated {Math.round(projectedReliefRate * 0.42)}% drop in peak trail queues at Ella &amp; Sigiriya
              </span>
            </div>

            {/* Metric 2: Estimated Rural Dispersal */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Daily Dispersed Travelers
                </span>
                <span className="font-mono font-bold text-foreground text-sm">
                  ~{projectedDispersedDaily.toLocaleString()} / day
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (projectedDispersedDaily / 3500) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground block">
                Redirected toward Belihuloya, Meemure, and rural Knuckles homestays
              </span>
            </div>

            {/* Metric 3: Projected Rural Revenue */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-secondary" />
                  Monthly Rural Village Revenue
                </span>
                <span className="font-mono font-bold text-secondary text-base">
                  LKR {projectedMonthlyRevenue}M
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block">
                Direct economic injection into local guides, tea estate stays, and artisans
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center gap-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-secondary shrink-0" />
              <span className="text-foreground leading-relaxed">
                Algorithm status: <strong>Optimal Balance</strong>. Zero carrying capacity threshold breach projected for Q4.
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* External Data Source Sync Telemetry Matrix */}
      <Card className="rounded-3xl border border-border/80 bg-card p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary/15 text-secondary">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Environmental Telemetry Feeds &amp; Sensor Grid
              </h2>
              <p className="text-xs text-muted-foreground">
                Live sensor pipelines providing ground-truth environmental carrying capacity inputs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              4 Feeds Online
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sensorFeeds.map((feed) => (
            <div
              key={feed.id}
              className={`p-4 rounded-2xl border transition-all ${
                feed.active
                  ? 'bg-muted/20 border-border/80 hover:border-secondary/50'
                  : 'bg-muted/10 border-border/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        feed.active ? 'bg-secondary' : 'bg-muted-foreground'
                      }`}
                    />
                    <span className="text-xs font-bold text-foreground block">
                      {feed.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {feed.desc}
                  </p>
                </div>

                <Badge
                  variant={feed.active ? 'success' : 'muted'}
                  className="text-[10px] shrink-0"
                >
                  {feed.active ? 'STREAMING' : 'MUTED'}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60 text-[11px]">
                <div className="flex items-center gap-3 text-muted-foreground font-mono">
                  <span>Ping: <strong>{feed.latency}</strong></span>
                  <span>Throughput: <strong>{feed.rate}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestPing(feed.id)}
                    disabled={isSimulatingSync === feed.id}
                    className="px-2.5 py-1 rounded-lg bg-card border border-border text-foreground hover:border-primary/40 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                  >
                    <RefreshCw
                      className={`w-3 h-3 text-secondary ${
                        isSimulatingSync === feed.id ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{isSimulatingSync === feed.id ? 'Syncing...' : 'Ping'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFeed(feed.id)}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {feed.active ? 'Mute' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
