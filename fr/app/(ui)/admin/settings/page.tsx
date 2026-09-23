'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Database,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const [warningThreshold, setWarningThreshold] = useState<number>(75);
  const [diversionBias, setDiversionBias] = useState<number>(35);
  const [ecoWeight, setEcoWeight] = useState<number>(50);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 font-bold">System Policy</Badge>
            <span className="text-xs text-muted-foreground font-mono">Engine Config v3.1</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Sustainability &amp; Algorithm Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure carrying capacity thresholds, recommendation weightings, and external sensor sync feeds.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          className="rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground self-start sm:self-auto"
        >
          <Save className="w-4 h-4 text-secondary" />
          <span>Save Policy</span>
        </Button>
      </div>

      {savedFeedback && (
        <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center gap-2 text-xs text-foreground animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
          <span className="font-semibold">
            Authority configuration updated and propagated to tourist recommendation engine.
          </span>
        </div>
      )}

      {/* Model Parameters Card */}
      <Card className="rounded-3xl border border-border/80 p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Recommendation Engine Thresholds</h2>
            <p className="text-xs text-muted-foreground">
              Adjust how the TreeSHAP and multi-criteria recommendation pipeline treats carrying capacity
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Slider 1: Warning Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Critical Carrying Capacity Alert Threshold:</span>
              <span className="font-mono font-bold text-destructive text-sm">
                {warningThreshold}% Capacity
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              step="5"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
              className="w-full accent-destructive cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Conservative (60%)</span>
              <span>Default (75%)</span>
              <span>Lenient (90%)</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Destinations whose visitor footfall exceeds this threshold trigger an automatic warning banner and lower-pressure alternative suggestions.
            </p>
          </div>

          {/* Slider 2: Diversion Bias */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Alternative Redistribution Routing Bias:</span>
              <span className="font-mono font-bold text-secondary text-sm">
                +{diversionBias}% Alternative Boost
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={diversionBias}
              onChange={(e) => setDiversionBias(Number(e.target.value))}
              className="w-full accent-secondary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Subtle (+10%)</span>
              <span>Balanced (+35%)</span>
              <span>Strong (+60%)</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Higher bias actively steers tourist discover results toward eco-destinations like Belihuloya and Haputale when nearby hubs are overloaded.
            </p>
          </div>

          {/* Slider 3: Eco Weight in Matching */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Sustainability Weight in Algorithm:</span>
              <span className="font-mono font-bold text-primary text-sm">
                {ecoWeight}% Eco-Factor
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={ecoWeight}
              onChange={(e) => setEcoWeight(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Tourist Preference Focused (20%)</span>
              <span>Balanced (50%)</span>
              <span>Eco-Dominant (80%)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* External Data Source Sync Card */}
      <Card className="rounded-3xl border border-border/80 p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="p-2.5 rounded-xl bg-secondary/15 text-secondary">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Environmental Sensor Feeds & APIs</h2>
            <p className="text-xs text-muted-foreground">Real-time ecological telemetry data sources feeding TreeSHAP</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Central Environmental Authority (CEA) Sensors</span>
              <span className="text-[11px] text-muted-foreground">River turbidity, waste collection logs, and noise monitors</span>
            </div>
            <Badge variant="success">LIVE TELEMETRY</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Wildlife Conservation (DWC) Trail Gate Telemetry</span>
              <span className="text-[11px] text-muted-foreground">Horton Plains, Yala, and Knuckles entry ticketing feed</span>
            </div>
            <Badge variant="success">CONNECTED</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Department of Meteorology Weather & Monsoon Radar</span>
              <span className="text-[11px] text-muted-foreground">Rainfall intensity and landslide risk warning layers</span>
            </div>
            <Badge variant="success">SYNCED (15m)</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
