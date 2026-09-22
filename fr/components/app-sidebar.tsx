'use client';

import * as React from 'react';
import {
  ChevronsUpDown,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Compass,
  Bookmark,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { getNavGroupsForRole, ICONS_MAP, NavMenuGroup } from '@/lib/navigation';
import { Role } from '@/types/ceylontour';
import logo from '@/public/logo.svg';

function AppLogo() {
  const { role } = useAuth();
  const pathname = usePathname();
  const effectiveRole: Role = (pathname.startsWith('/admin') || role === 'ADMIN') ? 'ADMIN' : 'TOURIST';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link
          href={effectiveRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
          className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-sidebar-accent/50 transition-colors"
        >
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-1.5 shadow-md border border-white/20">
            <Image src={logo} alt="CeylonTour Logo" className="size-full object-contain brightness-0 invert" priority />
          </div>
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              CEYLONTOUR
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              {effectiveRole === 'ADMIN' ? 'Authority Portal' : 'Sustainable Travel'}
            </span>
          </div>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavMain({ groups }: { groups: NavMenuGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.id} className="py-1.5">
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  isActive={item.isActive}
                  tooltip={item.title}
                  render={<Link href={item.url} />}
                >
                  {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                  <span className="text-xs sm:text-sm">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-secondary/20 text-secondary border border-secondary/30 group-data-[collapsible=icon]:hidden">
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, loginAs, logout, savedDestinationIds } = useAuth();
  const effectiveRole: Role = (pathname.startsWith('/admin') || role === 'ADMIN') ? 'ADMIN' : 'TOURIST';

  const displayName = effectiveRole === 'ADMIN'
    ? 'Tourism Authority Officer'
    : (user?.name || 'Tourist Explorer');
  const displayEmail = effectiveRole === 'ADMIN'
    ? 'officer@tourism.gov.lk'
    : (user?.email || 'traveler@ceylontour.lk');

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/70 rounded-xl px-2 transition-all cursor-pointer"
              />
            }
          >
            <Avatar size="sm" className="shrink-0">
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-semibold text-foreground">{displayName}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary font-bold">
                  {effectiveRole}
                </span>
              </div>
              <span className="truncate text-[11px] text-muted-foreground">{displayEmail}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-60 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl p-1.5"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-2">
                <div className="flex items-center gap-2.5">
                  <Avatar size="default" className="shrink-0">
                    <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-bold text-foreground">{displayName}</span>
                    <span className="truncate text-[11px] text-muted-foreground">{displayEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push('/profile')}
                className="cursor-pointer gap-2.5 px-3 py-2 text-xs font-medium"
              >
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/saved')}
                className="cursor-pointer gap-2.5 px-3 py-2 text-xs font-medium"
              >
                <Bookmark className="h-4 w-4 text-muted-foreground" />
                <span>Saved Destinations ({savedDestinationIds.length})</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Quick Role Switcher for Hackathon / Demonstration */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Demo Role Switch
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  loginAs('TOURIST');
                  router.push('/dashboard');
                }}
                className={`cursor-pointer gap-2 px-3 py-1.5 text-xs ${effectiveRole === 'TOURIST' ? 'text-primary font-bold' : ''}`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Tourist View</span>
                {effectiveRole === 'TOURIST' && <span className="ml-auto text-[10px]">Active</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  loginAs('ADMIN');
                  router.push('/admin/dashboard');
                }}
                className={`cursor-pointer gap-2 px-3 py-1.5 text-xs ${effectiveRole === 'ADMIN' ? 'text-primary font-bold' : ''}`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Authority Admin View</span>
                {effectiveRole === 'ADMIN' && <span className="ml-auto text-[10px]">Active</span>}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.push('/auth');
                }}
                className="cursor-pointer gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = useAuth();
  const pathname = usePathname();

  const effectiveRole: Role = (pathname.startsWith('/admin') || role === 'ADMIN') ? 'ADMIN' : 'TOURIST';

  const navGroups = getNavGroupsForRole(effectiveRole).map((group) => ({
    id: group.id,
    label: group.label,
    items: group.items.map((item) => ({
      title: item.label,
      url: item.href,
      icon: ICONS_MAP[item.id] ?? Compass,
      badge: item.badge,
      isActive:
        pathname === item.href ||
        (item.href !== '/dashboard' &&
          item.href !== '/admin/dashboard' &&
          pathname.startsWith(`${item.href}/`)),
    })),
  }));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar/95 backdrop-blur-md" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
