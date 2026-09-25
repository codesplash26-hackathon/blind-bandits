'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Bell,
  Compass,
  ArrowRight,
  MapPin,
  KeyRound,
  Shield,
  Save,
  Sliders,
  Activity,
  TrendingUp,
  Search,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface AuthorityProfileContentProps {
  showSwitchToTourist?: boolean;
}

export function AuthorityProfileContent({ showSwitchToTourist = true }: AuthorityProfileContentProps) {
  const router = useRouter();
  const { loginAs } = useAuth();

  // Admin notification states
  const [capacityAlerts, setCapacityAlerts] = useState(true);
  const [ceaAlerts, setCeaAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [savingAlerts, setSavingAlerts] = useState(false);

  const handleSaveAlerts = () => {
    setSavingAlerts(true);
    setTimeout(() => {
      setSavingAlerts(false);
      toast.success('Emergency alert dispatch preferences updated successfully!');
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Period Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <input
            type="text"
            placeholder="Search authority clearance or parameters..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-card border border-border text-xs text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary shadow-[0_2px_10px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)]"
          />
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border text-xs font-semibold text-primary shadow-[0_2px_10px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)]">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Active Cycle 2026</span>
          </div>

          {showSwitchToTourist && (
            <button
              onClick={() => {
                loginAs('TOURIST');
                toast.info('Switched session to Conscious Tourist mode');
                router.push('/profile');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted hover:bg-frosted-blue/40 text-primary text-xs font-bold transition-all cursor-pointer border border-border"
            >
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span>Switch to Tourist</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Identity Banner */}
      <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar size="lg" className="w-16 h-16 ring-2 ring-ring/20 shadow-sm">
              <AvatarFallback className="bg-primary text-primary-foreground font-heading text-xl font-bold">
                DS
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-overlay-foreground flex items-center justify-center text-primary-foreground" title="Level 3 Clearance">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-primary tracking-tight">Dilhara Senanayake</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/30">
                Clearance Level 3
              </span>
            </div>
            <p className="text-xs font-semibold text-primary mt-0.5">
              Chief Sustainable Tourism Officer &amp; Carrying Capacity Inspector
            </p>
            <p className="text-xs text-primary/60">
              Sri Lanka Tourism Development Authority (SLTDA) • Central Command
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-semibold text-primary/50 block uppercase tracking-wider">Badge Identifier</span>
            <span className="text-xs font-mono font-bold text-primary">SLTDA-ECO-2026-0842</span>
          </div>
        </div>
      </div>

      {/* 4 Kleon Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Enforced Sanctuaries</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-primary tracking-tight">12</span>
              <span className="text-[11px] text-primary font-bold block mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 100% active caps
              </span>
            </div>
            {/* Circular Ring */}
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
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-primary">100%</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Dispersal Bias</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-primary tracking-tight">84%</span>
              <span className="text-[11px] text-primary font-bold block mt-0.5">
                Active rebalancing rate
              </span>
            </div>
            {/* Sparkline */}
            <svg className="w-16 h-8 overflow-visible" viewBox="0 0 60 25">
              <path
                d="M 0 16 Q 15 3, 30 12 T 60 2"
                fill="none"
                stroke="var(--chart-2)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">IoT Telemetry Nodes</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-primary tracking-tight">28</span>
              <span className="text-[11px] text-primary/60 font-semibold block mt-0.5">
                River &amp; gate sensors
              </span>
            </div>
            {/* Mini Bars */}
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 h-4 bg-muted rounded-full" />
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              <div className="w-1.5 h-7 bg-primary rounded-full" />
              <div className="w-1.5 h-8 bg-primary rounded-full" />
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-card p-5 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary/60">Peak Traffic Diverted</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-heading text-3xl font-black text-primary tracking-tight">1,480</span>
              <span className="text-[11px] text-primary font-bold block mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.5% protected
              </span>
            </div>
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--muted)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="var(--chart-2)"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset="18"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-primary">82%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandates & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Delegated Authorities (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-primary">Delegated Mandates &amp; Directives</h2>
                <p className="text-xs text-primary/60">Sri Lanka National Sustainable Tourism Policy 2026</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">Dynamic Rebalancing</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    AUTHORIZED
                  </span>
                </div>
                <p className="text-[11px] text-primary/70 leading-relaxed">
                  Authority to broadcast AI policy weights and divert tourist flows away from saturated hubs like Ella.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">Carrying Capacity Caps</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    AUTHORIZED
                  </span>
                </div>
                <p className="text-[11px] text-primary/70 leading-relaxed">
                  Authority to set and enforce max daily footfall limits across all 12 pilot destination sites.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">Sensor Telemetry Ingestion</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    AUTHORIZED
                  </span>
                </div>
                <p className="text-[11px] text-primary/70 leading-relaxed">
                  Access to live river turbidity, trail gate counters, and air quality telemetry data.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">National Audit Export</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    AUTHORIZED
                  </span>
                </div>
                <p className="text-[11px] text-primary/70 leading-relaxed">
                  Right to generate and publish executive carbon reduction &amp; rural economic audit reports.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Authority Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/tourism-pressure"
              className="p-5 rounded-3xl border border-border bg-card hover:border-primary/60 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary mb-3">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-primary">Pressure Simulator</h3>
                <p className="text-[11px] text-primary/60 mt-1">
                  Model peak surge scenarios and evaluate algorithmic dispersal bias.
                </p>
              </div>
              <div className="mt-3 flex items-center text-[11px] font-bold text-primary gap-1 group-hover:translate-x-1 transition-transform">
                <span>Launch Simulator</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </div>
            </Link>

            <Link
              href="/admin/destinations"
              className="p-5 rounded-3xl border border-border bg-card hover:border-primary/60 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary mb-3">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-primary">Carrying Capacity Caps</h3>
                <p className="text-[11px] text-primary/60 mt-1">
                  Adjust visitor limits and status thresholds for monitored spots.
                </p>
              </div>
              <div className="mt-3 flex items-center text-[11px] font-bold text-primary gap-1 group-hover:translate-x-1 transition-transform">
                <span>Manage Registry</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column (5 cols): Alert Subscriptions & Terminal Security */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency Alert Subscriptions */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-primary">Emergency Subscriptions</h2>
                <p className="text-xs text-primary/60">Automated SLTDA alert channels</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-primary block">Capacity Breach Alerts (&gt;80%)</span>
                  <span className="text-[10px] text-primary/60 block">Instant SMS dispatch during critical surges</span>
                </div>
                <input
                  type="checkbox"
                  checked={capacityAlerts}
                  onChange={(e) => setCapacityAlerts(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-primary block">CEA River Sensor Spikes</span>
                  <span className="text-[10px] text-primary/60 block">Alerts for river turbidity or trail runoff</span>
                </div>
                <input
                  type="checkbox"
                  checked={ceaAlerts}
                  onChange={(e) => setCeaAlerts(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-primary block">Weekly Eco-Dispersal Digest</span>
                  <span className="text-[10px] text-primary/60 block">PDF executive audit emailed Mondays at 8 AM</span>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                onClick={handleSaveAlerts}
                disabled={savingAlerts}
                className="rounded-full px-4 py-2 bg-primary hover:bg-overlay/90 text-primary-foreground text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5 text-primary" />
                <span>{savingAlerts ? 'Saving...' : 'Save Subscriptions'}</span>
              </Button>
            </div>
          </div>

          {/* Security & Terminal Clearance */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_8px_30px_color-mix(in_srgb,var(--shadow-color)_4%,transparent)] space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Terminal Clearance</h3>
                <p className="text-xs text-primary/60">Cryptographic hardware session</p>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                <span className="text-primary/70">Hardware Token</span>
                <span className="font-bold text-primary flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> YubiKey 5C Active
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                <span className="text-primary/70">Clearance Gateway</span>
                <span className="font-bold font-mono text-primary">SLTDA-GW-04</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border">
              <span className="text-[11px] text-primary/60">Rolling 8-hour shift key</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Security key rotation validated.')}
                className="rounded-full text-xs font-semibold gap-1.5 border-border text-primary hover:bg-muted"
              >
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                <span>Rotate Key</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
