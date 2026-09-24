'use client';

import * as React from 'react';
import {
  BadgeCheck,
  Compass,
  ChevronsUpDown,
  LogOut,
  MapPin,
  Bookmark,
  ShieldCheck,
  User as UserIcon,
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
import { useAuth } from '@/context/AuthContext';
import { getNavGroupsForRole, ICONS_MAP } from '@/lib/navigation';
import { Role } from '@/types/ceylontour';
import logo from '@/public/logo.svg';

function AppLogo() {
  const { role } = useAuth();
  const pathname = usePathname();
  const effectiveRole: Role = (pathname.startsWith('/admin') || role === 'ADMIN') ? 'ADMIN' : 'TOURIST';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-transparent pointer-events-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-[#0A5C6D] text-white shadow-xs">
            <Image src={logo} alt="CeylonTour Logo" className="size-full object-contain p-1.5 brightness-0 invert" priority />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-heading font-black text-base text-black tracking-tight">CeylonTour</span>
            <span className="truncate text-[10px] font-bold text-[#44A6B5] uppercase tracking-wider">
              {effectiveRole === 'ADMIN' ? 'Authority Portal' : 'Sustainable Travel'}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

interface NavMenuItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  badge?: string;
  isActive?: boolean;
}

interface NavMenuGroup {
  id: string;
  label: string;
  items: NavMenuItem[];
}

function NavMain({ groups }: { groups: NavMenuGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.id} className="py-1">
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-[#5A737D] px-3 py-1">
            {group.label}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {group.items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  isActive={item.isActive}
                  tooltip={item.title}
                  className={`transition-all duration-150 rounded-xl px-3 py-2 ${
                    item.isActive
                      ? '!bg-gradient-to-r !from-[#E2F0F6] !to-[#EEF7FA] dark:!from-[rgba(68,166,181,0.22)] dark:!to-[rgba(68,166,181,0.12)] !text-black dark:!text-white font-extrabold shadow-xs border border-[#B5D7E4] dark:border-[rgba(68,166,181,0.35)]'
                      : '!text-[#475E68] dark:!text-[#8DB5C2] hover:!text-black dark:hover:!text-white hover:!bg-[#F2F7FA] dark:hover:!bg-[rgba(68,166,181,0.1)] font-medium'
                  }`}
                  render={<Link href={item.url} className="flex items-center gap-2.5" />}
                >
                  {item.icon && (
                    <item.icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        item.isActive ? 'text-black dark:text-white stroke-[2.3]' : 'text-[#5E7A85] dark:text-[#8DB5C2]'
                      }`}
                    />
                  )}
                  <span className={item.isActive ? 'text-black dark:text-white font-black' : 'text-[#475E68] dark:text-[#B2D5E2] font-semibold'}>
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className={`ml-auto text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full group-data-[collapsible=icon]:hidden ${
                      item.isActive
                        ? 'bg-black text-white dark:bg-[#44A6B5] dark:text-[#00161C] shadow-2xs'
                        : 'bg-[#E2F0F6] text-[#004554] dark:bg-[rgba(68,166,181,0.2)] dark:text-[#B2D5E2] border border-[#B5D7E4] dark:border-[rgba(68,166,181,0.3)]'
                    }`}>
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

function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: Role;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { logout, loginAs, savedDestinationIds } = useAuth();
  const isAuthority = user.role === 'ADMIN';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-2xl border border-black/5 hover:bg-[#F8FAFC]"
              />
            }
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#E9F1F6] text-black overflow-hidden">
              <UserIcon className="h-4 w-4 text-black" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-bold text-black">{user.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#E9F1F6] text-black font-bold border border-black/10">
                  {user.role}
                </span>
              </div>
              <span className="truncate text-xs text-[#64748B]">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-[#64748B]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl bg-white shadow-xl border border-black/10"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#E9F1F6] text-black overflow-hidden">
                    <UserIcon className="h-4 w-4 text-black" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold text-black">{user.name}</span>
                    <span className="truncate text-xs text-[#64748B]">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(isAuthority ? '/admin/profile' : '/profile')}
                className="cursor-pointer text-black font-medium"
              >
                <BadgeCheck className="mr-2 h-4 w-4 text-[#44A6B5]" />
                <span>{isAuthority ? 'Authority Official Profile' : 'Traveler Profile'}</span>
              </DropdownMenuItem>
              {isAuthority ? (
                <DropdownMenuItem
                  onClick={() => router.push('/admin/destinations')}
                  className="cursor-pointer text-black font-medium"
                >
                  <MapPin className="mr-2 h-4 w-4 text-[#44A6B5]" />
                  <span>Destinations Registry</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => router.push('/saved')}
                  className="cursor-pointer text-black font-medium"
                >
                  <Bookmark className="mr-2 h-4 w-4 text-[#44A6B5]" />
                  <span>Saved Destinations ({savedDestinationIds.length})</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Demo Switch Role
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  loginAs('TOURIST');
                  router.push('/dashboard');
                }}
                className={`cursor-pointer ${!isAuthority ? 'text-black font-black bg-[#F1F5F9]' : 'text-black'}`}
              >
                <Compass className="mr-2 h-4 w-4 text-[#44A6B5]" />
                <span>Tourist View</span>
                {!isAuthority && <span className="ml-auto text-[10px] font-extrabold text-black">Active</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  loginAs('ADMIN');
                  router.push('/admin/dashboard');
                }}
                className={`cursor-pointer ${isAuthority ? 'text-black font-black bg-[#F1F5F9]' : 'text-black'}`}
              >
                <ShieldCheck className="mr-2 h-4 w-4 text-[#44A6B5]" />
                <span>Authority Admin View</span>
                {isAuthority && <span className="ml-auto text-[10px] font-extrabold text-black">Active</span>}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.push('/auth');
                }}
                className="cursor-pointer text-rose-600 focus:text-rose-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, role } = useAuth();
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

  const navUser = user
    ? {
        name: effectiveRole === 'ADMIN' ? (user.role === 'ADMIN' ? user.name : 'Dilhara Senanayake') : (user.name || 'Traveler Explorer'),
        email: effectiveRole === 'ADMIN' ? (user.role === 'ADMIN' ? user.email : 'd.senanayake@tourism.gov.lk') : (user.email || 'traveler@ceylontour.lk'),
        avatar: '',
        role: effectiveRole,
      }
    : {
        name: 'Guest',
        email: 'guest@ceylontour.lk',
        avatar: '',
        role: effectiveRole,
      };

  return (
    <Sidebar collapsible="icon" className="bg-white dark:bg-[#001A20] border-r border-black/8 dark:border-[rgba(68,166,181,0.2)]" {...props}>
      <SidebarHeader className="bg-white dark:bg-[#001A20]">
        <AppLogo />
      </SidebarHeader>
      <SidebarContent className="bg-white dark:bg-[#001A20]">
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter className="bg-white dark:bg-[#001A20] border-t border-black/5 dark:border-[rgba(68,166,181,0.15)]">
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
