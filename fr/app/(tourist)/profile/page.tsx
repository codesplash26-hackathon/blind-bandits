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
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INTEREST_OPTIONS } from '@/lib/mockData';
import { CrowdPreference } from '@/types/ceylontour';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AuthorityProfileContent } from '@/components/profile/AuthorityProfileContent';

export default function ProfilePage() {
  const router = useRouter();
  const { user, role, loginAs, currentPreferences, updatePreferences, logout } = useAuth();

  // Tourist state
  const [name, setName] = useState(user?.name || 'Nipun');
  const [country, setCountry] = useState(user?.country || 'Sri Lanka');
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
      <div className="max-w-4xl mx-auto pb-16">
        <AuthorityProfileContent showSwitchToTourist={true} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. CONSCIOUS TRAVELER PROFILE VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Conscious Traveler</Badge>
            <span className="text-xs text-muted-foreground font-mono">Personal Account</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Traveler Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your personal details, recommendation defaults, and privacy settings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loginAs('ADMIN');
            toast.info('Switched session to Tourism Authority Official profile');
          }}
          className="rounded-xl gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Switch to Authority Profile</span>
        </Button>
      </div>

      {/* 1. Personal Information Card */}
      <Card className="p-6 rounded-3xl border border-border/80 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-secondary" />
          <h2 className="text-base font-bold text-foreground">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
            <input
              type="email"
              value={user?.email || 'nipun@ceylontour.lk'}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Country / Nationality</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:border-primary outline-none"
            />
          </div>
        </div>
      </Card>

      {/* 2. Travel Preferences Card */}
      <form onSubmit={handleSavePreferences}>
        <Card className="p-6 rounded-3xl border border-border/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-secondary" />
              <h2 className="text-base font-bold text-foreground">Travel Preferences</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">Default inputs for AI finder</span>
          </div>

          {/* Favorite Interests */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Favorite Interests
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((int) => {
                const isSelected = selectedInterests.includes(int);
                return (
                  <button
                    type="button"
                    key={int}
                    onClick={() => toggleInterest(int)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {int}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Crowd Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Preferred Crowd Atmosphere
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'quiet', label: 'Quiet & Peaceful' },
                { id: 'balanced', label: 'Balanced Activity' },
                { id: 'popular', label: 'Popular Landmark' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setCrowd(opt.id as CrowdPreference)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    crowd === opt.id
                      ? 'bg-secondary/15 border-secondary text-foreground font-bold shadow-xs'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sustainability Importance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground uppercase tracking-wider text-[11px]">
                Sustainability Weight Priority
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{sustainability}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={sustainability}
              onChange={(e) => setSustainability(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="sm" className="rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground">
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </Button>
          </div>
        </Card>
      </form>

      {/* 3. Privacy & Account Settings */}
      <Card className="p-6 rounded-3xl border border-border/80 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-secondary" />
          <h2 className="text-base font-bold text-foreground">Privacy &amp; Account Security</h2>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          CeylonTour minimizes personal data retention according to sustainable tourism data standards. You may request password credentials reset or erase your stored account history anytime.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toast.info('Password reset instructions sent to your registered email.')}
            className="rounded-xl gap-1.5 text-xs"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDeleteAccount}
            className="rounded-xl gap-1.5 text-xs bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 shadow-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account &amp; Data</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
