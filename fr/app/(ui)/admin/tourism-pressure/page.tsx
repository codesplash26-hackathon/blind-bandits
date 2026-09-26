'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Info, RefreshCw, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/Loader';
import { getDestinationPressure, listDestinations } from '@/lib/destinations';
import describeApiError from '@/lib/apiError';
import type {
  DestinationPressureResponse,
  DestinationResponse,
  PressureBand,
} from '@/types/destination-api';

interface DestinationPressureRow {
  destination: DestinationResponse;
  forecast: DestinationPressureResponse;
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || !monthNumber) return month;
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(year, monthNumber - 1, 1)),
  );
}

const bandStyle: Record<PressureBand, {
  badge: 'destructive' | 'warning' | 'success';
  border: string;
  fill: string;
  text: string;
}> = {
  LOW: {
    badge: 'success',
    border: 'border-success/40',
    fill: 'bg-success',
    text: 'text-success',
  },
  MEDIUM: {
    badge: 'warning',
    border: 'border-warning/40',
    fill: 'bg-warning',
    text: 'text-warning',
  },
  HIGH: {
    badge: 'destructive',
    border: 'border-destructive/40',
    fill: 'bg-destructive',
    text: 'text-destructive',
  },
};

export default function AdminTourismPressurePage() {
  const [month, setMonth] = useState(currentMonth);
  const [rows, setRows] = useState<DestinationPressureRow[]>([]);
  const [unavailableCount, setUnavailableCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadPressure = async () => {
      setIsLoading(true);
      setLoadError(null);
      setRows([]);
      setUnavailableCount(0);
      try {
        const destinations = await listDestinations({ active: true });
        const results = await Promise.allSettled(
          destinations.map(async (destination) => ({
            destination,
            forecast: await getDestinationPressure(destination.id, month),
          })),
        );
        if (!active) return;
        const available = results
          .filter((result): result is PromiseFulfilledResult<DestinationPressureRow> => result.status === 'fulfilled')
          .map((result) => result.value)
          .sort((left, right) => (
            right.forecast.predicted_regional_occupancy_rate
            - left.forecast.predicted_regional_occupancy_rate
          ));
        const failures = results.filter(
          (result): result is PromiseRejectedResult => result.status === 'rejected',
        );
        setRows(available);
        setUnavailableCount(failures.length);
        if (available.length === 0 && failures.length > 0) {
          setLoadError(describeApiError(
            failures[0].reason,
            'No regional visitor-pressure predictions are available for this month.',
          ));
        }
      } catch (error) {
        if (active) {
          setLoadError(describeApiError(error, 'Unable to load visitor-pressure predictions.'));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadPressure();
    return () => {
      active = false;
    };
  }, [month, reloadKey]);

  const counts = useMemo(() => ({
    LOW: rows.filter((row) => row.forecast.band === 'LOW').length,
    MEDIUM: rows.filter((row) => row.forecast.band === 'MEDIUM').length,
    HIGH: rows.filter((row) => row.forecast.band === 'HIGH').length,
  }), [rows]);
  const modelVersion = rows[0]?.forecast.model_version ?? null;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Tourism Pressure Engine</span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Artifact-backed regional forecasts
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Tourism Pressure Monitor
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            One-month-ahead regional accommodation occupancy from the deployed visitor-pressure model.
          </p>
        </div>
        <Link href="/admin/analytics">
          <Button size="sm" variant="outline" className="rounded-xl gap-1.5 cursor-pointer">
            <TrendingUp className="w-4 h-4 text-secondary" /> View Impact Analytics
          </Button>
        </Link>
      </div>

      <Card className="rounded-3xl border border-primary/30 p-6 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <label className="space-y-1 text-xs font-bold text-foreground">
              Forecast month
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="block h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground"
              />
            </label>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={isLoading}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh predictions
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border">
          {(['LOW', 'MEDIUM', 'HIGH'] as const).map((band) => (
            <div key={band} className="rounded-2xl border border-border bg-card p-4">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">{band} pressure</span>
              <p className={`text-2xl font-black ${bandStyle[band].text}`}>{counts[band]}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-border bg-card p-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Unavailable</span>
            <p className="text-2xl font-black text-muted-foreground">{unavailableCount}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <p>
            Scope: regional • Context: {formatMonth(month)} • Model: {modelVersion ?? 'not available'}.
            The API returns no confidence interval; unavailable destinations receive no fallback score.
          </p>
        </div>
      </Card>

      {isLoading && <Loader label="Loading regional pressure predictions..." />}
      {!isLoading && loadError && (
        <Card className="rounded-3xl border border-destructive/30 p-6 text-center space-y-3">
          <h2 className="font-bold text-foreground">Pressure data unavailable</h2>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => setReloadKey((value) => value + 1)}>Try again</Button>
        </Card>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Regional Destination Forecasts</h2>
            <p className="text-xs text-muted-foreground">
              Backend predictions sorted by occupancy; no frontend pressure formula is applied.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map(({ destination, forecast }) => {
              const value = forecast.predicted_occupancy ?? forecast.predicted_regional_occupancy_rate;
              const band = forecast.pressure_band ?? forecast.band;
              const style = bandStyle[band];
              return (
                <Card key={destination.id} className={`p-5 rounded-3xl border ${style.border}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-heading text-base font-bold text-foreground">{destination.name}</h3>
                      <span className="text-[11px] text-muted-foreground">{forecast.region} regional forecast</span>
                    </div>
                    <Badge variant={style.badge}>{band}</Badge>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-muted-foreground">Predicted occupancy</span>
                      <span className="text-foreground text-sm font-mono font-bold">{value.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${style.fill}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/70 space-y-1 text-[11px] text-muted-foreground">
                    <p>{formatMonth(forecast.forecast_month ?? forecast.month)} • {forecast.forecast_mode.replaceAll('_', ' ')}</p>
                    <p className="break-all">Model {forecast.model_version}</p>
                    <Link href={`/destinations/${destination.slug}`} className="text-primary hover:underline font-semibold inline-flex items-center gap-0.5 pt-1">
                      Inspect prediction <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
