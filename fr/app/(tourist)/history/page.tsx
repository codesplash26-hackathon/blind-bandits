'use client';

import React from 'react';
import Link from 'next/link';
import {
  History,
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Recommendation History
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Chronological audit of past AI destination queries and ranked sustainability outputs.
          </p>
        </div>

        <Link href="/discover">
          <Button size="sm" className="rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground">
            <Compass className="w-4 h-4 text-secondary" />
            <span>New Search</span>
          </Button>
        </Link>
      </div>

      {searchHistory.length > 0 ? (
        <div className="space-y-4">
          {searchHistory.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-sm hover:border-secondary/50 transition-all space-y-4"
            >
              {/* Header: Date + Parameters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-secondary" />
                  <span>{item.date}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {item.preferences.interests.map((int) => (
                    <span
                      key={int}
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {int}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground">
                    • {item.preferences.durationDays} days • LKR {item.preferences.budgetLKR.toLocaleString()} •{' '}
                    {item.preferences.crowdPreference} crowds
                  </span>
                </div>
              </div>

              {/* Recommended Destinations List */}
              <div>
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
                  Recommended Destinations
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {item.recommendations.map((rec, idx) => (
                    <Link
                      key={rec.id}
                      href={`/destinations/${rec.id}`}
                      className="p-3 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border/60 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground group-hover:text-secondary transition-colors">
                          {rec.name}
                        </span>
                      </div>

                      <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        {rec.score}/100
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Query logged for AI model continuous improvement
                </span>

                <Link href="/discover/results" onClick={() => handleRerun(item)}>
                  <Button size="xs" variant="outline" className="rounded-xl gap-1 cursor-pointer">
                    <span>View Results</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card/60 max-w-md mx-auto space-y-4">
          <History className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No search history yet</h3>
            <p className="text-xs text-muted-foreground">
              Run destination queries on Discover to have your personalized recommendation sets recorded here.
            </p>
          </div>
          <Link href="/discover">
            <Button size="sm" className="rounded-xl">Discover Destinations</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
