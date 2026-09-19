"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronLeft, ChevronRight, Compass } from "lucide-react";

import slide1 from "@/public/tomas-malik-6BQyHtYSb5E-unsplash.jpg";
import slide2 from "@/public/poswiecie-sigiriya-459197_1920.jpg";
import slide3 from "@/public/samanthaweerasinghe-devils-staircase-5346794_1920.jpg";
import slide4 from "@/public/musthaqsms-temple-204803_1920.jpg";
import slide5 from "@/public/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg";

const heroSlides = [
  {
    image: slide1,
    location: "Mirissa & Southern Coast",
    tagline: "Unspoiled Tropical Coastlines",
  },
  {
    image: slide2,
    location: "Sigiriya Rock Fortress",
    tagline: "Ancient World Wonders",
  },
  {
    image: slide3,
    location: "Devil's Staircase, Ohiya",
    tagline: "Lush Mountain Trekking",
  },
  {
    image: slide4,
    location: "Sacred Heritage Temples",
    tagline: "Cultural Legacy & History",
  },
  {
    image: slide5,
    location: "Ella & Tea Country",
    tagline: "Misty Mountain Highlands",
  },
];

export const Hero = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Background Image Slideshow Container */}
      <div className="absolute inset-0 z-0 bg-[#00171D]">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.location}
              fill
              priority={idx === 0}
              quality={90}
              sizes="100vw"
              className={`object-cover object-center transition-transform duration-[8000ms] ease-out ${
                idx === currentSlide ? "scale-105" : "scale-100"
              }`}
            />
          </div>
        ))}

        {/* Unified Clean Vignette Overlay - Zero Clutter */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00171D]/80 via-[#00171D]/45 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#00171D] via-[#00171D]/60 to-transparent z-20 pointer-events-none" />
      </div>

      {/* Hero Main Content Container */}
      <div className="relative z-30 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col justify-between h-full min-h-[70vh]">
        {/* Top Text Content */}
        <div className="max-w-2xl flex flex-col items-start gap-5 my-auto pt-6">
          {/* Eco Location Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium shadow-md transition-all duration-300">
            <Compass className="w-4 h-4 text-[#44A6B5]" />
            <span>{heroSlides[currentSlide].location}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/80">{heroSlides[currentSlide].tagline}</span>
          </div>

          {/* Clean Main Title */}
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white leading-[1.05] drop-shadow-lg">
            Smart. Sustainable. <br />
            <span className="font-heading italic text-[#44A6B5] font-normal">Travel Lanka.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body-md text-slate-100/90 text-base sm:text-lg max-w-xl font-normal leading-relaxed drop-shadow">
            Discover Sri Lanka’s hidden gems while protecting fragile ecosystems and supporting local communities with transparent, Explainable AI recommendations.
          </p>

          {/* Action Pill Buttons (Proposal 3.2.1) */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              onClick={() => router.push("#demo")}
              className="inline-flex items-center gap-3 bg-[#44A6B5] hover:bg-[#3993A1] text-white font-semibold text-sm pl-6 pr-2.5 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group"
            >
              <span>Find a Sustainable Destination</span>
              <span className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                <ArrowUpRight size={16} />
              </span>
            </button>

            <button
              onClick={() => router.push("#sustainability")}
              className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-md text-[#004554] hover:bg-white font-semibold text-sm pl-6 pr-2.5 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group"
            >
              <span>Explore Tourism Sustainability</span>
              <span className="w-7 h-7 rounded-full bg-[#004554] text-white flex items-center justify-center group-hover:bg-[#003440] transition-colors">
                <ArrowUpRight size={16} />
              </span>
            </button>
          </div>
        </div>

        {/* Integrated Bottom Controls Bar */}
        <div className="w-full flex items-center justify-between pt-10">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "w-8 bg-[#44A6B5]" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter & Arrow Navigation */}
          <div className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl text-white text-xs sm:text-sm">
            <span className="font-mono text-white/70">
              0{currentSlide + 1} / 0{heroSlides.length}
            </span>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
