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

  // Predicted dynamic match metrics
  const predictedScore = Math.min(98, Math.max(70, Math.round(75 + (sustainability * 0.15) + (crowd === 'quiet' ? 8 : 4))));
  const predictedCrowdReduction = crowd === 'quiet' ? '72%' : crowd === 'balanced' ? '45%' : '15%';

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto w-full">
      {/* ── 1. Kleon Modern Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44A6B5]">
              Intelligent Destination Calibrator
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-black">
              <span className="size-2 rounded-full bg-[#44A6B5] animate-pulse" />
              Carrying Capacity Balancing Active
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-black tracking-tight mt-0.5">
            AI Travel Match &amp; Trip Finder
          </h1>
          <p className="text-xs sm:text-sm text-[#5A737D] mt-0.5">
            Calibrate your travel style across 5 factors. CeylonTour balances environmental carrying capacities to generate your optimal route.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-[#EAF4F7] border border-[#004554]/15 text-[#004554] text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#44A6B5]" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* ── 2. Master Form Container + Live Prediction Widget ────────── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Unified Master Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#004554]/10 shadow-dashboard-card overflow-hidden flex flex-col">
          {/* Form Top Banner Header */}
          <div className="p-6 sm:p-7 border-b border-[#004554]/10 bg-gradient-to-r from-[#F0F5F8] to-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] border border-[#B5D7E4] flex items-center justify-center text-[#004554] shadow-2xs">
                  <Compass className="w-5 h-5 text-[#004554]" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-black text-black">
                    Travel Preference Form
                  </h2>
                  <p className="text-xs text-[#5A737D] font-medium">
                    Configure your constraints and travel vibe below
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white border border-[#B5D7E4] text-[#004554] shadow-2xs">
                4 Sections
              </span>
            </div>
          </div>

          {/* Form Body Sections */}
          <div className="p-6 sm:p-7 space-y-7">
            {/* Section 1: Trip Scope (Budget & Duration 2-Col Grid) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">1</span>
                <h3 className="text-sm font-black text-black">Budget &amp; Journey Duration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Budget Field */}
                <div className="p-4 rounded-2xl bg-[#F8FBFC] border border-[#004554]/10 shadow-dashboard-panel space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="budget-input" className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-[#44A6B5]" />
                      <span>Total Budget</span>
                    </label>
                    <span className="text-xs font-mono font-black text-black">
                      LKR {budget.toLocaleString()}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#5A737D]">
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
                      className="w-full pl-11 pr-3 py-2 rounded-xl border border-[#004554]/15 bg-white text-xs font-bold text-[#004554] focus:ring-2 focus:ring-[#004554] focus:border-transparent outline-none transition-all shadow-2xs"
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
                            ? 'bg-gradient-to-r from-[#003E4C] to-[#04667C] text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-[#5A737D] border border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Field */}
                <div className="p-4 rounded-2xl bg-[#F8FBFC] border border-[#004554]/10 shadow-dashboard-panel space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#44A6B5]" />
                      <span>Trip Duration</span>
                    </label>
                    <span className="text-[11px] font-semibold text-[#5A737D]">
                      ~LKR {Math.round(budget / duration).toLocaleString()}/day
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setDuration((prev) => Math.max(1, prev - 1))}
                      className="size-9 rounded-xl border border-[#004554]/15 bg-white hover:bg-[#EAF4F7] flex items-center justify-center text-[#004554] transition-all cursor-pointer shadow-2xs font-bold active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex-1 text-center py-1.5 px-3 rounded-xl bg-white border border-[#004554]/15 shadow-2xs">
                      <span className="font-heading text-base font-black text-[#004554]">
                        {duration} {duration === 1 ? 'day' : 'days'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDuration((prev) => Math.min(21, prev + 1))}
                      className="size-9 rounded-xl border border-[#004554]/15 bg-white hover:bg-[#EAF4F7] flex items-center justify-center text-[#004554] transition-all cursor-pointer shadow-2xs font-bold active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-[#5A737D] font-medium pt-1">
                    Optimal: 2 - 7 days for regional loops
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#004554]/10" />

            {/* Section 2: Experiences You Seek */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">2</span>
                  <h3 className="text-sm font-black text-black">Experiences You Seek</h3>
                </div>
                <span className="text-[11px] text-[#5A737D] font-bold">
                  {selectedInterests.length} selected
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
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#003E4C] via-[#004E5F] to-[#04667C] text-white border-[#004554] shadow-xs font-black'
                          : 'bg-[#F8FBFC] hover:bg-white text-[#1E293B] border-[#004554]/15 hover:border-[#004554]/30'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#44A6B5] stroke-[3]" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-[#004554]/10" />

            {/* Section 3: Atmosphere / Crowd Preference */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">3</span>
                <h3 className="text-sm font-black text-black">Preferred Atmosphere</h3>
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
                          ? 'border-[#004554] bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] ring-2 ring-[#004554]/20 shadow-dashboard-card'
                          : 'border-[#004554]/12 bg-[#F8FBFC] hover:bg-white hover:border-[#004554]/30 hover:shadow-dashboard-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{opt.icon}</span>
                        <div
                          className={`size-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#004554] bg-[#004554] text-white' : 'border-[#004554]/25 bg-white'
                          }`}
                        >
                          {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-black">{opt.title}</h4>
                        <p className="text-[10px] text-[#5A737D] mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-[#004554]/10" />

            {/* Section 4: Sustainability Priority */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">4</span>
                  <h3 className="text-sm font-black text-black">Carrying Capacity &amp; Sustainability Weight</h3>
                </div>
                <span className="text-xs font-black text-black px-2.5 py-0.5 rounded-lg bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] border border-[#B5D7E4]">
                  {sustainability >= 75 ? 'High Priority' : sustainability >= 45 ? 'Balanced' : 'Standard'} ({sustainability}%)
                </span>
              </div>

              <div className="space-y-2 pt-1 p-4 rounded-2xl bg-[#F8FBFC] border border-[#004554]/10 shadow-dashboard-panel">
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={sustainability}
                  onChange={(e) => setSustainability(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004554]"
                />

                <div className="flex justify-between text-[11px] font-bold text-[#5A737D]">
                  <span>Popular routes</span>
                  <span>Balanced Eco Impact</span>
                  <span className="text-[#004554] font-black">Strict Conservation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer Action Bar */}
          <div className="p-5 sm:p-6 bg-[#F8FBFC] border-t border-[#004554]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-[#004554]/15 text-[#5A737D] hover:text-[#004554] text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#44A6B5]" />
              <span>Reset to Defaults</span>
            </button>

            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-[#003E4C] via-[#004E5F] to-[#04667C] hover:opacity-95 text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer gap-2"
            >
              <Sparkles className="w-4 h-4 text-light-blue" />
              <span>Generate AI Route Recommendations</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Column: Live AI Calibrator Widget (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#004554]/10 shadow-dashboard-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#44A6B5] block">
                  AI Calibrator Preview
                </span>
                <h3 className="font-heading text-lg font-black text-black">
                  Predicted Trip Profile
                </h3>
              </div>
              <span className="size-8 rounded-2xl bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] border border-[#B5D7E4] flex items-center justify-center text-[#004554] shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#44A6B5]" />
              </span>
            </div>

            {/* Circular Gauge Ring */}
            <div className="relative h-40 w-full flex items-center justify-center">
              <svg className="size-36 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#EBF1F5" strokeWidth="7" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#004554"
                  strokeWidth="7"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (251 * (predictedScore / 100))}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-500"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-heading text-2xl font-black text-[#004554]">
                  {predictedScore}%
                </span>
                <span className="text-[10px] uppercase font-bold text-[#5A737D]">Eco Match</span>
              </div>
            </div>

            {/* Impact Metric Chips */}
            <div className="space-y-2.5 pt-2 border-t border-[#004554]/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5A737D] font-medium">Crowd Reduction:</span>
                <span className="font-black text-[#004554]">{predictedCrowdReduction} vs peak Ella</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5A737D] font-medium">Homestay Support:</span>
                <span className="font-black text-[#004554]">85%+ Local Families</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5A737D] font-medium">Selected Categories:</span>
                <span className="font-black text-[#004554]">{selectedInterests.length} Selected</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5A737D] font-medium">Daily Avg Budget:</span>
                <span className="font-black text-[#004554]">
                  ~LKR {Math.round(budget / duration).toLocaleString()}/day
                </span>
              </div>
            </div>

            {/* Submit Primary CTA */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#004554] hover:bg-[#003844] text-white font-extrabold py-5 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4 text-[#44A6B5]" />
              <span>Find My Sustainable Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
