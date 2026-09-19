"use client";

import { Compass, Sparkles, HeartHandshake, ShieldCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const WhyCeylonTour = () => {
  const router = useRouter();

  const values = [
    {
      icon: <Compass className="w-6 h-6 text-[#44A6B5]" />,
      title: "Discover Without the Crowds",
      description:
        "Skip packed tourist bottlenecks. We connect you with peaceful, untouched waterfalls, beaches, and tea valleys that offer identical beauty with far fewer crowds.",
      tag: "Crowd-Free Escapes",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-secondary" />,
      title: "Honest, Transparent Reasons",
      description:
        "No hidden sponsor bias or confusing ratings. We clearly explain why each place is recommended—showing real crowd levels, nature conditions, and seasonality.",
      tag: "Clear & Trustworthy",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-primary" />,
      title: "Direct Support to Local Villages",
      description:
        "Your journey makes a real difference. Over 85% of money spent on certified village homestays, meals, and native guides stays directly with Sri Lankan families.",
      tag: "Community-First",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Sustainable & Safe Travel",
      description:
        "Every recommended stay and trail adheres to zero-single-use-plastic and wildlife safety guidelines, ensuring Sri Lanka stays green for generations to come.",
      tag: "Nature-Safe",
    },
  ];

  return (
    <section id="why-us" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A Better Way to Travel</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
          Why Travel With CeylonTour?
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mt-3 font-normal leading-relaxed">
          We believe exploring paradise shouldn’t mean standing in long queues or harming the places we come to admire.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-7 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                {item.icon}
              </div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                {item.tag}
              </span>
              <h3 className="text-lg font-bold font-heading text-foreground mt-1 mb-2.5">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm font-normal leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Friendly Bottom Banner */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-bold font-heading text-foreground">
            Looking for a customized holiday plan?
          </h4>
          <p className="text-sm text-muted-foreground mt-0.5 font-normal">
            Tell our smart trip finder what you love, and let us show you where Sri Lanka shines best.
          </p>
        </div>
        <button
          onClick={() => router.push("/auth")}
          className="inline-flex items-center gap-2 bg-[#44A6B5] hover:bg-[#3993A1] text-white px-6 py-3 rounded-full font-semibold text-sm shadow-md transition-all shrink-0 hover:gap-3"
        >
          <span>Find Your Destination</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};
