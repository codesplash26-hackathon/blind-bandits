"use client";

import React, { useState } from "react";
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
    <div className="py-stack-lg px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-gutter items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg md:text-display-lg font-bold text-foreground mb-stack-md">
            What the community says
          </h2>
          <p className="font-body-lg text-body-lg text-muted-foreground mb-0 max-w-lg">
            Hear from farmers, distributors, and officials using Ceylon Tour to ensure transparent and equitable fertilizer allocation.
          </p>
        </div>

        <div className="flex flex-col items-center lg:items-start">
          <TestimonialCard
            key={currentIndex}
            {...testimonials[currentIndex]}
            onComplete={handleNext}
            duration={30}
          />

          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-background border border-border hover:bg-muted transition-colors text-foreground flex items-center justify-center soft-bloom"
              aria-label="Previous testimonial"
            >
              <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-background border border-border hover:bg-muted transition-colors text-foreground flex items-center justify-center soft-bloom"
              aria-label="Next testimonial"
            >
              <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const testimonials = [
  {
    name: "Nadeesha Perera",
    role: "Registered Farmer, Anuradhapura",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    testimonial:
      "With the digital passbook, I know exactly when my fertilizer quota is ready. No more waiting in long lines wondering if supplies have arrived at the center.",
  },
  {
    name: "Ravindu Senanayake",
    role: "Agro-Dealer, Kurunegala",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    testimonial:
      "The dealer portal automatically syncs our inventory with the national grid. It has completely eliminated the paperwork we used to struggle with during distribution season.",
  },
  {
    name: "Ishara Fernando",
    role: "Agrarian Services Officer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    testimonial:
      "Blockchain verification means we have 100% accurate data on where the fertilizer went. Auditing the supply chain is now instant and fully transparent.",
  },
];
