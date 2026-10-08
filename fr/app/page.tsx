"use client";

import { Navigation } from "../components/landing/Navigation";
import { Hero } from "../components/landing/Hero";
import { ExperienceStory } from "../components/landing/ExperienceStory";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Stat } from "../components/landing/Stat";
import { Testimonial } from "../components/landing/Testimonial";
import { CallToAction } from "../components/landing/CallToAction";
import { Footer } from "../components/landing/Footer";
import {Features} from "../components/landing/Features";

export default function LandingPage() {
  return (
    <div className="landing-page font-sans min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Sticky Theme-aware Navigation */}
      <Navigation />

      <main className="flex-grow flex flex-col">
        {/* Fullscreen Edge-to-edge Hero with Top Sri Lanka Visuals */}
        <Hero />

        {/* Why CeylonTour - Plain, Human-Friendly Values */}
        {/* <WhyCeylonTour /> */}
        <Features />


        {/* Visual Photographic Story - The CeylonTour Standard */}
        <ExperienceStory />

        {/* How It Works - 3 Simple Steps with Interactive Chips */}
        <HowItWorks />

        {/* Sustainable Footprint & Community Numbers */}
        <Stat />

        {/* Traveler & Host Stories */}
        <Testimonial />

        {/* Friendly Call To Action Banner */}
        <CallToAction />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
