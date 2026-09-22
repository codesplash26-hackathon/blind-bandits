'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  MapPin,
  TrendingUp,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { DESTINATIONS } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { loginAs } = useAuth();

  const highPressureList = DESTINATIONS.filter((d) => d.pressure.level === 'HIGH');
  const mediumPressureList = DESTINATIONS.filter((d) => d.pressure.level === 'MEDIUM');
  const lowPressureList = DESTINATIONS.filter((d) => d.pressure.level === 'LOW');

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="warning">Tourism Authority Mode</Badge>
            <span className="text-xs font-mono text-muted-foreground">SHAP TreeModel v1.0</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Tourism Authority Oversight Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Live visitor carrying capacity monitoring, overtourism warnings, and sustainable redistribution metrics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loginAs('TOURIST')}
          className="rounded-xl gap-1.5 cursor-pointer self-start"
        >
          <Compass className="w-4 h-4 text-primary" />
          <span>Switch to Tourist View</span>
        </Button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Monitored Destinations
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading text-3xl font-bold text-foreground">
              {DESTINATIONS.length}
            </span>
            <MapPin className="w-5 h-5 text-secondary" />
          </div>
          <span className="text-[11px] text-muted-foreground">National pilot registry</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-emerald-500/20 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Low Pressure
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {lowPressureList.length}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Safe eco-carrying capacity</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-amber-500/20 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Medium Pressure
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading text-3xl font-bold text-amber-600 dark:text-amber-400">
              {mediumPressureList.length}
            </span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Moderate activity monitored</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-rose-500/20 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            High Pressure
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading text-3xl font-bold text-rose-600 dark:text-rose-400">
              {highPressureList.length}
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Overcrowding mitigation needed</span>
        </div>
      </div>

      {/* Action Recommendation Alert Banner */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
            Recommended Action: Active Pressure Redistribution
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {highPressureList.length} destinations ({highPressureList.map((d) => d.name).join(', ')}) currently show high visitor pressure. The CeylonTour recommendation engine is actively promoting lower-pressure alternatives like Haputale, Belihuloya, and Meemure to redirect prospective tourists.
          </p>
        </div>
      </div>

      {/* Highest Pressure Destinations Table */}
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Highest-Pressure Destinations</h2>
            <p className="text-xs text-muted-foreground">Ranked by current monitored carrying capacity strain</p>
          </div>
          <Link href="/map">
            <Button variant="ghost" size="xs" className="gap-1 text-primary">
              <span>View Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/70 text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Pressure Load</th>
                <th className="py-3 px-3">Sustainability</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {DESTINATIONS.slice()
                .sort((a, b) => b.pressure.score - a.pressure.score)
                .map((dest) => (
                  <tr key={dest.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-foreground">{dest.name}</td>
                    <td className="py-3.5 px-3 text-muted-foreground">{dest.district}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{dest.pressure.score}%</span>
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
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {dest.sustainability.overall} / 100
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant="outline">{dest.dataConfidence || 'HIGH'}</Badge>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link href={`/destinations/${dest.id}`}>
                        <Button size="xs" variant="outline" className="rounded-lg">
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
