'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, Compass } from 'lucide-react';
import Login from './Login';
import Register from './Register';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/public/logo.svg';
import visualBg from '@/public/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg';

export default function AuthContainer() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Fullscreen Cinematic Scenic Sri Lanka Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src={visualBg}
          alt="Scenic Sri Lanka landscape"
          fill
          priority
          quality={90}
          className="object-cover object-center scale-105"
        />
        {/* Layered cinematic overlays for optimal card contrast */}
        <div className="absolute inset-0 bg-background/70 dark:bg-[#00141A]/85 backdrop-blur-[6px] transition-colors duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60 dark:from-[#001015] dark:via-transparent dark:to-[#001015]/70" />
      </div>

      {/* Top Floating Controls Bar */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/85 dark:bg-card/70 backdrop-blur-md border border-border/80 text-foreground text-xs sm:text-sm font-semibold shadow-md hover:bg-card hover:border-primary/50 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2 p-1 rounded-full bg-card/85 dark:bg-card/70 backdrop-blur-md border border-border/80 shadow-md">
          <ThemeToggle />
        </div>
      </header>

      {/* Centered Glassmorphic Auth Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 my-auto">
        <div className="w-full max-w-md sm:max-w-[460px]">
          {/* Brand Header Badge */}
          <div className="text-center mb-5 flex flex-col items-center">
            <Link href="/" className="inline-flex items-center gap-3 group mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Image src={logo} alt="Ceylon Tour Logo" width={28} height={28} />
              </div>
              <div className="text-left">
                <span className="font-heading text-2xl font-bold text-foreground tracking-tight block">
                  Ceylon Tour
                </span>
                <span className="text-[11px] uppercase tracking-widest text-primary font-semibold block">
                  Smart & Sustainable Travel
                </span>
              </div>
            </Link>
          </div>

          {/* Frosted Glassmorphism Card */}
          <div className="bg-card/90 dark:bg-card/80 backdrop-blur-2xl rounded-3xl border border-border/80 dark:border-white/10 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#44A6B5] via-[#B2D5E2] to-[#44A6B5]" />

            {/* Segmented Pill Switcher */}
            <div className="p-1 rounded-2xl bg-muted/80 dark:bg-muted/40 border border-border/80 mb-6 grid grid-cols-2 gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  !isSignup
                    ? 'bg-background text-foreground shadow-md border border-border/70'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isSignup
                    ? 'bg-background text-foreground shadow-md border border-border/70'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Create Account</span>
              </button>
            </div>

            {/* Animated Form Display */}
            <AnimatePresence mode="wait">
              {!isSignup ? (
                <motion.div
                  key="login-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Login onSwitchToSignup={() => setIsSignup(true)} />
                </motion.div>
              ) : (
                <motion.div
                  key="signup-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Register onSwitchToLogin={() => setIsSignup(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Minimal Copyright */}
      <footer className="relative z-10 w-full py-4 text-center">
        <p className="text-[11px] text-muted-foreground/80">
          &copy; {new Date().getFullYear()} CeylonTour Lanka. Protecting nature through conscious travel.
        </p>
      </footer>
    </div>
  );
}
