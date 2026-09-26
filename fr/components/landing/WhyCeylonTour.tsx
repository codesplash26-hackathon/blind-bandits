"use client";

import { motion } from "motion/react";
import { Compass, Sparkles, HeartHandshake, ShieldCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const WhyCeylonTour = () => {
  const router = useRouter();

  const values = [
    {
      icon: <Compass className="w-6 h-6 text-primary dark:text-secondary" />,
      title: "Discover Without the Crowds",
      description:
        "Skip packed tourist bottlenecks. We connect you with peaceful, untouched waterfalls, beaches, and tea valleys that offer identical beauty with far fewer crowds.",
      tag: "Crowd-Free Escapes",
      borderAccent: "hover:border-primary/60 hover:shadow-primary/10",
      tagColor: "text-primary dark:text-secondary bg-primary/15 dark:bg-primary/25 border-primary/30 dark:border-primary/50",
      iconBg: "bg-primary/15 dark:bg-primary/25 text-primary dark:text-secondary",
      gradientBg: "from-primary/5 to-transparent",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary dark:text-secondary" />,
      title: "Honest, Transparent Reasons",
      description:
        "No hidden sponsor bias or confusing ratings. We clearly explain why each place is recommended—showing real crowd levels, nature conditions, and seasonality.",
      tag: "Clear & Trustworthy",
      borderAccent: "hover:border-primary/60 hover:shadow-primary/10",
      tagColor: "text-primary dark:text-secondary bg-primary/15 dark:bg-primary/25 border-primary/25 dark:border-primary/50",
      iconBg: "bg-primary/15 dark:bg-primary/25 text-primary dark:text-secondary",
      gradientBg: "from-primary/5 to-transparent",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-primary dark:text-secondary" />,
      title: "Direct Support to Local Villages",
      description:
        "Your journey makes a real difference. Over 85% of money spent on certified village homestays, meals, and native guides stays directly with Sri Lankan families.",
      tag: "Community-First",
      borderAccent: "hover:border-primary/60 hover:shadow-primary/10",
      tagColor: "text-primary dark:text-secondary bg-frosted-blue/30 dark:bg-primary/25 border-border/40 dark:border-primary/50",
      iconBg: "bg-primary/10 dark:bg-primary/25 text-primary dark:text-secondary",
      gradientBg: "from-frosted-blue/10 dark:from-primary/5 to-transparent",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-success" />,
      title: "Sustainable & Safe Travel",
      description:
        "Every recommended stay and trail adheres to zero-single-use-plastic and wildlife safety guidelines, ensuring Sri Lanka stays green for generations to come.",
      tag: "Nature-Safe",
      borderAccent: "hover:border-success/60 hover:shadow-success/10",
      tagColor: "text-success bg-success/15 dark:bg-success/25 border-success/30 dark:border-success/50",
      iconBg: "bg-success/15 dark:bg-success/25 text-success",
      gradientBg: "from-success/5 to-transparent",
    },
  ];

  return (
    <section id="why-us" className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full relative">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-frosted-blue/10 dark:bg-muted/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Scroll Fade */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-2xl mx-auto mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 dark:bg-primary/25 border border-primary/25 dark:border-primary/50 text-primary dark:text-secondary text-xs font-bold uppercase tracking-wider mb-3.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A Better Way to Travel</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
          Why Travel With CeylonTour?
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mt-3.5 font-normal leading-relaxed">
          We believe exploring paradise shouldn’t mean standing in long queues or harming the fragile places we come to admire.
        </p>
      </motion.div>

      {/* Staggered Cards on Scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {values.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: idx * 0.12, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className={`flex flex-col justify-between p-7 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${item.borderAccent}`}
          >
            {/* Ambient Card Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${item.gradientBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {item.icon}
              </div>

              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.tagColor} inline-block mb-3`}>
                {item.tag}
              </span>

              <h3 className="text-lg font-bold font-heading text-foreground mb-2.5 group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              <p className="text-muted-foreground text-sm font-normal leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Friendly Bottom Banner with Scroll Animation */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-14 p-6 sm:p-9 rounded-3xl bg-muted/70 dark:bg-gradient-to-r dark:from-muted dark:via-primary dark:to-muted border border-border/80 dark:border-border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative z-10"
      >
        <div>
          <h4 className="text-lg sm:text-xl font-bold font-heading text-foreground">
            Looking for a customized holiday plan?
          </h4>
          <p className="text-sm text-muted-foreground mt-1 font-normal max-w-xl">
            Tell our smart trip planner what you love, and let us show you where Sri Lanka shines best.
          </p>
        </div>
        <button
          onClick={() => router.push("/auth")}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-7 py-3.5 rounded-full text-sm shadow-md hover:shadow-lg transition-all shrink-0 hover:gap-3 group"
        >
          <span>Find Your Destination</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </section>
  );
};
