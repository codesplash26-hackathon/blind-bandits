'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, Sparkles, ShieldCheck } from 'lucide-react';

const emptySubscribe = () => () => {};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading, loginAs, savedDestinationIds } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const effectiveRole = (pathname.startsWith('/admin') || role === 'ADMIN') ? 'ADMIN' : 'TOURIST';

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      loginAs('ADMIN');
    }
  }, [pathname, role, loginAs]);

  if (!isLoading && !user) {
    return null;
  }

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
      <SidebarInset className="bg-gradient-to-br from-muted via-background to-background dark:via-muted dark:to-muted min-h-screen text-foreground transition-colors duration-200">
        {isLoading || !mounted ? (
          <div className="flex h-full w-full items-center justify-center min-h-screen">
            <Loader label="Loading CeylonTour..." />
          </div>
        ) : (
          <>
            {/* Top Dashboard Navbar */}
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border dark:border-primary/20 bg-card/85 dark:bg-muted/90 backdrop-blur-md shadow-[0_1px_3px_color-mix(in_srgb,var(--shadow-color)_3%,transparent)] dark:shadow-[0_4px_20px_color-mix(in_srgb,var(--shadow-color)_50%,transparent)] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-3 px-4 sm:px-6 w-full">
                <SidebarTrigger className="-ml-1 text-primary dark:text-secondary hover:bg-muted dark:hover:bg-primary/15" />
                <div className="h-4 w-px bg-primary/15 dark:bg-primary/25 hidden sm:block" />
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-black text-primary dark:text-overlay-foreground tracking-tight">
                    {getPageTitle()}
                  </span>
                  {effectiveRole === 'ADMIN' ? (
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-primary dark:text-secondary border border-border dark:border-primary/30">
                      <ShieldCheck className="w-3 h-3 text-primary" /> Authority Clearance
                    </span>
                  ) : (
                    <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-primary dark:text-secondary border border-border dark:border-primary/30 shadow-2xs">
                      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                      Live Travel Stream
                    </span>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                  {/* Contextual Action Controls */}
                  {effectiveRole === 'ADMIN' ? (
                    <Link
                      href="/admin/tourism-pressure"
                      className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground hover:opacity-95 text-xs font-bold transition-all shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                      <span>Pressure Simulator</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/discover"
                        className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 transition-all hover:scale-102"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                        <span>AI Trip Finder</span>
                      </Link>

                      <Link
                        href="/saved"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 hover:bg-card dark:bg-muted dark:hover:bg-muted text-primary dark:text-secondary text-xs font-bold border border-border dark:border-primary/25 shadow-2xs transition-colors"
                        title="Saved destinations"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-primary" />
                        <span className="hidden sm:inline">Saved</span>
                        <span className="h-4 min-w-4 px-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-[10px] font-black flex items-center justify-center">
                          {savedDestinationIds.length}
                        </span>
                      </Link>
                    </>
                  )}

                  {/* Theme Toggle */}
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 text-foreground max-w-7xl mx-auto w-full">
              {children}
            </main>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
