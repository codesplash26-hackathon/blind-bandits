'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Eye,
  Heart,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { getAdminAnalytics } from '@/lib/destinations';
import describeApiError from '@/lib/apiError';
import type { AdminAnalyticsResponse } from '@/types/analytics-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePickerInput } from '@/components/ui/date-picker';

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return dateInputValue(date);
}

function formatRate(value: number | null) {
  return value === null ? 'Unavailable' : `${(value * 100).toFixed(1)}%`;
}

export default function AdminAnalyticsPage() {
  const { user, role, isLoading: isAuthLoading } = useAuth();
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(() => dateInputValue(new Date()));
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isAuthLoading || !user || role !== 'ADMIN') return;
    let active = true;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setLoadError(null);
      getAdminAnalytics(startDate, endDate)
        .then((response) => {
          if (active) setAnalytics(response);
        })
        .catch((error) => {
          if (!active) return;
          setAnalytics(null);
          setLoadError(describeApiError(error, 'Unable to load analytics for this date range.'));
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [endDate, isAuthLoading, reloadKey, role, startDate, user]);

  if (isAuthLoading) return <div className="p-12 text-center text-sm text-muted-foreground">Restoring administrator session...</div>;
  if (!user || role !== 'ADMIN') {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-2">
        <h2 className="text-lg font-bold text-foreground">Administrator access required</h2>
        <p className="text-sm text-muted-foreground">Aggregate analytics are available only to authorized administrators.</p>
      </div>
    );
  }
  if (isLoading && !analytics) return <div className="p-12 text-center text-sm text-muted-foreground">Loading aggregate analytics...</div>;
  if (loadError) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
        <h2 className="text-lg font-bold text-foreground">Analytics unavailable</h2>
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <Button type="button" onClick={() => setReloadKey((value) => value + 1)} variant="link" size="sm">Try again</Button>
      </div>
    );
  }
  if (!analytics) return null;

  const { summary } = analytics;
  const daily = analytics.daily.map((point) => ({ ...point, date: point.date.slice(5) }));
  const metrics = [
    { label: 'Recommendation Searches', value: summary.total_recommendation_searches, detail: 'Aggregate search requests', icon: <Search className="w-5 h-5" /> },
    { label: 'Destination Views', value: summary.destination_views, detail: 'DESTINATION_VIEWED events', icon: <Eye className="w-5 h-5" /> },
    { label: 'Save Events', value: summary.destination_save_events, detail: 'Destination save events', icon: <Heart className="w-5 h-5" /> },
    { label: 'Accepted Recommendations', value: summary.recommendations_accepted, detail: 'RECOMMENDATION_SELECTED events', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Alternative Selections', value: summary.alternative_destinations_selected, detail: 'All alternative selections', icon: <ArrowRight className="w-5 h-5" /> },
    { label: 'High-Pressure Redirects', value: summary.high_pressure_redirection_events, detail: `${summary.users_redirected_from_high_pressure_destinations} distinct users`, icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'Lower-Pressure Discoveries', value: summary.lower_pressure_discovery_events, detail: `${summary.distinct_lower_pressure_destinations_discovered} distinct destinations`, icon: <Activity className="w-5 h-5" /> },
    { label: 'Alternative Acceptance Rate', value: formatRate(summary.alternative_acceptance_rate), detail: 'Search-to-selection proxy', icon: <Users className="w-5 h-5" /> },
  ];
  const lists = [
    { title: 'Most Searched Interests', items: analytics.most_searched_interests.map((item) => ({ label: item.interest, count: item.count })) },
    { title: 'Most Viewed Destinations', items: analytics.most_viewed_destinations.map((item) => ({ label: item.name, count: item.count })) },
    { title: 'Most Saved Destinations', items: analytics.most_saved_destinations.map((item) => ({ label: item.name, count: item.count })) },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
         <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">Recommendation &amp; Engagement Analytics</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">Aggregate activity and pressure-redirection outcomes for the selected UTC date range.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <DatePickerInput label="From" value={startDate} onValueChange={setStartDate} inputClassName="text-xs" />
          <DatePickerInput label="To" value={endDate} onValueChange={setEndDate} inputClassName="text-xs" />
          <Button size="sm" variant="outline" onClick={() => setReloadKey((value) => value + 1)} disabled={isLoading}><RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</Button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-start gap-2.5 text-xs text-foreground"><Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" /><div><p className="font-semibold">{summary.alternative_acceptance_rate_basis}</p><p className="text-muted-foreground mt-1">No raw user, search, or interaction rows are exposed here.</p></div></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => <div key={metric.label} className="p-5 rounded-3xl bg-card border border-border shadow-dashboard-card flex items-center justify-between"><div className="space-y-1"><span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">{metric.label}</span><span className="font-heading text-3xl font-black text-foreground tracking-tight">{metric.value}</span><span className="text-[11px] text-muted-foreground block">{metric.detail}</span></div><div className="p-3 rounded-2xl bg-muted text-primary">{metric.icon}</div></div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-5"><div><h2 className="font-heading text-lg font-black text-foreground">Daily Searches &amp; Views</h2><p className="text-xs text-muted-foreground mt-1">Daily aggregate activity in the selected range.</p></div><div className="h-72">{daily.length === 0 ? <p className="text-sm text-muted-foreground text-center pt-20">No daily activity data.</p> : <ResponsiveContainer width="100%" height="100%"><LineChart data={daily}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" /><XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="recommendation_searches" name="Searches" stroke="var(--chart-1)" strokeWidth={3} /><Line type="monotone" dataKey="destination_views" name="Views" stroke="var(--chart-2)" strokeWidth={3} /></LineChart></ResponsiveContainer>}</div></div>
        <div className="p-6 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-5"><div><h2 className="font-heading text-lg font-black text-foreground">Daily Selections &amp; Redirects</h2><p className="text-xs text-muted-foreground mt-1">Selection and pressure-context outcomes.</p></div><div className="h-72">{daily.length === 0 ? <p className="text-sm text-muted-foreground text-center pt-20">No daily activity data.</p> : <ResponsiveContainer width="100%" height="100%"><BarChart data={daily}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" /><XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><Tooltip /><Bar dataKey="recommendations_accepted" name="Recommendations accepted" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /><Bar dataKey="alternatives_selected" name="Alternatives selected" fill="var(--chart-2)" radius={[4, 4, 0, 0]} /><Bar dataKey="high_pressure_redirections" name="High-pressure redirects" fill="var(--destructive)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>}</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{lists.map((list) => <div key={list.title} className="p-6 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-4"><h2 className="font-heading text-lg font-black text-foreground">{list.title}</h2>{list.items.length === 0 ? <p className="text-sm text-muted-foreground">No records in this date range.</p> : <div className="space-y-3">{list.items.map((item) => <div key={item.label} className="flex items-center justify-between text-sm"><span className="font-semibold text-foreground truncate">{item.label}</span><Badge variant="outline">{item.count}</Badge></div>)}</div>}</div>)}</div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span>{summary.alternative_selections_with_pressure_context} alternative selections include pressure context.</span><span>{analytics.daily.length} daily points returned.</span><Link href="/admin/dashboard" className="font-bold text-primary hover:underline">Back to authority dashboard</Link></div>
    </div>
  );
}
