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
        <Card className="rounded-3xl border border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-1">
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
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-emerald-500/20 shadow-xs">
          <CardContent className="p-5 space-y-1">
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
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-amber-500/20 shadow-xs">
          <CardContent className="p-5 space-y-1">
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
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-rose-500/20 shadow-xs">
          <CardContent className="p-5 space-y-1">
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
          </CardContent>
        </Card>
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
      <Card className="rounded-3xl border border-border/80 shadow-sm overflow-hidden">
        <div className="p-6 pb-2 flex items-center justify-between">
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

        <div className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="text-muted-foreground uppercase tracking-wider text-[11px]">
                <TableHead className="py-3 px-3">Destination</TableHead>
                <TableHead className="py-3 px-3">District</TableHead>
                <TableHead className="py-3 px-3">Pressure Load</TableHead>
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
                    <TableCell className="py-3.5 px-3 font-bold text-foreground">{dest.name}</TableCell>
                    <TableCell className="py-3.5 px-3 text-muted-foreground">{dest.district}</TableCell>
                    <TableCell className="py-3.5 px-3">
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
