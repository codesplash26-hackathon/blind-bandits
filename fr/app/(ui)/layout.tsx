'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const emptySubscribe = () => () => {};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading, savedDestinationIds } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const effectiveRole = role === 'ADMIN' ? 'ADMIN' : 'TOURIST';

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && pathname.startsWith('/admin') && role !== 'ADMIN') {
      toast.error('Admin access is required for that page.', { id: 'admin-access-required' });
      router.replace('/dashboard');
    }
  }, [isLoading, pathname, role, router, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader label="Restoring your session..." />
      </div>
    );
  }

  if (!user || (pathname.startsWith('/admin') && role !== 'ADMIN')) {
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
        {!mounted ? (
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
                  <span className="text-xs sm:text-sm font-black text-foreground dark:text-overlay-foreground tracking-tight">
                    {getPageTitle()}
                  </span>

                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                  {/* Contextual Action Controls */}
                  {effectiveRole === 'ADMIN' ? (
                    <Button nativeButton={false} render={<Link href="/admin/tourism-pressure" />} size="sm" className="hidden md:inline-flex">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Pressure Simulator</span>
                    </Button>
                  ) : (
                    <>
                      <Button nativeButton={false} render={<Link href="/discover" />} size="sm" className="hidden md:inline-flex">
                        <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                        <span>Trip Finder</span>
                      </Button>

                      <Button nativeButton={false} render={<Link href="/saved" />} size="sm" variant="outline" aria-label="Saved destinations" title="Saved destinations">
                        <Bookmark className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Saved</span>
                        <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">
                          {savedDestinationIds.length}
                        </span>
                      </Button>
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
