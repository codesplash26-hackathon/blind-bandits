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
import logo from '@/public/logo.png';

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
          <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Image src={logo} alt="CeylonTour Logo" className="size-full object-contain p-1.5 brightness-0 invert" priority />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-heading font-black text-base text-foreground tracking-tight">CeylonTour</span>
            <span className="truncate text-[10px] font-bold text-primary uppercase tracking-wider">
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
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
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
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground font-extrabold shadow-xs border border-transparent'
                      : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent font-medium'
                  }`}
                  render={<Link href={item.url} className="flex items-center gap-2.5" />}
                >
                  {item.icon && (
                    <item.icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        item.isActive ? 'text-inherit stroke-[2.3]' : 'text-muted-foreground'
                      }`}
                    />
                  )}
                  <span className={item.isActive ? 'text-inherit font-black' : 'text-inherit font-semibold'}>
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className={`ml-auto text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full group-data-[collapsible=icon]:hidden ${
                      item.isActive
                        ? 'bg-sidebar-primary-foreground/15 text-inherit shadow-2xs'
                        : 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border'
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
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-2xl border border-border hover:bg-background"
              />
            }
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground overflow-hidden">
              <UserIcon className="h-4 w-4 text-foreground" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-bold text-foreground">{user.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-muted text-foreground font-bold border border-border">
                  {user.role}
                </span>
              </div>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl bg-card shadow-xl border border-border"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground overflow-hidden">
                    <UserIcon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold text-foreground">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(isAuthority ? '/admin/profile' : '/profile')}
                className="cursor-pointer text-foreground font-medium"
              >
                <BadgeCheck className="mr-2 h-4 w-4 text-primary" />
                <span>{isAuthority ? 'Authority Official Profile' : 'Traveler Profile'}</span>
              </DropdownMenuItem>
              {isAuthority ? (
                <DropdownMenuItem
                  onClick={() => router.push('/admin/destinations')}
                  className="cursor-pointer text-foreground font-medium"
                >
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                  <span>Destinations Registry</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => router.push('/saved')}
                  className="cursor-pointer text-foreground font-medium"
                >
                  <Bookmark className="mr-2 h-4 w-4 text-primary" />
                  <span>Saved Destinations ({savedDestinationIds.length})</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Demo Switch Role
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  loginAs('TOURIST');
                  router.push('/dashboard');
                }}
                className={`cursor-pointer ${!isAuthority ? 'text-foreground font-black bg-muted' : 'text-foreground'}`}
              >
                <Compass className="mr-2 h-4 w-4 text-primary" />
                <span>Tourist View</span>
                {!isAuthority && <span className="ml-auto text-[10px] font-extrabold text-foreground">Active</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  loginAs('ADMIN');
                  router.push('/admin/dashboard');
                }}
                className={`cursor-pointer ${isAuthority ? 'text-foreground font-black bg-muted' : 'text-foreground'}`}
              >
                <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                <span>Authority Admin View</span>
                {isAuthority && <span className="ml-auto text-[10px] font-extrabold text-foreground">Active</span>}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.push('/auth');
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
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
    <Sidebar collapsible="icon" className="bg-sidebar border-r border-sidebar-border" {...props}>
      <SidebarHeader className="bg-card dark:bg-muted">
        <AppLogo />
      </SidebarHeader>
      <SidebarContent className="bg-card dark:bg-muted">
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
