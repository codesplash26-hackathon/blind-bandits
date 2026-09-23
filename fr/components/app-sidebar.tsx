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
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Image src={logo} alt="CeylonTour Logo" className="size-full object-contain p-1" priority />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-base text-foreground tracking-tight">CeylonTour</span>
            <span className="truncate text-[10px] font-semibold text-secondary uppercase tracking-wider">
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
        <SidebarGroup key={group.id}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  isActive={item.isActive}
                  tooltip={item.title}
                  render={<Link href={item.url} className="flex items-center gap-2" />}
                >
                  {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 group-data-[collapsible=icon]:hidden">
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
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-secondary/20 text-secondary overflow-hidden">
              <UserIcon className="h-5 w-5 text-secondary" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-secondary/15 text-secondary font-bold">
                  {user.role}
                </span>
              </div>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-secondary/20 text-secondary overflow-hidden">
                    <UserIcon className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(isAuthority ? '/admin/profile' : '/profile')}
                className="cursor-pointer"
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                <span>{isAuthority ? 'Authority Official Profile' : 'Traveler Profile'}</span>
              </DropdownMenuItem>
              {isAuthority ? (
                <DropdownMenuItem
                  onClick={() => router.push('/admin/destinations')}
                  className="cursor-pointer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>Destinations Registry</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => router.push('/saved')}
                  className="cursor-pointer"
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Saved Destinations ({savedDestinationIds.length})</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Demo Switch Role
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  loginAs('TOURIST');
                  router.push('/dashboard');
                }}
                className={`cursor-pointer ${!isAuthority ? 'text-primary font-bold' : ''}`}
              >
                <Compass className="mr-2 h-4 w-4" />
                <span>Tourist View</span>
                {!isAuthority && <span className="ml-auto text-[10px] font-bold">Active</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  loginAs('ADMIN');
                  router.push('/admin/dashboard');
                }}
                className={`cursor-pointer ${isAuthority ? 'text-primary font-bold' : ''}`}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Authority Admin View</span>
                {isAuthority && <span className="ml-auto text-[10px] font-bold">Active</span>}
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
