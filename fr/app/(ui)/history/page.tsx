'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  History,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SearchHistoryItem } from '@/types/ceylontour';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const { searchHistory, updatePreferences } = useAuth();

  const handleRerun = (item: SearchHistoryItem) => {
    updatePreferences(item.preferences);
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto w-full">
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Your Search History
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              {searchHistory.length} Past Searches
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Past Trip Ideas
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            See your past trip searches and the places we recommended for you.
          </p>
        </div>

        <Link href="/discover">
          <Button
            size="sm"
            className="rounded-2xl gap-2 bg-primary hover:bg-overlay text-primary-foreground text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Start a New Search</span>
          </Button>
        </Link>
      </div>

      {/* ── 2. History Timeline Cards ───────────────────────────────────────── */}
      {searchHistory.length > 0 ? (
        <div className="space-y-5">
          {searchHistory.map((item, qIdx) => (
            <div
              key={item.id}
              className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card transition-all duration-300 space-y-5"
            >
              {/* Header: Date + Parameters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground font-black text-xs shadow-2xs">
                    #{searchHistory.length - qIdx}
                  </span>
                  <div>
                    <span className="text-xs font-black text-foreground block">Search Details</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-primary" />
                      {item.date}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {item.preferences.interests.map((int) => (
                    <span
                      key={int}
                      className="px-2.5 py-1 rounded-xl bg-muted text-primary text-xs font-bold border border-border shadow-2xs"
                    >
                      {int}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground font-bold">
                    • {item.preferences.durationDays} days • ~LKR {item.preferences.budgetLKR.toLocaleString()} •{' '}
                    {item.preferences.crowdPreference} crowd
                  </span>
                </div>
              </div>

              {/* Recommended Destinations List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground uppercase tracking-wider">
                    Recommended Places ({item.recommendations.length})
                  </span>
                  <span className="text-[11px] text-muted-foreground font-bold">Best Matches First</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {item.recommendations.map((rec, idx) => (
                    <Link
                      key={rec.id}
                      href={`/destinations/${rec.id}`}
                      className="p-4 rounded-2xl bg-background hover:bg-card border border-border/70 hover:border-border shadow-dashboard-panel hover:shadow-dashboard-card transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="size-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-black text-foreground group-hover:text-foreground transition-colors block">
                            {rec.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">Match</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-foreground block">
                          {rec.score}%
                        </span>
                        <span className="text-[10px] font-bold text-success">Verified</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  Results are honest and help keep places from getting too crowded.
                </span>

                <Link href="/discover/results" onClick={() => handleRerun(item)}>
                  <Button
                    size="xs"
                    variant="outline"
                    className="rounded-xl gap-1 text-xs cursor-pointer border-border text-primary hover:bg-primary hover:text-primary-foreground transition-all font-bold"
                  >
                    <span>View Full Results</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-card border border-dashed border-border max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="size-16 rounded-full bg-muted text-primary flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-foreground">
              No searches yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Search for places on the Discover page and your history will show up here.
            </p>
          </div>
          <Link href="/discover">
            <Button size="sm" className="rounded-2xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Discover Places</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
