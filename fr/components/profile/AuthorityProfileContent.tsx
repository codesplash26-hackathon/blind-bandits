'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building,
  CheckCircle2,
  Bell,
  Compass,
  ArrowRight,
  Layers,
  MapPin,
  Lock,
  FileText,
  KeyRound,
  Shield,
  Save,
  Radio,
  Sliders,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 font-bold">Tourism Authority</Badge>
            <span className="text-xs font-mono text-muted-foreground">Clearance Level 3</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Authority Official Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Official credentials, jurisdictional oversight authorizations, and emergency dispatch preferences.
          </p>
        </div>

        {showSwitchToTourist && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loginAs('TOURIST');
              toast.info('Switched session to Conscious Tourist mode');
              router.push('/profile');
            }}
            className="rounded-xl gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Compass className="w-4 h-4 text-primary" />
            <span>Switch to Tourist Profile</span>
          </Button>
        )}
      </div>

      {/* Official Identity Card */}
      <Card className="rounded-3xl border border-border/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-heading text-lg font-bold">
                DS
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Dilhara Senanayake
                </h2>
                <CheckCircle2 className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-xs text-secondary font-semibold">
                Chief Sustainable Tourism Officer &amp; Carrying Capacity Inspector
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sri Lanka Tourism Development Authority (SLTDA)
              </p>
            </div>
          </div>

          <Badge variant="default" className="bg-secondary/15 text-secondary border border-secondary/30 px-3 py-1 font-bold">
            ACTIVE OFFICIAL
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-5 text-xs">
          <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Official Email</span>
            <span className="font-bold text-foreground font-mono">d.senanayake@tourism.gov.lk</span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Badge &amp; License ID</span>
            <span className="font-bold text-foreground font-mono">SLTDA-ECO-2026-0842</span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Operations Center</span>
            <span className="font-bold text-foreground">Central Command, Colombo 03</span>
          </div>
        </div>
      </Card>

      {/* Delegated Authorities & Privileges */}
      <Card className="rounded-3xl border border-border/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-secondary" />
          <h2 className="text-base font-bold text-foreground">Delegated Authority Mandates</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Authorizations granted under the Sri Lanka National Sustainable Tourism Policy 2026.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Dynamic Visitor Rebalancing</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">AUTHORIZED</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Authority to broadcast policy weights and divert tourist traffic from saturated hubs like Ella.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Carrying Capacity Caps</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">AUTHORIZED</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Authority to set and enforce max daily footfall limits across all 12 pilot destination sites.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Sensor Telemetry Ingestion</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">AUTHORIZED</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Access to live river turbidity, trail gate counters, and air quality telemetry data.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">National Dossier Export</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">AUTHORIZED</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Right to generate and publish executive carbon reduction &amp; rural economic audit reports.
            </p>
          </div>
        </div>
      </Card>

      {/* Emergency Alert & Dispatch Subscriptions */}
      <Card className="rounded-3xl border border-border/80 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-secondary" />
          <h2 className="text-base font-bold text-foreground">Emergency Alert Subscriptions</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/70">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Carrying Capacity Breach Alerts (&gt;80%)</span>
              <span className="text-[11px] text-muted-foreground">Instant SMS and mobile push notification when a pilot destination enters critical pressure</span>
            </div>
            <input
              type="checkbox"
              checked={capacityAlerts}
              onChange={(e) => setCapacityAlerts(e.target.checked)}
              className="w-4 h-4 accent-secondary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/70">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Central Environmental Authority (CEA) River Sensor Spikes</span>
              <span className="text-[11px] text-muted-foreground">Webhook alerts for sudden water turbidity or trail waste accumulation</span>
            </div>
            <input
              type="checkbox"
              checked={ceaAlerts}
              onChange={(e) => setCeaAlerts(e.target.checked)}
              className="w-4 h-4 accent-secondary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/70">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Weekly National Eco-Dispersal Executive Digest</span>
              <span className="text-[11px] text-muted-foreground">PDF executive summary emailed every Monday at 08:00 AM IST</span>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-4 h-4 accent-secondary rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            size="sm"
            onClick={handleSaveAlerts}
            disabled={savingAlerts}
            className="rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground"
          >
            <Save className="w-3.5 h-3.5 text-secondary" />
            <span>{savingAlerts ? 'Saving Changes...' : 'Save Notification Preferences'}</span>
          </Button>
        </div>
      </Card>

      {/* Authority Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/destinations"
          className="p-4 rounded-3xl border border-border/80 bg-card hover:bg-muted/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <MapPin className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-xs font-bold text-foreground">Capacity Limits</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Adjust visitor caps for Ella, Mirissa, and Sinharaja.
            </p>
          </div>
          <div className="mt-3 flex items-center text-[11px] font-semibold text-primary gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Manage Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/tourism-pressure"
          className="p-4 rounded-3xl border border-border/80 bg-card hover:bg-muted/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <Sliders className="w-5 h-5 text-secondary mb-2" />
            <h3 className="text-xs font-bold text-foreground">Pressure Simulator</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Model peak surge scenarios and evaluate AI dispersal bias.
            </p>
          </div>
          <div className="mt-3 flex items-center text-[11px] font-semibold text-primary gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Launch Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/analytics"
          className="p-4 rounded-3xl border border-border/80 bg-card hover:bg-muted/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <Layers className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-xs font-bold text-foreground">Impact Analytics</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Review avoided carbon emissions and rural livelihood gains.
            </p>
          </div>
          <div className="mt-3 flex items-center text-[11px] font-semibold text-primary gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>View ROI Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="p-4 rounded-3xl border border-border/80 bg-card hover:bg-muted/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <Lock className="w-5 h-5 text-secondary mb-2" />
            <h3 className="text-xs font-bold text-foreground">Algorithm Settings</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tune diversion threshold parameters and IoT sync cadence.
            </p>
          </div>
          <div className="mt-3 flex items-center text-[11px] font-semibold text-primary gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Configure Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Security & Access Management */}
      <Card className="rounded-3xl border border-border/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-secondary" />
          <h2 className="text-base font-bold text-foreground">Security &amp; Terminal Clearance</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Hardware Token Status</span>
            <span className="font-bold text-secondary flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> FIDO2 / YubiKey 5C Active
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Active Clearance Terminal</span>
            <span className="font-bold text-foreground font-mono">SLTDA-SEC-GW-04 (192.248.32.14)</span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Session Expiration</span>
            <span className="font-bold text-foreground">Rolling 8-Hour Shift Key</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Clearance session logs are maintained per Sri Lanka Electronic Transactions Act.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Security key rotation validated. Session timestamp renewed.')}
            className="rounded-xl text-xs gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            <span>Rotate Key Token</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
