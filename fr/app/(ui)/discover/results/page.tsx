'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Heart, Leaf, MapPin, RotateCcw, Search, ShieldCheck, Sliders, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/Loader';
import { mapDestination } from '@/lib/destinationMapper';
import { loadRecommendationSession } from '@/lib/recommendations';
import { recordInteraction } from '@/lib/engagement';
import type { RecommendationItemResponse, RecommendationSession } from '@/types/recommendation-api';

const recordedRecommendationSelections = new Set<string>();

function titleCase(value: string) {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function recommendationDestination(item: RecommendationItemResponse) {
  const destination = mapDestination(item.destination, null);
  return {
    ...destination,
    sustainability: {
      overall: Number(item.sustainability_score),
      environmental: Number(item.factor_scores.environmental),
      communityBenefit: Number(item.factor_scores.community),
      crowd: Number(item.factor_scores.crowd),
      infrastructure: Number(item.factor_scores.infrastructure),
      touristSuitability: Number(item.factor_scores.suitability),
    },
  };
}

export default function RecommendationResultsPage() {
  const { isSaved, toggleSaveDestination } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const session = useMemo<RecommendationSession | null>(
    () => mounted ? loadRecommendationSession() : null,
    [mounted],
  );

  const results = useMemo(() => {
    const items = session?.response.results ?? [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => [item.destination.name, item.destination.district, item.destination.region]
      .some((value) => value.toLowerCase().includes(query)));
  }, [searchQuery, session]);

  const averageSustainability = useMemo(() => {
    const items = session?.response.results ?? [];
    if (!items.length) return null;
    return Math.round(items.reduce((sum, item) => sum + Number(item.sustainability_score), 0) / items.length);
  }, [session]);

  if (!mounted) return <Loader label="Loading recommendation results..." />;

  if (!session) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-4">
        <h2 className="text-lg font-black text-foreground">No submitted recommendation search</h2>
        <p className="text-sm text-muted-foreground">Submit your travel preferences first so CeylonTour can request ranked destinations.</p>
        <Link href="/discover"><Button>Open recommendation form</Button></Link>
      </div>
    );
  }

  const request = session.request;
  const allResults = session.response.results;
  const topRankingScore = allResults[0] ? Number(allResults[0].preference_match.ranking_score).toFixed(2) : null;

  const recordRecommendationSelection = (destinationId: number) => {
    if (!session.recommendation_search_id) return;
    const key = `${session.recommendation_search_id}:${destinationId}`;
    if (recordedRecommendationSelections.has(key)) return;
    recordedRecommendationSelections.add(key);
    void recordInteraction({
      destination_id: destinationId,
      event_type: 'RECOMMENDATION_SELECTED',
      recommendation_search_id: session.recommendation_search_id,
    }).catch(() => recordedRecommendationSelections.delete(key));
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search returned destinations..." className="w-full pl-11 pr-4 py-2.5 rounded-full bg-card border border-border text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none shadow-xs" />
        </div>
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border text-xs font-bold text-primary shadow-xs">
            <Calendar className="w-3.5 h-3.5" /><span>{request.trip_duration} Days Trip Plan</span>
          </div>
          <Link href="/discover" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
            <RotateCcw className="w-3.5 h-3.5" /><span>Adjust Preferences</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Top Match Sanctuary" value={allResults[0]?.destination.name ?? 'No match'} detail={allResults.length ? '#1 backend rank' : 'Try broader constraints'} icon={<Sparkles className="w-4 h-4" />} />
        <MetricCard label="Avg Sustainability" value={averageSustainability === null ? '—' : `${averageSustainability}/100`} detail="Backend Sustainability Index" icon={<Leaf className="w-4 h-4" />} />
        <MetricCard label="Returned Matches" value={String(allResults.length)} detail="Ranked by the backend" icon={<Sliders className="w-4 h-4" />} />
        <MetricCard label="Top Ranking Score" value={topRankingScore ?? '—'} detail="Backend ranking points" icon={<ShieldCheck className="w-4 h-4" />} />
      </div>

      <div className="bg-card p-4 sm:p-5 rounded-3xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-black text-primary flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Submitted Preferences:</span>
          {request.interests.map((interest) => <Preference key={interest}>{titleCase(interest)}</Preference>)}
          <Preference>{request.crowd_preference}</Preference>
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-black">{request.sustainability_preference} sustainability preference</span>
          <Preference>LKR {request.budget.toLocaleString()}</Preference>
        </div>
        <span className="text-xs font-bold text-muted-foreground">Showing {results.length} ranked destinations</span>
      </div>

      {allResults.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-3">
          <h2 className="text-lg font-black text-foreground">No destinations match these constraints</h2>
          <p className="text-sm text-muted-foreground">Try increasing the budget, changing the trip duration, or choosing different interests.</p>
          <Link href="/discover"><Button variant="outline">Adjust preferences</Button></Link>
        </div>
      ) : results.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-card border border-border text-sm text-muted-foreground">No returned destination matches this search text.</div>
      ) : (
        <div className="space-y-5">
          {results.map((item) => {
            const destination = recommendationDestination(item);
            const match = item.preference_match;
            const bookmarked = isSaved(destination.id);
            return (
              <article key={item.destination.id} className="bg-card rounded-3xl border border-border shadow-dashboard-card overflow-hidden flex flex-col lg:flex-row group">
                <div className="relative w-full lg:w-80 min-h-[220px] overflow-hidden shrink-0">
                  <Image src={destination.image} alt={destination.name} fill unoptimized={destination.image.startsWith('http')} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-overlay/75 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-2xl bg-overlay/90 text-overlay-foreground font-heading font-black text-sm flex items-center justify-center">#{item.rank}</div>
                  <div className="absolute bottom-4 left-4 text-overlay-foreground text-xs font-bold flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {destination.district} District</div>
                </div>

                <div className="flex-1 p-6 space-y-5">
                  <div><h2 className="font-heading text-xl sm:text-2xl font-black text-foreground">{destination.name}</h2><p className="text-xs text-muted-foreground mt-1">{destination.tagline}</p></div>
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <Score label="Sustainability" value={item.sustainability_score} suffix="/100" />
                    <Score label="Environmental" value={item.factor_scores.environmental} />
                    <Score label="Community" value={item.factor_scores.community} />
                    <Score label="Crowd condition" value={item.factor_scores.crowd} />
                    <Score label="Infrastructure" value={item.factor_scores.infrastructure} />
                    <Score label="Suitability" value={item.factor_scores.suitability} />
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                    <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /><span className="text-xs font-black text-primary">Backend preference match</span></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <Score label="Interest match" value={match.interest_match_score} suffix="/100" />
                      <Score label="Crowd match" value={match.crowd_match_score} suffix="/100" />
                      <Score label="Ranking score" value={match.ranking_score} suffix=" points" />
                    </div>
                    <p className="text-xs text-muted-foreground">Matched: {match.matched_interests.length ? match.matched_interests.map(titleCase).join(', ') : 'None'}</p>
                    {match.unmatched_interests.length > 0 && <p className="text-xs text-muted-foreground">Not matched: {match.unmatched_interests.map(titleCase).join(', ')}</p>}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                    <button type="button" onClick={() => void toggleSaveDestination(destination.api.id)} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border ${bookmarked ? 'bg-destructive/10 text-destructive border-destructive/25' : 'bg-card text-primary border-border'}`}>
                      <Heart className={`w-3.5 h-3.5 ${bookmarked ? 'fill-destructive' : ''}`} />{bookmarked ? 'Saved' : 'Bookmark'}
                    </button>
                    <Link href={`/destinations/${destination.id}`} onClick={() => recordRecommendationSelection(destination.api.id)}><Button size="sm" className="rounded-full gap-1.5">Explore Destination <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Preference({ children }: { children: React.ReactNode }) {
  return <span className="px-3 py-1 rounded-full bg-muted text-primary font-bold border border-border">{children}</span>;
}

function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card p-5 rounded-3xl border border-border shadow-dashboard-card">
      <div className="flex items-center justify-between"><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span><div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">{icon}</div></div>
      <span className="font-heading text-2xl font-black text-foreground tracking-tight block mt-3 truncate">{value}</span>
      <span className="text-[11px] text-muted-foreground font-bold block mt-0.5">{detail}</span>
    </div>
  );
}

function Score({ label, value, suffix = '' }: { label: string; value: string; suffix?: string }) {
  return <div><span className="text-[10px] font-bold text-muted-foreground block">{label}</span><span className="text-xs font-black text-primary">{Number(value).toFixed(2)}{suffix}</span></div>;
}
