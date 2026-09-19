"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, HeartHandshake, Leaf, ArrowRight, CheckCircle2 } from "lucide-react";
import experienceImg from "@/public/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg";

export const ExperienceStory = () => {
  const router = useRouter();

  const benefits = [
    {
      icon: <HeartHandshake className="w-5 h-5 text-secondary" />,
      title: "Direct Community Co-ops (85% Retention)",
      description:
        "Every rupee spent on homestays, trail permits, and village excursions goes directly to local families, village schools, and rural forest conservation.",
    },
    {
      icon: <Leaf className="w-5 h-5 text-secondary" />,
      title: "Zero-Plastic & Bio-Certified Lodges",
      description:
        "Rest in curated treehouses, mountain glamping, and heritage colonial bungalows committed to solar energy, rainwater harvesting, and organic farm-to-table cuisine.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-secondary" />,
      title: "Certified Naturalist & Wildlife Guardians",
      description:
        "Explore alongside licensed environmentalists who respect wildlife corridors in Yala and Wilpattu, prioritizing animal safety over crowded safari jeeps.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Visual Column with Floating Glass Badges */}
        <div className="lg:col-span-6 relative">
          {/* Main Visual Image */}
          <div className="relative h-[420px] sm:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border border-border/80">
            <Image
              src={experienceImg}
              alt="Sri Lanka tea plantation and scenic railway"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Embedded Bottom Image Caption */}
            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
              <span className="text-xs uppercase tracking-widest text-[#B2D5E2] font-semibold">
                Central Highlands
              </span>
              <p className="font-heading text-lg font-bold">
                Misty Pine Trails of Ella & Nine Arch Viaduct
              </p>
            </div>
          </div>

          {/* Floating Glass Badge 1 - Top Right */}
          <div className="absolute -top-6 -right-4 sm:-right-6 bg-card/90 backdrop-blur-xl border border-border/80 p-4 rounded-2xl shadow-xl hidden sm:flex items-center gap-3 z-20">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Footprint</p>
              <p className="text-sm font-bold text-foreground">100% Carbon Neutral</p>
            </div>
          </div>

          {/* Floating Glass Badge 2 - Bottom Left */}
          <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-card/90 backdrop-blur-xl border border-border/80 p-4 rounded-2xl shadow-xl hidden sm:flex items-center gap-3 z-20">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Local Impact</p>
              <p className="text-sm font-bold text-foreground">85% Retained in Sri Lanka</p>
            </div>
          </div>
        </div>

        {/* Right Editorial Story Column */}
        <div className="lg:col-span-6 flex flex-col justify-center gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>The Ceylon Tour Promise</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight leading-[1.15]">
            Rethinking How We Experience the Pearl of the Indian Ocean
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg font-normal leading-relaxed">
            Mass tourism often leaves local cultures overwhelmed and fragile ecosystems degraded. We built Ceylon Tour as a smarter alternative: connecting curious travelers directly with grassroots hosts who protect this island paradise.
          </p>

          <div className="flex flex-col gap-5 mt-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-primary/40 transition-colors">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-heading text-base font-bold text-foreground">
                    {benefit.title}
                  </h4>
                  <p className="text-muted-foreground text-sm font-normal mt-1 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3">
            <button
              onClick={() => router.push("/auth")}
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-3.5 rounded-full font-semibold text-sm shadow-md transition-all hover:gap-4"
            >
              <span>Explore The Sustainable Manifesto</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
