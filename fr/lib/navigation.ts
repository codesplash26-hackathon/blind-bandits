import {
  LayoutDashboard,
  Sparkles,
  MapPin,
  Map,
  Bookmark,
  History,
  User,
  ShieldAlert,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { Role } from '@/types/ceylontour';

export type NavGroupId = 'overview' | 'explore' | 'travel' | 'account' | 'tourism' | 'management' | 'system';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  group: NavGroupId;
  roles: Role[];
  badge?: string;
}

export interface NavGroup {
  id: NavGroupId;
  label: string;
  items: NavItem[];
}

export interface NavMenuItem {
  title: string;
  url: string;
  icon?: ComponentType<{ className?: string }>;
  badge?: string;
  isActive?: boolean;
}

export interface NavMenuGroup {
  id: string;
  label: string;
  items: NavMenuItem[];
}

const NAV_GROUPS: { id: NavGroupId; label: string; roles: Role[] }[] = [
  // Tourist Groups
  { id: 'overview', label: 'Overview', roles: ['TOURIST', 'ADMIN'] },
  { id: 'explore', label: 'Explore', roles: ['TOURIST'] },
  { id: 'travel', label: 'My Travel', roles: ['TOURIST'] },
  { id: 'account', label: 'Account', roles: ['TOURIST', 'ADMIN'] },

  // Admin Groups
  { id: 'tourism', label: 'Tourism Monitoring', roles: ['ADMIN'] },
  { id: 'management', label: 'Management', roles: ['ADMIN'] },
  { id: 'system', label: 'System Configuration', roles: ['ADMIN'] },
];

export const NAV_ITEMS: NavItem[] = [
  // Tourist Items
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    group: 'overview',
    roles: ['TOURIST'],
  },
  {
    id: 'discover',
    label: 'Discover',
    href: '/discover',
    group: 'explore',
    roles: ['TOURIST'],
    badge: 'AI',
  },
  {
    id: 'destinations',
    label: 'Destinations',
    href: '/destinations',
    group: 'explore',
    roles: ['TOURIST'],
  },
  {
    id: 'map',
    label: 'Island Map',
    href: '/map',
    group: 'explore',
    roles: ['TOURIST'],
  },
  {
    id: 'saved',
    label: 'Saved',
    href: '/saved',
    group: 'travel',
    roles: ['TOURIST'],
  },
  {
    id: 'history',
    label: 'History',
    href: '/history',
    group: 'travel',
    roles: ['TOURIST'],
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    group: 'account',
    roles: ['TOURIST'],
  },

  // Admin Items
  {
    id: 'adminDashboard',
    label: 'Authority Overview',
    href: '/admin/dashboard',
    group: 'overview',
    roles: ['ADMIN'],
  },
  {
    id: 'adminDestinations',
    label: 'Destinations Registry',
    href: '/admin/destinations',
    group: 'tourism',
    roles: ['ADMIN'],
  },
  {
    id: 'adminPressure',
    label: 'Tourism Pressure',
    href: '/admin/tourism-pressure',
    group: 'tourism',
    roles: ['ADMIN'],
  },
  {
    id: 'adminAnalytics',
    label: 'Impact Analytics',
    href: '/admin/analytics',
    group: 'tourism',
    roles: ['ADMIN'],
  },
  {
    id: 'adminUsers',
    label: 'Users Directory',
    href: '/admin/users',
    group: 'management',
    roles: ['ADMIN'],
  },
  {
    id: 'adminSettings',
    label: 'Sustainability Settings',
    href: '/admin/settings',
    group: 'system',
    roles: ['ADMIN'],
  },
  {
    id: 'adminProfile',
    label: 'Authority Profile',
    href: '/admin/profile',
    group: 'account',
    roles: ['ADMIN'],
  },
];

export const ICONS_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  dashboard: LayoutDashboard,
  discover: Sparkles,
  destinations: MapPin,
  map: Map,
  saved: Bookmark,
  history: History,
  profile: User,
  adminDashboard: LayoutDashboard,
  adminDestinations: MapPin,
  adminPressure: ShieldAlert,
  adminAnalytics: BarChart3,
  adminUsers: Users,
  adminSettings: Settings,
  adminProfile: User,
};

export function getNavGroupsForRole(userRole: Role | null | undefined): NavGroup[] {
  const activeRole: Role = userRole || 'TOURIST';
  const roleItems = NAV_ITEMS.filter((item) => item.roles.includes(activeRole));

  return NAV_GROUPS.filter((group) => group.roles.includes(activeRole))
    .map(({ id, label }) => ({
      id,
      label,
      items: roleItems.filter((item) => item.group === id),
    }))
    .filter((group) => group.items.length > 0);
}
