"use client";

import { motion } from "motion/react";
import { Compass, Sparkles, UserCheck, ArrowRight, ArrowRightLeft, Shield, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export const HowItWorks = () => {
  const router = useRouter();

  const steps = [
    {
      step: "01",
      icon: <Compass className="w-6 h-6 text-[#44A6B5]" />,
      title: "Choose Your Island Vibe",
      description:
        "Select what moves you: ancient kingdom ruins, misty Ceylon tea trails, or quiet river valleys away from crowds.",
      color: "from-[#44A6B5]/20 to-transparent",
      accent: "text-[#44A6B5]",
      previewBadge: (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border/60">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#44A6B5]/10 text-[#44A6B5] border border-[#44A6B5]/20">
            ⛰️ Tea Trails
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted dark:bg-[#003844]/60 text-muted-foreground dark:text-[#B2D5E2] border border-transparent dark:border-[#004D5C]/40">
            🏰 Ancient Ruins
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted dark:bg-[#003844]/60 text-muted-foreground dark:text-[#B2D5E2] border border-transparent dark:border-[#004D5C]/40">
            🌊 Secret Lagoons
          </span>
        </div>
      ),
    },
    {
      step: "02",
      icon: <Sparkles className="w-6 h-6 text-[#004554] dark:text-[#B2D5E2]" />,
      title: "Smart Crowd Diversion",
      description:
        "When famous hotspots exceed capacity, our engine instantly highlights peaceful, equally stunning alternatives nearby.",
      color: "from-[#004554]/15 dark:from-[#B2D5E2]/15 to-transparent",
      accent: "text-[#004554] dark:text-[#B2D5E2]",
      previewBadge: (
        <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-muted/50 dark:bg-[#00222B] border border-border/80 dark:border-[#003F4C] text-[11px]">
          <span className="font-semibold text-red-500 dark:text-red-400">Ella (82% 🔴)</span>
          <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Belihuloya (28% 🟢)</span>
        </div>
      ),
    },
    {
      step: "03",
      icon: <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Explore With Native Guardians",
      description:
        "Travel with peace of mind. Every journey is paired with certified local village guides, fair wages, and digital eco passes.",
      color: "from-emerald-500/15 to-transparent",
      accent: "text-emerald-600 dark:text-emerald-400",
      previewBadge: (
        <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">Verified Eco Pass • 85% Local Retention</span>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full relative">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#004554]/10 dark:bg-[#44A6B5]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 max-w-2xl mx-auto relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 dark:bg-primary/20 border border-primary/25 dark:border-primary/40 text-primary text-xs font-bold uppercase tracking-wider mb-3.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Seamless Travel Process</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
          How Your Sri Lankan Odyssey Works
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mt-3.5 font-normal leading-relaxed">
          From first inspiration to stepping off the train into misty pine hills, we make conscious travel effortless, transparent, and unforgettable.
        </p>
      </motion.div>

      {/* 3 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {steps.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: idx * 0.15, ease: "easeOut" }}
            whileHover={{ y: -8 }}
            className="relative flex flex-col justify-between p-8 sm:p-9 rounded-3xl bg-card border border-border/80 shadow-md hover:shadow-2xl transition-all duration-300 group overflow-hidden"
          >
            {/* Ambient Card Header Gradient */}
            <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${item.color} opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            <div>
              {/* Top Step Number & Icon */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <span className={`text-4xl sm:text-5xl font-extrabold font-heading ${item.accent} opacity-85`}>
                  {item.step}
                </span>
                <div className="p-3.5 rounded-2xl bg-muted/60 dark:bg-[#003844]/50 border border-border/80 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold font-heading text-foreground mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Interactive Preview Badge on each card */}
            <div className="relative z-10">
              {item.previewBadge}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-14 relative z-10"
      >
        <button
          onClick={() => router.push("/auth")}
          className="inline-flex items-center gap-2.5 text-primary hover:text-primary/80 font-bold text-sm sm:text-base transition-colors group"
        >
          <span>Start planning your custom trip today</span>
          <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
        </button>
      </motion.div>
    </section>
  );
};
