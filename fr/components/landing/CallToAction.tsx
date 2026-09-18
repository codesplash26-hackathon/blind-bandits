"use client";

import { ArrowUpRight, Compass, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export const CallToAction = () => {
  const router = useRouter();

  return (
    <section className="w-full py-12 md:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#002D37] via-[#004554] to-[#001D24] text-white p-8 sm:p-12 md:p-16 border border-white/10 shadow-2xl">
        {/* Background Decorative Rings */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#44A6B5]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-[#B2D5E2]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium">
            <Compass className="w-4 h-4 text-[#44A6B5]" />
            <span>Begin Your Sri Lankan Odyssey</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight leading-[1.1]">
            Ready to Explore the Unseen Trails of Ceylon?
          </h2>

          <p className="text-slate-200/90 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Join thousands of conscious travelers discovering hidden waterfalls, ancient ruins, and authentic village retreats.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
            <button
              onClick={() => router.push("/auth")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#44A6B5] hover:bg-[#3993A1] text-white font-semibold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group"
            >
              <span>Launch Trip Planner</span>
              <span className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                <ArrowUpRight size={18} />
              </span>
            </button>

            <button
              onClick={() => router.push("#features")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-base px-8 py-4 rounded-full transition-all"
            >
              <Sparkles size={18} className="text-[#44A6B5]" />
              <span>Explore Destinations</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
