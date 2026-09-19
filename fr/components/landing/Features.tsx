"use client";

import { cn } from "@/lib/utils";
import {
  Map,
  Leaf,
  Train,
  HeartHandshake,
  ShieldCheck,
  WifiOff,
  Sparkles,
  Utensils,
} from "lucide-react";

export const Features = () => {
  const features = [
    {
      title: "AI Eco-Route Planner",
      description:
        "Smart itinerary builder optimizing routes to minimize travel emissions and discover hidden gems.",
      icon: <Map className="w-7 h-7" />,
    },
    {
      title: "100% Eco Stays",
      description:
        "Handpicked eco-villas, jungle lodges, and treehouses certified for zero plastic & solar energy.",
      icon: <Leaf className="w-7 h-7" />,
    },
    {
      title: "Scenic Train Pass",
      description:
        "Instant booking for Sri Lanka's iconic Ella to Kandy mountain train rides and EV transfers.",
      icon: <Train className="w-7 h-7" />,
    },
    {
      title: "Community Direct Impact",
      description:
        "Over 85% of your trip booking fees go directly to local rural hosts, guides, and conservationists.",
      icon: <HeartHandshake className="w-7 h-7" />,
    },
    {
      title: "24/7 Verified Guide Grid",
      description:
        "Access licensed local experts for safe hiking, wildlife safaris, and cultural immersion.",
      icon: <ShieldCheck className="w-7 h-7" />,
    },
    {
      title: "Offline Trail Navigation",
      description:
        "Interactive GPS maps for remote treks in Knuckles Mountain Range & Devil's Staircase without internet.",
      icon: <WifiOff className="w-7 h-7" />,
    },
    {
      title: "Authentic Food Tours",
      description:
        "Experience traditional village cooking classes, spice garden visits, and organic tea tastings.",
      icon: <Utensils className="w-7 h-7" />,
    },
    {
      title: "Custom Wildlife Safaris",
      description:
        "Ethical leopard, elephant, and blue whale watching tours guided by certified naturalists.",
      icon: <Sparkles className="w-7 h-7" />,
    },
  ];

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 md:px-12 w-full max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#004554]/10 dark:bg-[#44A6B5]/15 border border-[#004554]/20 dark:border-[#44A6B5]/30 text-[#004554] dark:text-[#44A6B5] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Travel Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight mb-4">
          Core Platform Features
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Everything you need to plan, explore, and experience Sri Lanka authentically, responsibly, and effortlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 relative z-10 rounded-3xl overflow-hidden bg-card border border-border shadow-md">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
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
