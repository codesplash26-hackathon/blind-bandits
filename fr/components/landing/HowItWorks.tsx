"use client";

import { Compass, Sparkles, UserCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const HowItWorks = () => {
  const router = useRouter();

  const steps = [
    {
      step: "01",
      icon: <Compass className="w-6 h-6 text-primary" />,
      title: "Choose Your Island Vibe",
      description:
        "Select what moves you: ancient kingdom ruins in Anuradhapura, misty Ceylon tea trails in Ella, or quiet turtle lagoons in Bentota.",
    },
    {
      step: "02",
      icon: <Sparkles className="w-6 h-6 text-secondary" />,
      title: "AI Crafts Your Route",
      description:
        "Our intelligent engine pairs you with certified zero-plastic stays, low-emission train connections, and curated local village hosts.",
    },
    {
      step: "03",
      icon: <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Explore With Local Guardians",
      description:
        "Receive offline trail navigation, digital travel passes, and continuous 24/7 concierge guidance from accredited Sri Lankan experts.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Seamless Travel Process</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
          How Your Sri Lankan Odyssey Works
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mt-3 font-normal leading-relaxed">
          From first inspiration to stepping off the train in Ella, we make ethical travel effortless, transparent, and unforgettable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="relative flex flex-col p-8 rounded-3xl bg-card border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1.5"
          >
            {/* Top Step Number & Icon */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-4xl font-extrabold font-heading text-muted-foreground/30 group-hover:text-primary transition-colors">
                {item.step}
              </span>
              <div className="p-3 rounded-2xl bg-muted/60 group-hover:bg-primary/10 transition-colors">
                {item.icon}
              </div>
            </div>

            <h3 className="text-xl font-bold font-heading text-foreground mb-3 group-hover:text-primary transition-colors">
              {item.title}
            </h3>

            <p className="text-muted-foreground text-sm leading-relaxed font-normal">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <button
          onClick={() => router.push("/auth")}
          className="inline-flex items-center gap-2 text-primary hover:text-secondary font-semibold text-sm transition-colors group"
        >
          <span>Start planning your custom trip today</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
