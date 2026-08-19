import { BarChart3, Compass, Globe2, Home, MapPin, ShieldCheck, Store, Users } from 'lucide-react';
import { USER_ROLES } from '../constants/roles';
import type { UserRole } from '../types/common';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  description?: string;
}

export const publicNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Destinations', href: '/destinations', icon: MapPin },
  { label: 'Vendors', href: '/vendors', icon: Store },
  { label: 'About', href: '/about', icon: Globe2 },
];

export const touristNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/tourist', icon: Home },
  { label: 'Explore', href: '/tourist/explore', icon: Compass },
  { label: 'Itinerary', href: '/tourist/itinerary', icon: MapPin },
  { label: 'Audio Guide', href: '/tourist/audio-guide', icon: Users },
  { label: 'Eco Passport', href: '/tourist/eco-passport', icon: ShieldCheck },
  { label: 'AR Craft', href: '/tourist/ar', icon: Globe2 },
];

export const providerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/provider', icon: Home },
  { label: 'Profile', href: '/provider/profile', icon: Users },
  { label: 'Verification', href: '/provider/verification', icon: ShieldCheck },
  { label: 'Listings', href: '/provider/listings', icon: Store },
  { label: 'Payments', href: '/provider/payments', icon: BarChart3 },
  { label: 'Analytics', href: '/provider/analytics', icon: Compass },
];

export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Vendors', href: '/admin/vendors', icon: Store },
  { label: 'Destinations', href: '/admin/destinations', icon: MapPin },
  { label: 'Alerts', href: '/admin/alerts', icon: ShieldCheck },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export const roleNavMap: Record<UserRole, NavItem[]> = {
  [USER_ROLES.TOURIST]: touristNavItems,
  [USER_ROLES.PROVIDER]: providerNavItems,
  [USER_ROLES.ADMIN]: adminNavItems,
};
