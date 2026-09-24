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
      <SidebarInset className="bg-gradient-to-br from-[#F0F5F8] via-[#F4F7F9] to-[#F8FAFC] min-h-screen">
        {isLoading || !mounted ? (
          <div className="flex h-full w-full items-center justify-center min-h-screen">
            <Loader label="Loading CeylonTour..." />
          </div>
        ) : (
          <>
            {/* Top Dashboard Navbar */}
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-[#004554]/10 bg-white/85 backdrop-blur-md shadow-[0_1px_3px_rgba(0,69,84,0.03)] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-3 px-4 sm:px-6 w-full">
                <SidebarTrigger className="-ml-1 text-[#004554] hover:bg-[#EAF4F7]" />
                <div className="h-4 w-px bg-[#004554]/15 hidden sm:block" />
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-black text-[#004554] tracking-tight">
                    {getPageTitle()}
                  </span>
                  {effectiveRole === 'ADMIN' ? (
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] text-[#004554] border border-[#B5D7E4]">
                      <ShieldCheck className="w-3 h-3 text-[#44A6B5]" /> Authority Clearance
                    </span>
                  ) : (
                    <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-b from-[#F2F8FB] to-[#E3F0F6] text-[#004554] border border-[#B5D7E4] shadow-2xs">
                      <span className="size-1.5 rounded-full bg-[#44A6B5] animate-pulse" />
                      Live Travel Stream
                    </span>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                  {/* Contextual Action Controls */}
                  {effectiveRole === 'ADMIN' ? (
                    <Link
                      href="/admin/tourism-pressure"
                      className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#003E4C] via-[#004E5F] to-[#04667C] text-white hover:opacity-95 text-xs font-bold transition-all shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-light-blue" />
                      <span>Pressure Simulator</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/discover"
                        className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#003E4C] via-[#004E5F] to-[#04667C] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all hover:scale-102"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-light-blue" />
                        <span>AI Trip Finder</span>
                      </Link>

                      <Link
                        href="/saved"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#004554] text-xs font-bold border border-[#B5D7E4] shadow-2xs transition-colors"
                        title="Saved destinations"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#44A6B5]" />
                        <span className="hidden sm:inline">Saved</span>
                        <span className="h-4 min-w-4 px-1 rounded-full bg-gradient-to-r from-[#003E4C] to-[#04667C] text-white text-[10px] font-black flex items-center justify-center">
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
