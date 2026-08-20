import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  Car,
  Compass,
  Globe2,
  Home,
  Info,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import { USER_ROLES } from '../constants/roles';
import type { UserRole } from '../types/common';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  description?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  href?: string;
  icon?: typeof Home;
  items: NavItem[];
}

export const publicNavGroups: NavGroup[] = [
  {
    id: 'explore',
    label: 'Explore',
    items: [
      {
        label: 'Destinations',
        href: '/explore',
        icon: Compass,
        description: 'Waterfalls, wildlife sanctuaries, valleys & heritage across 24 districts',
      },
      {
        label: 'Interactive Map',
        href: '/map',
        icon: MapPin,
        description: 'Geospatial exploration with district and category filters',
      },
      {
        label: 'Photo Gallery',
        href: '/gallery',
        icon: Globe2,
        description: 'Curated visual showcase of Jharkhand’s natural and tribal splendor',
      },
    ],
  },
  {
    id: 'travel-stays',
    label: 'Stays & Travel',
    items: [
      {
        label: 'Accommodations',
        href: '/accommodations',
        icon: Building2,
        description: 'Eco-resorts, verified rural homestays, and forest rest houses',
      },
      {
        label: 'Guided Tours',
        href: '/tours',
        icon: Compass,
        description: 'Certified local guides, cultural trails & adventure circuits',
      },
      {
        label: 'Transport Services',
        href: '/transport',
        icon: Car,
        description: 'Local cab operators, safari vehicles, and inter-district rentals',
      },
      {
        label: 'Experiences & Adventure',
        href: '/experiences',
        icon: Sparkles,
        description: 'Trekking, watersports, birdwatching & tribal immersion',
      },
    ],
  },
  {
    id: 'culture-community',
    label: 'Culture & Stories',
    items: [
      {
        label: 'Travel Blogs',
        href: '/blogs',
        icon: BookOpen,
        description: 'Travel stories, itinerary guides & insider traveler tips',
      },
      {
        label: 'Festivals & Events',
        href: '/events',
        icon: Calendar,
        description: 'Sarhul, Karma, Tusu Parab, Sohrai and regional cultural fairs',
      },
      {
        label: 'Share Feedback',
        href: '/feedback',
        icon: MessageSquare,
        description: 'Traveler ratings, community reviews & visitor suggestions',
      },
      {
        label: 'About Jharkhand',
        href: '/about',
        icon: Info,
        description: 'Mission, sustainable eco-tourism pillars & cultural heritage',
      },
    ],
  },
];

export const publicNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Map', href: '/map', icon: MapPin },
  { label: 'Gallery', href: '/gallery', icon: Globe2 },
  { label: 'Accommodations', href: '/accommodations', icon: Building2 },
  { label: 'Tours', href: '/tours', icon: Compass },
  { label: 'Transport', href: '/transport', icon: Car },
  { label: 'Experiences', href: '/experiences', icon: Sparkles },
  { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { label: 'Blogs', href: '/blogs', icon: BookOpen },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Feedback', href: '/feedback', icon: MessageSquare },
];

export const partnerNavItems = [
  { label: 'Service Provider', href: '/provider', role: 'provider' as const },
  { label: 'Government Login', href: '/auth/government', role: 'admin' as const },
];

export const touristNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/tourist', icon: Home },
  { label: 'Explore', href: '/tourist/explore', icon: Compass },
  { label: 'Trips', href: '/tourist/itinerary', icon: MapPin },
  { label: 'Profile', href: '/tourist/profile', icon: Users },
  { label: 'Audio Guide', href: '/tourist/audio-guide', icon: Users },
  { label: 'Eco Passport', href: '/tourist/eco-passport', icon: ShieldCheck },
  { label: 'AR Craft', href: '/tourist/ar', icon: Globe2 },
];

export const providerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/provider', icon: Home },
  { label: 'Profile', href: '/provider/profile', icon: Users },
  { label: 'Listings', href: '/provider/listings', icon: Store },
  { label: 'Products', href: '/provider/products', icon: Compass },
  { label: 'Experiences', href: '/provider/experiences', icon: Globe2 },
  { label: 'Stays', href: '/provider/stays', icon: MapPin },
  { label: 'Requests', href: '/provider/requests', icon: ShieldCheck },
  { label: 'Reviews', href: '/provider/reviews', icon: BarChart3 },
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
