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
      title: "Smart Eco-Planner",
      description:
        "Smart planner that helps you travel green and find hidden gems.",
      icon: <Map className="w-7 h-7" />,
    },
    {
      title: "100% Green Stays",
      description:
        "Handpicked eco-villas and treehouses that use solar energy and no plastic.",
      icon: <Leaf className="w-7 h-7" />,
    },
    {
      title: "Scenic Train Pass",
      description:
        "Instant booking for Sri Lanka's iconic Ella to Kandy mountain train rides and EV transfers.",
      icon: <Train className="w-7 h-7" />,
    },
    {
      title: "Support Locals",
      description:
        "Over 85% of your booking fee goes directly to local hosts and guides.",
      icon: <HeartHandshake className="w-7 h-7" />,
    },
    {
      title: "Verified Local Guides",
      description:
        "Connect with friendly local experts for safe hiking and cultural tours.",
      icon: <ShieldCheck className="w-7 h-7" />,
    },
    {
      title: "Offline Maps",
      description:
        "Use interactive GPS maps for remote treks even when you don't have internet.",
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-primary/15 border border-border dark:border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Features</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight mb-4">
          Everything You Need
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Everything you need to plan, explore, and experience Sri Lanka easily and responsibly.
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
