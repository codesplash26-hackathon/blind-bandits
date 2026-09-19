"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, HeartHandshake, Leaf, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import ellaImg from "@/public/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg";
import sigiriyaImg from "@/public/poswiecie-sigiriya-459197_1920.jpg";

export const ExperienceStory = () => {
  const router = useRouter();

  const benefits = [
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#44A6B5]" />,
      title: "Direct Community Co-ops (85% Retention)",
      description:
        "Every rupee spent on certified homestays, trail permits, and village excursions stays directly with local families, village schools, and native guides.",
      badge: "Local First",
    },
    {
      icon: <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: "Zero-Plastic & Bio-Certified Sanctuaries",
      description:
        "Rest in handpicked mountain glamping, river treehouses, and heritage colonial bungalows committed to solar power, rainwater harvesting, and organic dining.",
      badge: "Eco-Verified",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#004554] dark:text-[#B2D5E2]" />,
      title: "Accredited Wildlife & Cultural Guardians",
      description:
        "Explore alongside licensed environmentalists who protect natural elephant and leopard corridors, prioritizing animal welfare and ancient heritage preservation.",
      badge: "Certified Guides",
    },
  ];

  return (
    <section className="w-full bg-muted/60 dark:bg-[#00252E] border-y border-border/80 dark:border-[#003F4C] py-20 md:py-28 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-1/2 left-10 w-[500px] h-[500px] bg-[#B2D5E2]/25 dark:bg-[#004554]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#44A6B5]/15 dark:bg-[#44A6B5]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left Visual Multi-Layer Collage */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="lg:col-span-6 relative pb-10 sm:pb-14 pr-0 sm:pr-8"
        >
          {/* Main Visual Image - Misty Ella */}
          <div className="relative h-[380px] sm:h-[460px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 group">
            <Image
              src={ellaImg}
              alt="Sri Lanka misty highlands and scenic railway"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Embedded Bottom Image Caption */}
            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
              <span className="text-[11px] uppercase tracking-widest text-[#B2D5E2] font-semibold">
                Central Highlands
              </span>
              <p className="font-heading text-lg sm:text-xl font-bold">
                Misty Pine Trails & Nine Arch Viaduct, Ella
              </p>
            </div>
          </div>

          {/* Overlapping Secondary Image - Sigiriya Rock */}
          <div className="absolute -bottom-2 right-0 sm:right-2 w-44 sm:w-56 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-card dark:border-[#003541] hidden sm:block group">
            <Image
              src={sigiriyaImg}
              alt="Sigiriya ancient rock fortress in Sri Lanka"
              fill
              sizes="224px"
              className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-2.5 left-3 text-[10px] font-bold text-white uppercase tracking-wider">
              Sigiriya Citadel
            </span>
          </div>

          {/* Floating Frosted Glass Badge - Top Left */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute -top-5 -left-3 sm:-left-6 bg-card/90 backdrop-blur-xl border border-border/80 p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3 z-20"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Environmental Care</p>
              <p className="text-xs sm:text-sm font-bold text-foreground">100% Zero Single-Use Plastic</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Editorial Story Column */}
        <motion.div
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="lg:col-span-6 flex flex-col justify-center gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 dark:bg-primary/20 border border-primary/25 dark:border-primary/40 text-primary text-xs font-bold uppercase tracking-wider w-fit shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>The CeylonTour Standard</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight leading-[1.15]">
            Rethinking How We Experience the Pearl of the Indian Ocean
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg font-normal leading-relaxed">
            Mass tourism often leaves delicate ecosystems overwhelmed and visitors stuck in congested queues. We built CeylonTour to connect conscious travelers directly with grassroots hosts who protect this island paradise.
          </p>

          <div className="flex flex-col gap-4 mt-1">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border/70 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary group-hover:bg-primary/25 transition-colors shrink-0 mt-0.5">
                  {benefit.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-base font-bold text-foreground">
                      {benefit.title}
                    </h4>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted dark:bg-[#003844] text-muted-foreground dark:text-[#B2D5E2] border border-border/50 dark:border-[#004D5C]">
                      {benefit.badge}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm font-normal mt-1 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => router.push("/auth")}
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-7 py-3.5 rounded-full font-bold text-sm shadow-md hover:shadow-xl transition-all hover:gap-4 group"
            >
              <span>Explore The Sustainable Manifesto</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
};
