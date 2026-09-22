'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bookmark, Sparkles, ShieldCheck } from 'lucide-react';

export default function TouristLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loginAs, savedDestinationIds } = useAuth();
  const pathname = usePathname();
  const effectiveRole = (pathname.startsWith('/admin') || role === 'ADMIN') ? 'ADMIN' : 'TOURIST';

  useEffect(() => {
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      loginAs('ADMIN');
    }
  }, [pathname, role, loginAs]);

  const getPageTitle = () => {
    if (pathname === '/dashboard') return effectiveRole === 'ADMIN' ? 'Tourism Authority Overview' : 'Tourist Dashboard';
    if (pathname === '/admin/dashboard') return 'Tourism Authority Overview';
    if (pathname === '/admin/destinations') return 'Destinations Registry & Capacity';
    if (pathname === '/admin/tourism-pressure') return 'Tourism Pressure & Carrying Capacity';
    if (pathname === '/admin/analytics') return 'Redistribution & Impact Analytics';
    if (pathname === '/admin/users') return 'User & Operator Directory';
    if (pathname === '/admin/settings') return 'Authority Sustainability Settings';
    if (pathname === '/admin/profile') return 'Authority Official Profile';
    if (pathname === '/discover') return 'Discover Sustainable Destinations';
    if (pathname === '/discover/results') return 'Recommendation Results';
    if (pathname.startsWith('/destinations/')) return 'Destination Exploration';
    if (pathname === '/destinations') return 'Explore Destinations';
    if (pathname === '/map') return 'Interactive Sri Lanka Map';
    if (pathname === '/saved') return 'My Saved Destinations';
    if (pathname === '/history') return 'Recommendation History';
    if (pathname === '/profile') return effectiveRole === 'ADMIN' ? 'Authority Official Profile' : 'Traveler Profile';
    return 'CeylonTour';
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-sidebar-border bg-background/80 backdrop-blur-xl px-4 lg:px-6 transition-[width,height] ease-linear">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-border/80 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                {getPageTitle()}
              </span>
              {effectiveRole === 'ADMIN' && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-3 h-3" /> Authority Clearance
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role-Specific Action Controls */}
            {effectiveRole === 'ADMIN' ? (
              <Link
                href="/admin/tourism-pressure"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-semibold border border-amber-500/30 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Pressure Simulator</span>
              </Link>
            ) : (
              <>
                {/* Quick Discover CTA */}
                <Link
                  href="/discover"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold border border-primary/20 transition-all hover:scale-102"
                >
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span>AI Trip Finder</span>
                </Link>

                {/* Saved Destinations Pill */}
                <Link
                  href="/saved"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium border border-border/80 transition-colors"
                  title="Saved destinations"
                >
                  <Bookmark className="w-3.5 h-3.5 text-secondary" />
                  <span className="hidden sm:inline">Saved</span>
                  <span className="h-4 min-w-4 px-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold flex items-center justify-center">
                    {savedDestinationIds.length}
                  </span>
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <div className="p-1 rounded-full bg-muted/60 border border-border/80">
              <ThemeToggle />
            </div>

            {/* Profile Avatar */}
            <Link
              href={effectiveRole === 'ADMIN' ? '/admin/profile' : '/profile'}
              className="transition-transform hover:scale-105"
              title={effectiveRole === 'ADMIN' ? 'Authority Official Profile' : 'Traveler Profile'}
            >
              <Avatar size="sm" className="ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                <AvatarFallback>{effectiveRole === 'ADMIN' ? 'DS' : (user?.name?.charAt(0) || 'N')}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
