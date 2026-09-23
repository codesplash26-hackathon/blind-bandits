'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, Sparkles, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading, loginAs, savedDestinationIds } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const effectiveRole = (pathname.startsWith('/admin') || role === 'ADMIN') ? 'ADMIN' : 'TOURIST';

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <SidebarInset>
        {isLoading || !mounted ? (
          <div className="flex h-full w-full items-center justify-center min-h-screen">
            <Loader label="Loading CeylonTour..." />
          </div>
        ) : (
          <>
            {/* Top Dashboard Navbar */}
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-sidebar-border bg-background/80 backdrop-blur-xl">
              <div className="flex items-center gap-3 px-4 w-full">
                <SidebarTrigger className="-ml-1" />
                <div className="h-4 w-px bg-border/80 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {getPageTitle()}
                  </span>
                  {effectiveRole === 'ADMIN' && (
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                      <ShieldCheck className="w-3 h-3 text-secondary" /> Authority Clearance
                    </span>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                  {/* Contextual Action Controls */}
                  {effectiveRole === 'ADMIN' ? (
                    <Link
                      href="/admin/tourism-pressure"
                      className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold border border-primary/20 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                      <span>Pressure Simulator</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/discover"
                        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold border border-primary/20 transition-all hover:scale-102"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-secondary" />
                        <span>AI Trip Finder</span>
                      </Link>

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
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background text-foreground">
              {children}
            </main>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
