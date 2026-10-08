'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, History, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/Loader';
import describeApiError from '@/lib/apiError';
import { getDestination } from '@/lib/destinations';
import { listRecommendationHistory, recordInteraction } from '@/lib/engagement';
import { storeRecommendationDraft } from '@/lib/recommendations';
import type { DestinationResponse } from '@/types/destination-api';
import type { RecommendationHistoryItem } from '@/types/engagement-api';
import { useAuth } from '@/context/AuthContext';

const recordedHistorySelections = new Set<string>();

function titleCase(value: string) {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export default function HistoryPage() {
  const { user } = useAuth();
  return <HistoryContent key={user?.id ?? 'anonymous'} />;
}

function HistoryContent() {
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [destinations, setDestinations] = useState<Record<number, DestinationResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const recordHistorySelection = (searchId: number, destinationId: number) => {
    const key = `${searchId}:${destinationId}`;
    if (recordedHistorySelections.has(key)) return;
    recordedHistorySelections.add(key);
    void recordInteraction({
      destination_id: destinationId,
      event_type: 'RECOMMENDATION_SELECTED',
      recommendation_search_id: searchId,
    }).catch(() => recordedHistorySelections.delete(key));
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const items = await listRecommendationHistory();
        const ids = Array.from(new Set(items.flatMap((item) => item.result_destination_ids)));
        const loaded = await Promise.all(ids.map(async (id) => {
          try {
            return await getDestination(id);
          } catch {
            return null;
          }
        }));
        if (!active) return;
        setHistory(items);
        setDestinations(Object.fromEntries(loaded.filter((item): item is DestinationResponse => item !== null).map((item) => [item.id, item])));
      } catch (error) {
        if (active) setLoadError(describeApiError(error, 'Unable to load recommendation history.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  if (isLoading) return <Loader label="Loading recommendation history..." />;
  if (loadError) return <div className="p-12 text-center text-sm text-muted-foreground">{loadError}</div>;

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Recommendation Audit Log</span>

          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">Recommendation History</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Your backend-recorded searches, ranking versions, and returned destination order.</p>
        </div>
        <Button size="sm" nativeButton={false} render={<Link href="/discover" />}><Sparkles className="w-3.5 h-3.5" />New Trip Query</Button>
      </div>

      {history.length > 0 ? (
        <div className="space-y-5">
          {history.map((item, index) => (
            <article key={item.id} className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-xl bg-muted border border-border flex items-center justify-center font-black text-xs">#{history.length - index}</span>
                  <div>
                    <span className="text-xs font-black text-foreground block">Search #{item.id}</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold"><Clock className="w-3 h-3" />{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {item.request.interests.map((interest) => <span key={interest} className="px-2.5 py-1 rounded-xl bg-muted text-foreground text-xs font-bold border border-border">{titleCase(interest)}</span>)}
                  <span className="text-xs text-muted-foreground font-bold">{item.request.trip_duration} days • LKR {Number(item.request.budget).toLocaleString()} • {item.request.crowd_preference}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground uppercase tracking-wider">Returned Destination Order ({item.result_destination_ids.length})</span>
                  <span className="text-[11px] text-muted-foreground font-bold">{item.ranking_version}</span>
                </div>
                {item.result_destination_ids.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {item.result_destination_ids.map((destinationId, rank) => {
                      const destination = destinations[destinationId];
                      return (
                        <Link key={destinationId} href={`/destinations/${destination?.slug ?? destinationId}`} onClick={() => recordHistorySelection(item.id, destinationId)} className="p-4 rounded-2xl bg-background hover:bg-card border border-border flex items-center gap-2.5">
                          <span className="size-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">{rank + 1}</span>
                          <span className="text-xs font-black text-foreground">{destination?.name ?? `Destination ${destinationId}`}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : <p className="text-xs text-muted-foreground">This search returned no eligible destinations.</p>}
              </div>

              <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-bold"><CheckCircle2 className="w-3.5 h-3.5" />Sustainability config: {item.sustainability_config_version}</span>
                <Button
                  size="xs"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/discover" onClick={() => storeRecommendationDraft({
                  budget: Number(item.request.budget),
                  trip_duration: item.request.trip_duration,
                  interests: item.request.interests,
                  crowd_preference: item.request.crowd_preference,
                  sustainability_preference: item.request.sustainability_preference,
                })} />}
                ><span>Use These Preferences</span><ArrowRight className="w-3 h-3" /></Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-card border border-dashed border-border max-w-lg mx-auto space-y-4">
          <div className="size-16 rounded-full bg-muted text-primary flex items-center justify-center mx-auto"><History className="w-8 h-8" /></div>
          <div><h3 className="text-lg font-black text-foreground">No recommendations logged yet</h3><p className="text-xs sm:text-sm text-muted-foreground mt-1">Run a Discover search to create your first history entry.</p></div>
          <Button size="sm" nativeButton={false} render={<Link href="/discover" />}>Discover Destinations</Button>
        </div>
      )}
    </div>
  );
}
