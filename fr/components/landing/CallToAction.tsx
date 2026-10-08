"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export const CallToAction = () => {
  const router = useRouter();

  return (
    <section className="w-full py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card via-muted to-accent text-foreground p-8 sm:p-14 md:p-18 border border-border shadow-2xl"
      >
        {/* Ambient Color Glow Rings from Palette */}
        <div className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -top-24 w-[380px] h-[380px] rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-foreground text-xs sm:text-sm font-medium">
            <Compass className="w-4 h-4 text-primary" />
            <span>Start Your Sri Lanka Trip</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight leading-[1.1] text-foreground">
            Ready to Explore Sri Lanka?
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Join other travelers discovering hidden waterfalls, ancient ruins, and quiet villages away from the crowds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-3 w-full justify-center">
            <button
              onClick={() => router.push("/auth")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all hover:-translate-y-0.5 group"
            >
              <span>Find A Destination</span>
              <span className="w-7 h-7 rounded-full bg-primary-foreground/20 group-hover:bg-primary-foreground/30 flex items-center justify-center text-inherit transition-colors">
                <ArrowUpRight size={18} />
              </span>
            </button>

            <button
              onClick={() => router.push("#why-us")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 border border-border text-secondary-foreground font-medium text-base px-8 py-4 rounded-full transition-all"
            >
              <Sparkles size={18} className="text-inherit" />
              <span>Learn Our Approach</span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
