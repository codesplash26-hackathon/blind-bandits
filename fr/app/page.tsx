"use client";

import { Navigation } from "../components/landing/Navigation";
import { Hero } from "../components/landing/Hero";
import { Stat } from "../components/landing/Stat";
import { Features } from "../components/landing/Features";
import { Testimonial } from "../components/landing/Testimonial";
import { CallToAction } from "../components/landing/CallToAction";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="font-sans min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Sticky Theme-aware Navigation */}
      <Navigation />

      <main className="flex-grow flex flex-col gap-8 md:gap-16">
        {/* Fullscreen Edge-to-edge Hero */}
        <Hero />

        {/* Stats & Impact */}
        <div id="about" className="w-full">
          <Stat />
        </div>

        {/* Smart Travel Engine Features */}
        <section id="features" className="w-full">
          <Features />
        </section>

        {/* Community Reviews & Stories */}
        <section id="market" className="w-full">
          <Testimonial />
        </section>

        {/* Call To Action Banner */}
        <CallToAction />
      </main>

      {/* Footer */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
