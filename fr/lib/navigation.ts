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
  Compass,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { Role } from '@/types/ceylontour';

export type NavGroupId =
  | 'overview'
  | 'explore'
  | 'travel'
  | 'tourism'
  | 'management'
  | 'system';

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

const NAV_GROUPS: { id: NavGroupId; label: string }[] = [
  // Tourist navigation groups
  { id: 'overview', label: 'Overview' },
  { id: 'explore', label: 'Explore Sri Lanka' },
  { id: 'travel', label: 'My Travel' },

  // Admin / Authority navigation groups
  { id: 'tourism', label: 'Tourism Monitoring' },
  { id: 'management', label: 'Operations & Registry' },
  { id: 'system', label: 'System Configuration' },
];

export const NAV_ITEMS: NavItem[] = [
  // ─── Tourist Items ─────────────────────────────────────────
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

  // ─── Authority / Admin Items ───────────────────────────────
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

  // NOTE: /profile and /admin/profile are deliberately absent from the main list.
  // Like bumi, they are accessed from the sidebar footer's account menu (NavUser).
];

/**
 * Returns navigation items for the given user role
 */
export function getNavItemsForRole(userRole: Role | string | null | undefined): NavItem[] {
  if (!userRole) return [];
  const normalizedRole = userRole === 'ADMIN' ? 'ADMIN' : 'TOURIST';
  return NAV_ITEMS.filter((item) => item.roles.includes(normalizedRole));
}

/**
 * Groups navigation items according to NAV_GROUPS for the given role,
 * dropping empty sections (matching bumi pattern)
 */
export function getNavGroupsForRole(userRole: Role | string | null | undefined): NavGroup[] {
  const items = getNavItemsForRole(userRole);

  return NAV_GROUPS.map(({ id, label }) => ({
    id,
    label,
    items: items.filter((item) => item.group === id),
  })).filter((group) => group.items.length > 0);
}

export default NAV_ITEMS;

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

