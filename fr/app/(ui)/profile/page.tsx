'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Sliders,
  Shield,
  Trash2,
  KeyRound,
  Save,
  Sparkles,
  Leaf,
  Heart,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Search,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INTEREST_OPTIONS } from '@/lib/mockData';
import { CrowdPreference } from '@/types/ceylontour';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AuthorityProfileContent } from '@/components/profile/AuthorityProfileContent';

export default function ProfilePage() {
  const router = useRouter();
  const { user, role, currentPreferences, updatePreferences, logout, savedDestinationIds } = useAuth();

  // Tourist state
  const [name, setName] = useState(user?.name || 'Traveler');
  const [country, setCountry] = useState('Sri Lanka');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentPreferences.interests || ['Nature', 'Hiking']
  );
  const [crowd, setCrowd] = useState(currentPreferences.crowdPreference || 'quiet');
  const [sustainability, setSustainability] = useState(
    currentPreferences.sustainabilityImportance || 85
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      interests: selectedInterests,
      crowdPreference: crowd,
      sustainabilityImportance: sustainability,
    });
    toast.success('Travel preferences saved successfully!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account and all associated records? This action cannot be undone.')) {
      logout();
      toast.info('Account and data deleted.');
      router.push('/auth');
    }
  };

  // --------------------------------------------------------------------------
  // 1. TOURISM AUTHORITY ADMIN PROFILE VIEW
  // --------------------------------------------------------------------------
  if (role === 'ADMIN') {
    return (
      <div className="max-w-6xl mx-auto pb-16">
        <AuthorityProfileContent />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. CONSCIOUS TRAVELER PROFILE VIEW (Kleon Modern Dashboard Style)
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6 pb-16">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search account settings or preferences..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-card border border-border text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border text-xs font-bold text-primary shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Member Since 2026</span>
          </div>

        </div>
      </div>

      {/* Profile Welcome Banner */}
      <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading text-2xl font-black shadow-md">
              {name.charAt(0) || 'N'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-overlay-foreground flex items-center justify-center text-success-foreground" title="Verified Traveler">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-black text-foreground tracking-tight">{name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-muted text-primary text-[10px] font-bold border border-border">
                Gold Explorer
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {user?.email} • {country}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold text-muted-foreground block uppercase tracking-wider">Account Status</span>
            <span className="text-xs font-black text-foreground flex items-center gap-1.5 justify-end">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              Active Conscious Traveler
            </span>
          </div>
        </div>
      </div>

      {/* 4 Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Sustainability Index */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Eco Priority</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">{sustainability}%</span>
              <span className="text-[11px] text-success font-bold block mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Top 5% conscious
              </span>
            </div>
            {/* SVG Circular Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--muted)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="var(--chart-1)"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * sustainability) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-foreground">{sustainability}%</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Saved Sanctuaries */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Saved Sanctuaries</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">{savedDestinationIds.length}</span>
              <span className="text-[11px] text-muted-foreground font-bold block mt-0.5">
                Bookmarked spots
              </span>
            </div>
            {/* Mini Wave Sparkline */}
            <svg className="w-16 h-8 overflow-visible" viewBox="0 0 60 25">
              <path
                d="M 0 18 Q 15 5, 30 15 T 60 4"
                fill="none"
                stroke="var(--chart-1)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: Carbon Offset Avoided */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Carbon Dispersal</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">-38.4<span className="text-sm font-bold text-muted-foreground">kg</span></span>
              <span className="text-[11px] text-success font-bold block mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% vs regular tours
              </span>
            </div>
            {/* Mini SVG Bars */}
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 h-3 bg-muted rounded-full" />
              <div className="w-1.5 h-5 bg-muted rounded-full" />
              <div className="w-1.5 h-7 bg-primary rounded-full" />
              <div className="w-1.5 h-8 bg-primary rounded-full" />
            </div>
          </div>
        </div>

        {/* KPI 4: Explorer Tier */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Explorer Tier</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-foreground tracking-tight">Level 4</span>
              <span className="text-[11px] text-muted-foreground font-bold block mt-0.5">
                8 journeys completed
              </span>
            </div>
            {/* SVG Circular Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--muted)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="var(--chart-1)"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={22}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-foreground">75%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Preferences Form & Impact Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Personal Info & Travel Preferences */}
        <div className="lg:col-span-7 space-y-6">
          {/* Personal Information */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-foreground">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-card text-xs font-bold text-foreground focus:border-border outline-none shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-muted text-xs font-mono text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground">Country / Origin</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-card text-xs font-bold text-foreground focus:border-border outline-none shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Travel Preferences Form */}
          <form onSubmit={handleSavePreferences}>
            <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">AI Travel Preferences</h2>
                    <p className="text-xs text-muted-foreground font-medium">Default calibration parameters for discovery</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-border text-foreground bg-muted text-[10px] font-black">
                  Auto Calibrated
                </Badge>
              </div>

              {/* Interests Selector Tabs */}
              <div className="space-y-2">
                <span className="text-xs font-black text-primary uppercase tracking-wider block">
                  Favorite Interests &amp; Themes
                </span>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((int) => {
                    const isSelected = selectedInterests.includes(int);
                    return (
                      <button
                        type="button"
                        key={int}
                        onClick={() => toggleInterest(int)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground border-border shadow-xs font-black'
                            : 'bg-muted text-primary hover:bg-card hover:border-border border-border'
                        }`}
                      >
                        {int}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Crowd Atmosphere Tabs */}
              <div className="space-y-2">
                <span className="text-xs font-black text-primary uppercase tracking-wider block">
                  Preferred Crowd Atmosphere
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'quiet', label: 'Quiet & Serene', sub: 'Isolated trails & hidden gems' },
                    { id: 'balanced', label: 'Balanced Flow', sub: 'Moderate social energy' },
                    { id: 'popular', label: 'Landmark Vibrance', sub: 'Iconic world heritage spots' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setCrowd(opt.id as CrowdPreference)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        crowd === opt.id
                          ? 'bg-muted border-border ring-2 ring-ring/25 text-primary font-black shadow-xs'
                          : 'border-border bg-card text-muted-foreground hover:border-border hover:bg-background'
                      }`}
                    >
                      <span className="text-xs font-black text-primary block">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sustainability Weight Priority */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted border border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-primary uppercase tracking-wider text-[11px]">
                    Sustainability Dispersal Priority
                  </span>
                  <span className="text-primary font-heading font-black text-base">{sustainability}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={sustainability}
                  onChange={(e) => setSustainability(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                  <span>Economic Focus</span>
                  <span>Balanced Eco Impact</span>
                  <span className="text-primary font-black">Strict Conservation</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="rounded-full px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-primary" />
                  <span>Save Traveler Preferences</span>
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Conscious Impact Rings & Security */}
        <div className="lg:col-span-5 space-y-6">
          {/* Impact Concentric Rings Card */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-black text-foreground">Eco Impact Footprint</h3>
                <p className="text-xs text-muted-foreground font-medium">Your contribution to Sri Lanka balance</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* 3 Concentric Rings */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                  {/* Outer Ring: Carbon Dispersal (92%) */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--chart-1)"
                    strokeWidth="6"
                    strokeDasharray="264"
                    strokeDashoffset="21"
                    strokeLinecap="round"
                  />

                  {/* Middle Ring: Biodiversity Protection (85%) */}
                  <circle cx="50" cy="50" r="32" fill="none" stroke="var(--muted)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="32"
                    fill="none"
                    stroke="var(--chart-2)"
                    strokeWidth="6"
                    strokeDasharray="201"
                    strokeDashoffset="30"
                    strokeLinecap="round"
                  />

                  {/* Inner Ring: Rural Economy (96%) */}
                  <circle cx="50" cy="50" r="22" fill="none" stroke="var(--muted)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="22"
                    fill="none"
                    stroke="var(--chart-3)"
                    strokeWidth="6"
                    strokeDasharray="138"
                    strokeDashoffset="5"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="font-heading text-lg font-black text-primary block leading-none">94%</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mt-0.5">Overall</span>
                </div>
              </div>
            </div>

            {/* Impact Legend */}
            <div className="space-y-2 pt-2 border-t border-border text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-primary" />
                  <span className="text-primary font-bold">Overtourism Dispersal</span>
                </div>
                <span className="font-black text-primary">92%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-primary" />
                  <span className="text-primary font-bold">Biodiversity Preservation</span>
                </div>
                <span className="font-black text-primary">85%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-accent" />
                  <span className="text-primary font-bold">Rural Community Direct Spend</span>
                </div>
                <span className="font-black text-primary">96%</span>
              </div>
            </div>
          </div>

          {/* Privacy & Account Security */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-heading text-base font-black text-foreground">Privacy &amp; Security</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              CeylonTour follows strict sustainable tourism data minimization. Your location telemetry is anonymized and never shared with third-party advertisers.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toast.info('Password reset instructions sent to your registered email.')}
                className="rounded-full text-xs font-bold gap-1.5 border-border text-foreground hover:bg-muted"
              >
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                <span>Reset Password</span>
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                className="rounded-full text-xs font-bold gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/10 border border-destructive/25 shadow-none cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
