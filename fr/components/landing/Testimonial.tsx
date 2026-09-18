"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Star, Heart } from "lucide-react";
import { TestimonialCard } from "./TestimonialCard";

export function Testimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 md:px-12 w-full max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Heart className="w-3.5 h-3.5" />
            <span>Traveler & Host Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground mb-4 tracking-tight leading-tight">
            Loved by Travelers from Around the Globe
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg leading-relaxed font-normal mb-6">
            Hear how eco-conscious adventurers and Sri Lankan local hosts create unforgettable, sustainable memories together with Ceylon Tour.
          </p>

          <div className="flex items-center gap-2 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-foreground font-bold text-base ml-2">4.96 / 5.0</span>
          </div>
          <p className="text-muted-foreground text-xs font-medium">
            Based on 2,400+ verified traveler reviews across Sri Lanka
          </p>
        </div>

        <div className="flex flex-col items-center lg:items-start">
          <TestimonialCard
            key={currentIndex}
            {...testimonials[currentIndex]}
            onComplete={handleNext}
            duration={15}
          />

          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePrev}
              className="p-3.5 rounded-full bg-card border border-border hover:bg-muted transition-colors text-foreground flex items-center justify-center shadow-sm hover:scale-105"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3.5 rounded-full bg-card border border-border hover:bg-muted transition-colors text-foreground flex items-center justify-center shadow-sm hover:scale-105"
              aria-label="Next testimonial"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const testimonials = [
  {
    name: "Clara & Mark Vance",
    role: "Eco Travelers, London UK",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    testimonial:
      "Ceylon Tour helped us discover secret waterfall trails near Ella that weren't on any generic travel map. Booking local homestays felt seamless, authentic, and truly rewarding.",
  },
  {
    name: "Kavinda Wickramasinghe",
    role: "Certified Heritage Guide, Sigiriya",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    testimonial:
      "As a local guide, this platform connects me directly with respectful travelers who care about preserving our history and wildlife. It changed my livelihoods for the better.",
  },
  {
    name: "Dr. Sophia Lindqvist",
    role: "Wildlife Photographer, Stockholm",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    testimonial:
      "The AI route planner saved us days of stress. We spent 2 weeks exploring Yala safari points, Mirissa blue whale sanctuaries, and misty tea plantations with absolute ease.",
  },
];
