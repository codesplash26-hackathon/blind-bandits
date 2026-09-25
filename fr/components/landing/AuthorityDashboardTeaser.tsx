"use client";

import { Shield, BarChart3, AlertCircle, CheckCircle, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const AuthorityDashboardTeaser = () => {
  const router = useRouter();

  return (
    <section id="sustainability" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="rounded-3xl bg-card border border-border/80 p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Context */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider w-fit">
              <Shield className="w-3.5 h-3.5" />
              <span>Institutional Decision Support</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold font-heading text-foreground tracking-tight leading-tight">
              One System, Two Audiences: National Tourism Monitoring
            </h3>

            <p className="text-muted-foreground text-sm sm:text-base font-normal leading-relaxed">
              While travelers receive transparent, explainable recommendations, the Sri Lanka Tourism Development Authority (SLTDA) and regional officials gain a live national view of visitor density across all 15+ monitored zones.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3 rounded-2xl bg-success/10 border border-success/20 text-center">
                <span className="text-2xl font-black text-success">7</span>
                <p className="text-[11px] font-semibold text-success mt-0.5">
                  Low Pressure Zones
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-warning/10 border border-warning/20 text-center">
                <span className="text-2xl font-black text-warning">5</span>
                <p className="text-[11px] font-semibold text-warning mt-0.5">
                  Medium Pressure
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-center">
                <span className="text-2xl font-black text-destructive">3</span>
                <p className="text-[11px] font-semibold text-destructive mt-0.5">
                  High Risk (Alert)
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push("/auth")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors group"
              >
                <span>Access Authority Portal & Analytics</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Live Simulated Authority Monitor Card */}
          <div className="lg:col-span-6 bg-muted/40 border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-foreground">SLTDA National Pressure Feed</span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground bg-card px-2.5 py-1 rounded-full border border-border">
                Live Month: September
              </span>
            </div>

            {/* List of High Pressure Hotspots */}
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-xl border border-destructive/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    <strong className="text-xs text-foreground">Ella Mountain Corridor</strong>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Carrying capacity exceeded by 210%</p>
                </div>
                <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                  82% Risk
                </span>
              </div>

              <div className="p-3 bg-card rounded-xl border border-destructive/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    <strong className="text-xs text-foreground">Sigiriya Rock Sanctuary</strong>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Peak bottleneck at lion paw stairwell</p>
                </div>
                <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                  79% Risk
                </span>
              </div>

              <div className="p-3 bg-card rounded-xl border border-destructive/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    <strong className="text-xs text-foreground">Yala Block 1 Safari Trail</strong>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Jeep congestion near waterhole tracks</p>
                </div>
                <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                  74% Risk
                </span>
              </div>
            </div>

            {/* Recommended Action Alert Box (Proposal 3.2.8) */}
            <div className="mt-4 p-3 bg-primary/10 border border-primary/25 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground leading-relaxed">
                <strong>System Action:</strong> Active diversion routing in effect. Diverting 42% of incoming itinerary searches toward Belihuloya, Meemure, and Haputale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
