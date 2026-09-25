'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import Login from './Login';
import Register from './Register';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/public/logo.png';
import visualBg from '@/public/andrei-alekseev-VVltlbkjMwQ-unsplash.jpg';
import sigiriyaImg from '@/public/poswiecie-sigiriya-459197_1920.jpg';
import mirissaImg from '@/public/tomas-malik-6BQyHtYSb5E-unsplash.jpg';
import galleImg from '@/public/hendrik-cornelissen-svZvPZ54uBI-unsplash.jpg';

export default function AuthContainer() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-primary/20 selection:text-sky-aqua">
      {/* Fullscreen Cinematic Scenic Sri Lanka Background with Depth Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src={visualBg}
          alt="Scenic Sri Lanka landscape"
          fill
          priority
          quality={90}
          className="object-cover object-center scale-105"
        />
        {/* Ambient Darkened Frosted Overlay for Pristine Legibility */}
        <div className="absolute inset-0 bg-overlay/75 dark:bg-muted/88 backdrop-blur-[8px] transition-colors duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-overlay via-transparent to-overlay/60" />

        {/* Ambient Floating Glow Orbs for Modern Depth */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-success/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
      </div>

      {/* Top Floating Controls Bar */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-overlay/40 dark:bg-card/60 backdrop-blur-xl border border-overlay-foreground/15 dark:border-overlay-foreground/10 text-overlay-foreground text-xs sm:text-sm font-semibold shadow-lg hover:bg-overlay/60 hover:border-primary/50 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 text-sky-aqua group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2 p-1 rounded-full bg-overlay/40 dark:bg-card/60 backdrop-blur-xl border border-overlay-foreground/15 dark:border-overlay-foreground/10 shadow-lg">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Responsive Split-Showcase Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-6 my-auto">
        <div className="w-full max-w-5xl xl:max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Panel: Simple 3-Photo Album & Ceylon Story */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-4 text-overlay-foreground pr-2">
            <div>
              {/* Brand Emblem */}
              <Link href="/" className="inline-flex items-center gap-2.5 group mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-success/20 backdrop-blur-xl border border-overlay-foreground/25 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Image src={logo} alt="Ceylon Tour Logo" width={24} height={24} />
                </div>
                <div>
                  <span className="font-heading text-2xl font-bold tracking-tight text-overlay-foreground block">
                    Ceylon Tour
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-sky-aqua font-semibold block">
                    Smart & Sustainable Travel
                  </span>
                </div>
              </Link>

              {/* Tagline */}
              <h1 className="font-heading text-2xl xl:text-3xl font-normal tracking-tight text-overlay-foreground leading-snug">
                Experience Sri Lanka{' '}
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-sky-aqua via-frosted-blue to-light-cyan">
                  as it was meant to be seen.
                </span>
              </h1>
            </div>

            {/* Creative 3-Photo Album Showcase */}
            <div className="relative pt-1">
              <div className="grid grid-cols-12 gap-2.5 h-72 xl:h-80">
                {/* Hero Photo: Sigiriya (Spans 7 cols) */}
                <div className="col-span-7 relative rounded-2xl xl:rounded-3xl overflow-hidden border border-overlay-foreground/20 shadow-2xl group cursor-pointer">
                  <Image
                    src={sigiriyaImg}
                    alt="Sigiriya Rock Citadel"
                    fill
                    priority
                    className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-overlay/85 via-overlay/20 to-transparent pointer-events-none" />

                  {/* Floating Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-overlay/60 backdrop-blur-md border border-overlay-foreground/20 text-[10px] font-semibold text-overlay-foreground shadow-md">
                      ✨ UNESCO Wonder
                    </span>
                  </div>

                  <div className="absolute bottom-3 inset-x-3">
                    <h3 className="text-base xl:text-lg font-bold text-overlay-foreground tracking-tight leading-tight drop-shadow">
                      Sigiriya Citadel
                    </h3>
                    <p className="text-[11px] text-overlay-foreground/75 font-light">
                      Ancient 5th-century sky fortress
                    </p>
                  </div>
                </div>

                {/* Right Stack: 2 Companion Photos (Spans 5 cols) */}
                <div className="col-span-5 flex flex-col gap-2.5">
                  {/* Photo 2: Mirissa Bay */}
                  <div className="flex-1 relative rounded-2xl overflow-hidden border border-overlay-foreground/20 shadow-xl group cursor-pointer">
                    <Image
                      src={mirissaImg}
                      alt="Mirissa Bay"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-overlay/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 inset-x-2.5">
                      <span className="block text-xs font-bold text-overlay-foreground leading-tight">Mirissa Bay</span>
                      <span className="block text-[10px] text-success font-medium">Turquoise Coast</span>
                    </div>
                  </div>

                  {/* Photo 3: Galle Fort */}
                  <div className="flex-1 relative rounded-2xl overflow-hidden border border-overlay-foreground/20 shadow-xl group cursor-pointer">
                    <Image
                      src={galleImg}
                      alt="Galle Fort Lighthouse"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-overlay/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 inset-x-2.5">
                      <span className="block text-xs font-bold text-overlay-foreground leading-tight">Galle Fort</span>
                      <span className="block text-[10px] text-frosted-blue font-medium">Historic Lighthouse</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Glassmorphic Auth Form Card */}
          <div className="w-full lg:col-span-6 max-w-md mx-auto">
            {/* Mobile Header Logo */}
            <div className="lg:hidden text-center mb-5 flex flex-col items-center">
              <Link href="/" className="inline-flex items-center gap-3 group mb-1">
                <div className="w-11 h-11 rounded-2xl bg-overlay-foreground/10 backdrop-blur-md border border-overlay-foreground/20 flex items-center justify-center shadow-lg">
                  <Image src={logo} alt="Ceylon Tour Logo" width={26} height={26} />
                </div>
                <div className="text-left">
                  <span className="font-heading text-2xl font-bold text-overlay-foreground tracking-tight block">
                    Ceylon Tour
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-sky-aqua font-semibold block">
                    Smart & Sustainable Travel
                  </span>
                </div>
              </Link>
            </div>

            {/* Frosted Glassmorphism Card */}
            <div className="bg-card/95 dark:bg-card/85 backdrop-blur-2xl rounded-3xl border border-border/80 dark:border-overlay-foreground/15 shadow-[0_20px_60px_color-mix(in_srgb,var(--shadow-color)_35%,transparent)] p-6 sm:p-8 relative overflow-hidden">
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-success to-frosted-blue" />

              {/* Segmented Pill Switcher with Motion Layout Animation */}
              <div className="p-1 rounded-2xl bg-muted/80 dark:bg-muted/40 border border-border/80 mb-6 grid grid-cols-2 gap-1 shadow-inner relative">
                <button
                  type="button"
                  onClick={() => setIsSignup(false)}
                  className={`relative py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer ${!isSignup
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {!isSignup && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 bg-background rounded-xl shadow-md border border-border/70"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className={`relative py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer ${isSignup
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {isSignup && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 bg-background rounded-xl shadow-md border border-border/70"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">Create Account</span>
                </button>
              </div>

              {/* Animated Form View Switcher */}
              <AnimatePresence mode="wait">
                {!isSignup ? (
                  <motion.div
                    key="login-view"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <Login onSwitchToSignup={() => setIsSignup(true)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup-view"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <Register onSwitchToLogin={() => setIsSignup(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimal Copyright */}
      <footer className="relative z-10 w-full py-4 text-center">
        <p className="text-xs text-overlay-foreground/70">
          &copy; {new Date().getFullYear()} CeylonTour Lanka. Protecting nature through conscious travel.
        </p>
      </footer>
    </div>
  );
}
