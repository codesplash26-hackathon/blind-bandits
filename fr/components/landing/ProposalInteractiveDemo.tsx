"use client";

import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Info,
  Leaf,
  Users,
  Building,
  Compass,
  Scale,
} from "lucide-react";

export const ProposalInteractiveDemo = () => {
  const [activeTab, setActiveTab] = useState<"xai" | "overtourism" | "simulator">("xai");

  // Simulator Sliders State
  const [visitors, setVisitors] = useState(4500); // 1,000 to 15,000
  const [wasteMgmt, setWasteMgmt] = useState(85); // 0 to 100%
  const [infraLevel, setInfraLevel] = useState(80); // 0 to 100%

  // Dynamic simulation formula based on weights
  // Score drops with high visitors, rises with waste & infra
  const visitorPenalty = Math.max(0, ((visitors - 2000) / 10000) * 40);
  const calculatedScore = Math.min(
    98,
    Math.max(35, Math.round(92 - visitorPenalty + (wasteMgmt - 50) * 0.15 + (infraLevel - 50) * 0.12))
  );

  return (
    <section id="demo" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable AI Engine Preview</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
          How CeylonTour Rebalances Travel
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mt-3 font-normal leading-relaxed">
          Explore our core AI features: transparent 5-factor scoring, explainable contributions, and real-time overtourism risk diversion.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-muted rounded-full w-fit mx-auto border border-border">
          <button
            onClick={() => setActiveTab("xai")}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "xai"
                ? "bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1. 5-Factor XAI Score
          </button>
          <button
            onClick={() => setActiveTab("overtourism")}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "overtourism"
                ? "bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            2. Overtourism & Swap
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "simulator"
                ? "bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            3. What-If Simulator
          </button>
        </div>
      </div>

      {/* Tab 1: 5-Factor Sustainability Index & XAI Explanation Panel */}
      {activeTab === "xai" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-card rounded-3xl p-6 sm:p-10 border border-border/80 shadow-lg">
          {/* Left Column: Recommendation Result */}
          <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border pb-8 lg:pb-0 lg:pr-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" /> Top Sustainable Match
              </span>
              <h3 className="text-3xl font-bold font-heading text-foreground">
                Belihuloya Sanctuary
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Sabaragamuwa Province • Nature & Trekking
              </p>
            </div>

            {/* Sustainability Score Gauge */}
            <div className="my-8 flex items-center gap-6 p-5 rounded-2xl bg-muted/50 border border-border/60">
              <div className="relative w-24 h-24 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center shadow-md">
                <span className="text-3xl font-extrabold font-heading">91</span>
                <span className="text-[10px] uppercase font-semibold text-primary-foreground/80">
                  out of 100
                </span>
              </div>
              <div>
                <p className="font-bold text-foreground text-base">
                  Sustainability Score
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Transparent composite index based on 5 verified environmental and community factors.
                </p>
              </div>
            </div>

            {/* 5 Factors Summary */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Environmental Condition
                </span>
                <strong className="text-foreground font-semibold">92 / 100</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-3.5 h-3.5 text-primary" /> Community Benefit
                </span>
                <strong className="text-foreground font-semibold">88 / 100</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Scale className="w-3.5 h-3.5 text-secondary" /> Crowd Level (Low Pressure)
                </span>
                <strong className="text-foreground font-semibold">91 / 100</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Building className="w-3.5 h-3.5 text-amber-500" /> Infrastructure
                </span>
                <strong className="text-foreground font-semibold">76 / 100</strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Compass className="w-3.5 h-3.5 text-blue-500" /> Tourist Suitability
                </span>
                <strong className="text-foreground font-semibold">90 / 100</strong>
              </div>
            </div>
          </div>

          {/* Right Column: XAI Explanation Panel (Proposal 3.2.3) */}
          <div className="lg:col-span-7 flex flex-col justify-between pl-0 lg:pl-4">
            <div>
              <div className="flex items-center gap-2 text-secondary mb-2">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  XAI Explanation Layer
                </span>
              </div>
              <h4 className="text-2xl font-bold font-heading text-foreground">
                Why was Belihuloya Recommended?
              </h4>
              <p className="text-muted-foreground text-sm mt-1">
                The system never provides a recommendation without a reason. Contributions to the Sustainability Score are computed directly from published index weights.
              </p>
            </div>

            {/* Factor Contribution Bars (Table 2 in Proposal) */}
            <div className="space-y-4 my-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-foreground">Environmental Sustainability</span>
                  <span className="text-primary font-bold">32% Contribution</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "32%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-foreground">Low Visitor Pressure (Crowd Relief)</span>
                  <span className="text-primary font-bold">25% Contribution</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "25%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-foreground">Community Benefit (Local Retention)</span>
                  <span className="text-primary font-bold">20% Contribution</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "20%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-foreground">Tourist Suitability & Safety</span>
                  <span className="text-primary font-bold">13% Contribution</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "13%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-foreground">Infrastructure & Accessibility</span>
                  <span className="text-primary font-bold">10% Contribution</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "10%" }} />
                </div>
              </div>
            </div>

            {/* Plain English XAI Summary Sentence */}
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/25 text-xs sm:text-sm text-foreground leading-relaxed">
              <strong>Plain Language Explanation:</strong> &quot;Belihuloya was selected because pristine forest cover (32%) and exceptionally low visitor crowding (25%) protect biodiversity, while 88% of accommodation spend stays directly with native homestay operators.&quot;
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Overtourism Risk & Alternative Suggestion (Proposal 3.2.4 & 3.2.5) */}
      {activeTab === "overtourism" && (
        <div className="bg-card rounded-3xl p-6 sm:p-10 border border-border/80 shadow-lg">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Smart Diversion Engine
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mt-1">
              Mitigating Hotspot Congestion with Intelligent Alternatives
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              When a traveler plans a visit to an overcrowded destination, CeylonTour flags visitor pressure and suggests high-similarity, low-impact alternatives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Selected Congested Destination: Ella */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border-2 border-red-500/40 bg-red-500/5 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                  ⚠️ High Overtourism Risk
                </span>
                <span className="text-2xl font-black text-red-600 dark:text-red-400">82%</span>
              </div>

              <div>
                <h4 className="text-xl font-bold text-foreground font-heading">Ella Central Highlands</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Overcrowded peak season • Severe traffic & trail erosion
                </p>

                {/* Risk Breakdown Bars (Proposal 3.2.4) */}
                <div className="space-y-2.5 my-5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Visitor Density</span>
                      <strong className="text-red-500">40%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Infrastructure Pressure</span>
                      <strong className="text-red-500">25%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Waste Management Strain</span>
                      <strong className="text-red-500">20%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "20%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-500/10 rounded-xl text-xs text-red-600 dark:text-red-300">
                <strong>Impact Alert:</strong> Carrying capacity exceeded by 210%. Extended wait times at Nine Arch Bridge.
              </div>
            </div>

            {/* Smart Suggested Alternative: Belihuloya & Haputale */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  🌿 Recommended Alternative (76% Similarity)
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">28% Low Risk</span>
              </div>

              <div>
                <h4 className="text-xl font-bold text-foreground font-heading">Belihuloya River Foothills</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  1.5 hrs from Ella • Identical misty mountain & river scenery
                </p>

                <div className="space-y-2 my-5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Same landscape type, waterfalls & pine hiking paths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>68% fewer crowds for a peaceful, immersive experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Direct financial impact to rural Sabaragamuwa hosts</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                <strong>Alternative XAI Summary:</strong> &quot;Belihuloya provides a similar high-altitude nature experience with 68% lower estimated tourism pressure.&quot;
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: What-If Simulator (Proposal 3.2.6) */}
      {activeTab === "simulator" && (
        <div className="bg-card rounded-3xl p-6 sm:p-10 border border-border/80 shadow-lg">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Decision Support System
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mt-1">
              Interactive What-If Scenario Simulator
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Simulate how tourist arrival surges and environmental infrastructure upgrades directly shift destination sustainability scores in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Area */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider 1: Expected Monthly Visitors */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Expected Monthly Visitors
                  </label>
                  <span className="text-sm font-bold text-foreground">
                    {visitors.toLocaleString()} visitors
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={visitors}
                  onChange={(e) => setVisitors(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>1,000 (Low Pressure)</span>
                  <span>15,000 (Overtourism Surge)</span>
                </div>
              </div>

              {/* Slider 2: Waste Management & Renewable Energy */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-500" /> Waste & Renewable Energy Score
                  </label>
                  <span className="text-sm font-bold text-foreground">{wasteMgmt}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={wasteMgmt}
                  onChange={(e) => setWasteMgmt(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>20% (Inadequate Waste Facilities)</span>
                  <span>100% (Zero-Waste Certified)</span>
                </div>
              </div>

              {/* Slider 3: Transport & Trail Infrastructure */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-secondary" /> Infrastructure & EV Capacity
                  </label>
                  <span className="text-sm font-bold text-foreground">{infraLevel}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={infraLevel}
                  onChange={(e) => setInfraLevel(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>20% (Congested Roads)</span>
                  <span>100% (High-Capacity Green Transport)</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Gauge */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-muted/30 border border-border flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">
                Simulated Sustainability Score
              </span>

              <div
                className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center my-2 transition-all ${
                  calculatedScore >= 75
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : calculatedScore >= 55
                    ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                <span className="text-4xl font-black font-heading">{calculatedScore}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Score / 100</span>
              </div>

              <p className="text-xs font-semibold text-foreground mt-2">
                {calculatedScore >= 75
                  ? "✅ Sustainable Balance Maintained"
                  : calculatedScore >= 55
                  ? "⚠️ Approaching Critical Capacity Limits"
                  : "🚨 Severe Overtourism Warning"}
              </p>

              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs">
                {visitors > 9000
                  ? "Increased visitor pressure significantly reduces the sustainability score. Promotion of alternative destinations is recommended."
                  : "Controlled visitor numbers combined with strong waste management preserves ecological stability."}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
