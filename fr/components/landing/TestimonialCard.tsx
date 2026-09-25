import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Star, CheckCircle2, Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  testimonial: string;
  duration?: number;
  onComplete?: () => void;
}

export function TestimonialCard({
  name,
  role,
  image,
  testimonial,
  duration = 30,
  onComplete,
}: TestimonialCardProps) {
  return (
    <div className="bg-card rounded-3xl p-8 sm:p-9 border border-border/50 dark:border-border shadow-xl max-w-xl relative overflow-hidden group">
      {/* Decorative Large Background Quote Mark */}
      <div className="absolute top-4 right-6 text-7xl font-serif text-primary/15 dark:text-primary/20 select-none pointer-events-none">
        “
      </div>

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="relative w-16 h-16 flex-shrink-0">
          {/* Circular Progress Timer */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              className="text-primary/15 dark:text-foreground/10"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="transparent"
              r="30"
              cx="32"
              cy="32"
            />
            <motion.circle
              className="text-primary"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="transparent"
              r="30"
              cx="32"
              cy="32"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: duration, ease: "linear" }}
              onAnimationComplete={onComplete}
            />
          </svg>

          <div className="absolute inset-1.5 rounded-full overflow-hidden shadow-inner border border-overlay-foreground/20">
            <Image
              src={image}
              alt={name}
              sizes="64px"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-heading text-lg font-bold text-foreground">
              {name}
            </h3>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {role}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
            ))}
          </div>
        </div>
      </div>

      <p className="text-foreground/90 text-sm sm:text-base leading-relaxed font-normal relative z-10 italic">
        &quot;{testimonial}&quot;
      </p>
    </div>
  );
}
