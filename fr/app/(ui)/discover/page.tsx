'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import {
  Sparkles,
  ArrowRight,
  Minus,
  Plus,
  Coins,
  Calendar,
  Compass,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/Loader';
import describeApiError from '@/lib/apiError';
import {
  createRecommendations,
  loadRecommendationDraft,
  loadRecommendationSession,
  storeRecommendationSession,
} from '@/lib/recommendations';
import type {
  RecommendationCrowdPreference,
  RecommendationRequest,
  RecommendationSustainabilityPreference,
} from '@/types/recommendation-api';

const INTEREST_OPTIONS = [
  { value: 'nature', label: 'Nature' },
  { value: 'beach', label: 'Beach' },
  { value: 'wildlife', label: 'Wildlife' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'culture', label: 'Culture' },
  { value: 'heritage', label: 'Heritage' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'waterfalls', label: 'Waterfalls' },
  { value: 'photography', label: 'Photography' },
] as const;

const SUSTAINABILITY_LEVELS: RecommendationSustainabilityPreference[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
];

const emptySubscribe = () => () => {};

export default function DiscoverPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  if (!mounted) return <Loader label="Loading recommendation form..." />;
  return <DiscoverForm previousRequest={loadRecommendationSession()?.request ?? loadRecommendationDraft() ?? undefined} />;
}

function DiscoverForm({ previousRequest }: { previousRequest?: RecommendationRequest }) {
  const router = useRouter();

  const [budget, setBudget] = useState<number>(previousRequest?.budget ?? 50000);
  const [duration, setDuration] = useState<number>(previousRequest?.trip_duration ?? 4);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    previousRequest?.interests.length ? previousRequest.interests : ['nature', 'hiking'],
  );
  const [crowd, setCrowd] = useState<RecommendationCrowdPreference>(
    previousRequest?.crowd_preference ?? 'QUIET',
  );
  const [sustainability, setSustainability] = useState<RecommendationSustainabilityPreference>(
    previousRequest?.sustainability_preference ?? 'HIGH',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const crowdOptions: Array<{
    id: RecommendationCrowdPreference;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      id: 'QUIET',
      title: 'Quiet & Peaceful',
      description: 'Fewer visitors, serene nature trails, and non-motorized tranquility.',
      icon: '🌿',
    },
    {
      id: 'BALANCED',
      title: 'Balanced Atmosphere',
      description: 'Some active local life and amenities without heavy crowds or queues.',
      icon: '⚖️',
    },
    {
      id: 'LIVELY',
      title: 'Popular & Bustling',
      description: 'Iconic landmarks, bustling cafes, and lively tourist hubs.',
      icon: '🌟',
    },
  ];

  const handleQuickBudget = (amount: number) => {
    setBudget(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!Number.isFinite(budget) || budget <= 0) {
      setSubmitError('Enter a budget greater than zero.');
      return;
    }
    if (!Number.isInteger(duration) || duration < 1 || duration > 365) {
      setSubmitError('Trip duration must be between 1 and 365 days.');
      return;
    }
    if (selectedInterests.length === 0) {
      setSubmitError('Select at least one travel interest.');
      return;
    }

    const request: RecommendationRequest = {
      budget,
      trip_duration: duration,
      interests: selectedInterests,
      crowd_preference: crowd,
      sustainability_preference: sustainability,
    };

    setIsSubmitting(true);
    try {
      const response = await createRecommendations(request);
      storeRecommendationSession({
        request,
        response,
        recommendation_search_id: response.recommendation_search_id,
      });
      router.push('/discover/results');
    } catch (error) {
      setSubmitError(
        isAxiosError(error) && error.response?.status === 401
          ? 'Your session has expired. Please sign in again.'
          : describeApiError(error, 'Unable to generate recommendations. Please try again.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setBudget(50000);
    setDuration(4);
    setSelectedInterests(['nature', 'hiking']);
    setCrowd('QUIET');
    setSustainability('HIGH');
    setSubmitError(null);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto w-full">
      {/* ── 1. Kleon Modern Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Your Trip Planner
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Smart Recommendations Active
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            AI Travel Match &amp; Trip Finder
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tell us your travel style. We will help you find the best places that match your preferences and avoid the crowds.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-card hover:bg-muted border border-border text-primary text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-primary" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* ── 2. Master Form Container + Live Prediction Widget ────────── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Unified Master Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-card rounded-3xl border border-border shadow-dashboard-card overflow-hidden flex flex-col">
          {/* Form Top Banner Header */}
          <div className="p-6 sm:p-7 border-b border-border bg-gradient-to-r from-muted to-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary shadow-2xs">
                  <Compass className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-black text-foreground">
                    Travel Preference Form
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Configure your constraints and travel vibe below
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-card border border-border text-primary shadow-2xs">
                4 Sections
              </span>
            </div>
          </div>

          {/* Form Body Sections */}
          <div className="p-6 sm:p-7 space-y-7">
            {/* Section 1: Trip Scope (Budget & Duration 2-Col Grid) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center">1</span>
                <h3 className="text-sm font-black text-foreground">Budget &amp; Journey Duration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Budget Field */}
                <div className="p-4 rounded-2xl bg-background border border-border shadow-dashboard-panel space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="budget-input" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-primary" />
                      <span>Total Budget</span>
                    </label>
                    <span className="text-xs font-mono font-black text-foreground">
                      LKR {budget.toLocaleString()}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-muted-foreground">
                      LKR
                    </span>
                    <input
                      id="budget-input"
                      type="number"
                      min={15000}
                      max={500000}
                      step={5000}
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full pl-11 pr-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-primary focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all shadow-2xs"
                    />
                  </div>

                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[
                      { label: '35k Budget', val: 35000 },
                      { label: '60k Standard', val: 60000 },
                      { label: '120k+ Flex', val: 120000 },
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => handleQuickBudget(preset.val)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          budget === preset.val
                            ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-2xs'
                            : 'bg-card hover:bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Field */}
                <div className="p-4 rounded-2xl bg-background border border-border shadow-dashboard-panel space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>Trip Duration</span>
                    </label>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      ~LKR {Math.round(budget / duration).toLocaleString()}/day
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setDuration((prev) => Math.max(1, prev - 1))}
                      className="size-9 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center text-primary transition-all cursor-pointer shadow-2xs font-bold active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex-1 text-center py-1.5 px-3 rounded-xl bg-card border border-border shadow-2xs">
                      <span className="font-heading text-base font-black text-primary">
                        {duration} {duration === 1 ? 'day' : 'days'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDuration((prev) => Math.min(21, prev + 1))}
                      className="size-9 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center text-primary transition-all cursor-pointer shadow-2xs font-bold active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-muted-foreground font-medium pt-1">
                    Optimal: 2 - 7 days for regional loops
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-primary/10" />

            {/* Section 2: Experiences You Seek */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center">2</span>
                  <h3 className="text-sm font-black text-foreground">Experiences You Seek</h3>
                </div>
                <span className="text-[11px] text-muted-foreground font-bold">
                  {selectedInterests.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.value);
                  return (
                    <button
                      type="button"
                      key={interest.value}
                      onClick={() => toggleInterest(interest.value)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground border-border shadow-xs font-black'
                          : 'bg-background hover:bg-card text-foreground border-border hover:border-border'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
                      <span>{interest.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-primary/10" />

            {/* Section 3: Atmosphere / Crowd Preference */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center">3</span>
                <h3 className="text-sm font-black text-foreground">Preferred Atmosphere</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {crowdOptions.map((opt) => {
                  const isSelected = crowd === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setCrowd(opt.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 shadow-dashboard-panel ${
                        isSelected
                          ? 'border-border bg-muted ring-2 ring-ring/20 shadow-dashboard-card'
                          : 'border-border bg-background hover:bg-card hover:border-border hover:shadow-dashboard-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{opt.icon}</span>
                        <div
                          className={`size-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-border bg-primary text-primary-foreground' : 'border-border bg-card'
                          }`}
                        >
                          {isSelected && <div className="size-1.5 rounded-full bg-card" />}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-foreground">{opt.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-primary/10" />

            {/* Section 4: Sustainability Priority */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center">4</span>
                  <h3 className="text-sm font-black text-foreground">Eco-Friendly Preference</h3>
                </div>
                <span className="text-xs font-black text-foreground px-2.5 py-0.5 rounded-lg bg-muted border border-border">
                  {sustainability === 'HIGH' ? 'High Priority' : sustainability === 'MEDIUM' ? 'Balanced' : 'Low Priority'}
                </span>
              </div>

              <div className="space-y-2 pt-1 p-4 rounded-2xl bg-background border border-border shadow-dashboard-panel">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={1}
                  value={SUSTAINABILITY_LEVELS.indexOf(sustainability)}
                  onChange={(e) => setSustainability(SUSTAINABILITY_LEVELS[Number(e.target.value)])}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                  <span>Popular Places</span>
                  <span>Balanced Mix</span>
                  <span className="text-primary font-black">Very Eco-Friendly</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer Action Bar */}
          <div className="p-5 sm:p-6 bg-background border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
            {submitError && (
              <p className="text-xs font-semibold text-destructive sm:basis-full">{submitError}</p>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-muted-foreground hover:text-primary text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              <span>Reset to Defaults</span>
            </button>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary via-primary to-secondary hover:opacity-95 text-primary-foreground font-extrabold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer gap-2"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>{isSubmitting ? 'Finding destinations...' : 'Generate Recommendations'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Column: Live AI Calibrator Widget (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-dashboard-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Request Preview
                </span>
                <h3 className="font-heading text-lg font-black text-foreground">
                  Submitted Preference Profile
                </h3>
              </div>
              <span className="size-8 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary shadow-2xs">
                <Sparkles className="w-4 h-4 text-primary" />
              </span>
            </div>

            {/* Exact API request summary */}
            <div className="space-y-2.5 pt-2 border-t border-border text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Crowd preference:</span>
                <span className="font-black text-primary">{crowd}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Sustainability preference:</span>
                <span className="font-black text-primary">{sustainability}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Selected Categories:</span>
                <span className="font-black text-primary">{selectedInterests.length} Selected</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Daily Avg Budget:</span>
                <span className="font-black text-primary">
                  ~LKR {Math.round(budget / duration).toLocaleString()}/day
                </span>
              </div>
            </div>

            {/* Submit Primary CTA */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold py-5 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{isSubmitting ? 'Finding destinations...' : 'Find My Sustainable Trip'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
