'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Minus,
  Plus,
  Coins,
  Calendar,
  Compass,
  Users,
  Leaf,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INTEREST_OPTIONS } from '@/lib/mockData';
import { CrowdPreference, TouristPreferences } from '@/types/ceylontour';
import { Button } from '@/components/ui/button';

export default function DiscoverPage() {
  const router = useRouter();
  const { currentPreferences, updatePreferences, addSearchHistory } = useAuth();

  const [budget, setBudget] = useState<number>(currentPreferences.budgetLKR || 50000);
  const [duration, setDuration] = useState<number>(currentPreferences.durationDays || 4);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentPreferences.interests?.length ? currentPreferences.interests : ['Nature', 'Hiking']
  );
  const [crowd, setCrowd] = useState<CrowdPreference>(currentPreferences.crowdPreference || 'quiet');
  const [sustainability, setSustainability] = useState<number>(
    currentPreferences.sustainabilityImportance || 85
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const crowdOptions: Array<{
    id: CrowdPreference;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      id: 'quiet',
      title: 'Quiet & Peaceful',
      description: 'Fewer visitors, serene nature trails, and non-motorized tranquility.',
      icon: '🌿',
    },
    {
      id: 'balanced',
      title: 'Balanced Atmosphere',
      description: 'Some active local life and amenities without heavy crowds or queues.',
      icon: '⚖️',
    },
    {
      id: 'popular',
      title: 'Popular & Bustling',
      description: 'Iconic landmarks, bustling cafes, and lively tourist hubs.',
      icon: '🌟',
    },
  ];

  const handleQuickBudget = (amount: number) => {
    setBudget(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPrefs: TouristPreferences = {
      budgetLKR: budget,
      durationDays: duration,
      interests: selectedInterests.length > 0 ? selectedInterests : ['Nature'],
      crowdPreference: crowd,
      sustainabilityImportance: sustainability,
    };

    updatePreferences(newPrefs);

    // Also log in search history with placeholder recommendation preview
    addSearchHistory({
      preferences: newPrefs,
      recommendations: [
        { id: 'belihuloya', name: 'Belihuloya', score: 89, pressureLevel: 'LOW' },
        { id: 'haputale', name: 'Haputale', score: 84, pressureLevel: 'MEDIUM' },
        { id: 'meemure', name: 'Meemure', score: 81, pressureLevel: 'LOW' },
      ],
    });

    router.push('/discover/results');
  };

  const handleReset = () => {
    setBudget(50000);
    setDuration(4);
    setSelectedInterests(['Nature', 'Hiking']);
    setCrowd('quiet');
    setSustainability(85);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span>Intelligent Sustainability Matching</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Where should your next adventure be?
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          Specify your travel style across 5 factors. CeylonTour will rank Sri Lankan destinations according to carrying capacity and eco-resilience.
        </p>
      </div>

      {/* Main Interactive Form Card */}
      <form onSubmit={handleSubmit} className="bg-card border border-border/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl space-y-8">
        {/* Factor 1: Budget */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 text-secondary" />
              <span>What is your estimated trip budget?</span>
            </label>
            <span className="text-sm font-extrabold text-primary font-mono">
              LKR {budget.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-muted-foreground">
                LKR
              </span>
              <input
                type="number"
                min={15000}
                max={500000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            {/* Quick Budget Presets */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleQuickBudget(35000)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  budget <= 40000
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                Budget (35k)
              </button>
              <button
                type="button"
                onClick={() => handleQuickBudget(60000)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  budget > 40000 && budget <= 90000
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                Moderate (60k)
              </button>
              <button
                type="button"
                onClick={() => handleQuickBudget(120000)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  budget > 90000
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                Flexible (120k+)
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Factor 2: Trip Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary" />
              <span>How long is your trip?</span>
            </label>
            <span className="text-xs text-muted-foreground font-medium">
              Recommended: 2 - 7 days for regional journeys
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDuration((prev) => Math.max(1, prev - 1))}
              className="h-10 w-10 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-center text-foreground transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 max-w-[160px] text-center py-2 px-4 rounded-xl bg-muted/60 border border-border">
              <span className="font-heading text-lg font-bold text-foreground">
                {duration} {duration === 1 ? 'day' : 'days'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDuration((prev) => Math.min(21, prev + 1))}
              className="h-10 w-10 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-center text-foreground transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Factor 3: Interests */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Compass className="w-4 h-4 text-secondary" />
              <span>What experiences are you seeking?</span>
            </label>
            <span className="text-xs text-muted-foreground">
              Select one or more categories
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm border border-primary'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-secondary" />}
                  <span>{interest}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Factor 4: Crowd Preference */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-secondary" />
            <span>What atmosphere do you prefer?</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {crowdOptions.map((opt) => {
              const isSelected = crowd === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setCrowd(opt.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-secondary bg-secondary/10 ring-2 ring-secondary/20 shadow-md'
                      : 'border-border bg-background/60 hover:border-muted-foreground/30 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{opt.icon}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-secondary bg-secondary text-white' : 'border-muted-foreground/50'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground">{opt.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Factor 5: Sustainability Preference Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span>How important is sustainability & eco-carrying capacity?</span>
            </label>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {sustainability >= 75 ? 'High Priority' : sustainability >= 45 ? 'Balanced' : 'Standard'} ({sustainability}%)
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={10}
              max={100}
              value={sustainability}
              onChange={(e) => setSustainability(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground px-1">
              <span>Low (Any destination)</span>
              <span>Balanced Priority</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Strict High Eco-Standard</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer py-2 px-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-primary via-[#004e5e] to-secondary hover:opacity-95 text-primary-foreground font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-102 gap-2"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Find Sustainable Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
