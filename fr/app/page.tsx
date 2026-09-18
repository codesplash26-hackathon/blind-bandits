"use client";

import { Navigation } from "../components/landing/Navigation";
import { Hero } from "../components/landing/Hero";
import { Stat } from "../components/landing/Stat";
import { Features } from "../components/landing/Features";
import { Testimonial } from "../components/landing/Testimonial";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow pb-stack-lg flex flex-col gap-stack-lg">
        <Hero />

        {/* Stats (About) */}
        <div id="about" className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <Stat />
        </div>
        {/* Features Section */}
        <section id="features" className="w-full">
          <Features />
        </section>

        {/* Testimonials Section (Market) */}
        <section id="market" className="w-full">
          <Testimonial />
        </section>

      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
