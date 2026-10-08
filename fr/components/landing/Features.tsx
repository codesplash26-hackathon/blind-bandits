"use client";

import { cn } from "@/lib/utils";
import {
  Map,
  Leaf,
  Train,
  HeartHandshake,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";
import { Compass, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const Features = () => {
   const router = useRouter();
  const features = [
    {
      title: "Crowd-Free Escapes",
      description:
        "Skip packed tourist bottlenecks. We connect you with peaceful, untouched waterfalls, beaches, and tea valleys that offer identical beauty with far fewer crowds.",
      icon: <Map className="w-7 h-7" />,
    },
    {
      title: "Clear & Trustworthy",
      description:
        "No hidden sponsor bias or confusing ratings. We clearly explain why each place is recommended—showing real crowd levels, nature conditions, and seasonality.",
      icon: <Leaf className="w-7 h-7" />,
    },
    {
      title: "Community-First",
      description:
        "Your journey makes a real difference. Over 85% of money spent on certified village homestays, meals, and native guides stays directly with Sri Lankan families.",
      icon: <Train className="w-7 h-7" />,
    },
    {
      title: "Nature-Safe",
      description:
        "We prioritize the safety and well-being of both travelers and the environment. Every recommended stay and trail adheres to zero-single-use-plastic and wildlife safety guidelines, ensuring Sri Lanka stays green for generations to come.Over 85% of your booking fee goes directly to local hosts and guides.",
      icon: <HeartHandshake className="w-7 h-7" />,
    },
  ];

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 md:px-12 w-full max-w-7xl mx-auto">
      <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-primary/15 border border-border dark:border-primary/30 text-foreground text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A Better Way to Travel</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight mb-4">
          Why Travel With CeylonTour?
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          We believe exploring paradise shouldn’t mean standing in long queues or harming the fragile places we come to admire.
        </p>
      </div>

      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 relative z-10 rounded-3xl overflow-hidden bg-card border border-border shadow-md">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>

      {/* Friendly Bottom Banner with Scroll Animation */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-14 p-6 sm:p-9 rounded-3xl bg-muted/70 border border-border/80 dark:border-border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative z-10"
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
    </div>
  );
};

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-8 relative group/feature border-border transition-colors duration-200 hover:bg-muted/40",
        (index === 0 || index === 4) && "lg:border-l border-border",
        index < 4 && "lg:border-b border-border",
      )}
    >
      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-primary/5 pointer-events-none" />
      <div className="mb-4 relative z-10 px-8 text-primary p-3 rounded-2xl w-fit ml-8 bg-primary/10 group-hover/feature:bg-primary group-hover/feature:text-primary-foreground transition-all duration-300">
        {icon}
      </div>
      <div className="font-title-lg text-lg font-bold mb-2 relative z-10 px-8">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-border group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-1 transition duration-200 inline-block text-foreground font-heading">
          {title}
        </span>
      </div>
      <p className="text-muted-foreground text-sm font-normal leading-relaxed relative z-10 px-8">
        {description}
      </p>
    </div>
  );
};
