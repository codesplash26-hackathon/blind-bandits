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
            <span className="text-xs font-bold uppercase tracking-wider text-[#44A6B5]">
              Continuous Intelligence Log
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-black">
              <span className="size-2 rounded-full bg-[#44A6B5] animate-pulse" />
              {searchHistory.length} Recorded Queries
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-black tracking-tight mt-0.5">
            Recommendation History
          </h1>
          <p className="text-xs sm:text-sm text-[#5A737D] mt-0.5">
            Audit past AI recommendation runs, calibrated parameters, and ranked sustainability matches.
          </p>
        </div>

        <Link href="/discover">
          <Button
            size="sm"
            className="rounded-2xl gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#44A6B5]" />
            <span>New AI Trip Query</span>
          </Button>
        </Link>
      </div>

      {/* ── 2. History Timeline Cards ───────────────────────────────────────── */}
      {searchHistory.length > 0 ? (
        <div className="space-y-5">
          {searchHistory.map((item, qIdx) => (
            <div
              key={item.id}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card transition-all duration-300 space-y-5"
            >
              {/* Header: Date + Parameters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#004554]/10">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] border border-[#B5D7E4] flex items-center justify-center text-black font-black text-xs shadow-2xs">
                    #{searchHistory.length - qIdx}
                  </span>
                  <div>
                    <span className="text-xs font-black text-black block">AI Query Calibrated</span>
                    <span className="text-[11px] text-[#5A737D] flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-[#44A6B5]" />
                      {item.date}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {item.preferences.interests.map((int) => (
                    <span
                      key={int}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] text-[#004554] text-xs font-bold border border-[#B5D7E4] shadow-2xs"
                    >
                      {int}
                    </span>
                  ))}
                  <span className="text-xs text-[#5A737D] font-bold">
                    • {item.preferences.durationDays} days • ~LKR {item.preferences.budgetLKR.toLocaleString()} •{' '}
                    {item.preferences.crowdPreference} crowd
                  </span>
                </div>
              </div>

              {/* Recommended Destinations List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-black uppercase tracking-wider">
                    Ranked Output Sanctuaries ({item.recommendations.length})
                  </span>
                  <span className="text-[11px] text-[#5A737D] font-bold">Highest Eco-Match First</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {item.recommendations.map((rec, idx) => (
                    <Link
                      key={rec.id}
                      href={`/destinations/${rec.id}`}
                      className="p-4 rounded-2xl bg-[#F8FCFD] hover:bg-white border border-[#B5D7E4]/70 hover:border-[#004554]/30 shadow-dashboard-panel hover:shadow-dashboard-card transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="size-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-black text-black group-hover:text-neutral-800 transition-colors block">
                            {rec.name}
                          </span>
                          <span className="text-[10px] text-[#5A737D] font-semibold">Eco Match</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-black block">
                          {rec.score}%
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">Verified</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#004554]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-[#5A737D] flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#44A6B5]" />
                  Query logged with zero sponsor bias and transparent carrying capacity balancing.
                </span>

                <Link href="/discover/results" onClick={() => handleRerun(item)}>
                  <Button
                    size="xs"
                    variant="outline"
                    className="rounded-xl gap-1 text-xs cursor-pointer border-[#004554]/20 text-[#004554] hover:bg-[#004554] hover:text-white transition-all font-bold"
                  >
                    <span>View Result Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-white border border-dashed border-[#004554]/20 max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="size-16 rounded-full bg-[#EAF4F7] text-[#004554] flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-[#44A6B5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-black">
              No recommendations logged yet
            </h3>
            <p className="text-xs sm:text-sm text-[#5A737D] leading-relaxed max-w-sm mx-auto">
              Run destination queries on Discover to have your personalized recommendation sets recorded and audited here.
            </p>
          </div>
          <Link href="/discover">
            <Button size="sm" className="rounded-2xl gap-2 bg-[#004554] hover:bg-[#003844] text-white font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-[#44A6B5]" />
              <span>Discover Sanctuaries</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
