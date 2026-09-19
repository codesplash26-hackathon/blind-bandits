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
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#004554] via-[#002D37] to-[#00171D] text-white p-8 sm:p-14 md:p-18 border border-white/15 shadow-2xl"
      >
        {/* Ambient Color Glow Rings from Palette */}
        <div className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full bg-[#44A6B5]/25 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -top-24 w-[380px] h-[380px] rounded-full bg-[#B2D5E2]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium">
            <Compass className="w-4 h-4 text-[#44A6B5]" />
            <span>Begin Your Sri Lankan Odyssey</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight leading-[1.1] text-white drop-shadow-md">
            Ready to Explore the Unseen Trails of Ceylon?
          </h2>

          <p className="text-[#E9F1F6]/90 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Join conscious travelers discovering hidden waterfalls, ancient ruins, and quiet village retreats without the crowds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-3 w-full justify-center">
            <button
              onClick={() => router.push("/auth")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#44A6B5] hover:bg-[#3993A1] text-white font-semibold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all hover:-translate-y-0.5 group"
            >
              <span>Find A Destination</span>
              <span className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                <ArrowUpRight size={18} />
              </span>
            </button>

            <button
              onClick={() => router.push("#why-us")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-base px-8 py-4 rounded-full transition-all"
            >
              <Sparkles size={18} className="text-[#B2D5E2]" />
              <span>Learn Our Approach</span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
