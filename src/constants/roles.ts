import type { UserRole } from '../types/common';

export const USER_ROLES = {
  TOURIST: 'tourist',
  VENDOR: 'vendor',
  ADMIN: 'admin',
} as const satisfies Record<string, UserRole>;

export const ROLE_LABELS: Record<UserRole, string> = {
  tourist: 'Tourist',
  vendor: 'Vendor',
  admin: 'Admin',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  tourist: 'Explore destinations, plan trips, and save experiences.',
  vendor: 'Manage listings, verification, earnings, and local services.',
  admin: 'Monitor tourism activity and support platform operations.',
};

export const ROLE_ACCESS_ORDER: UserRole[] = ['tourist', 'vendor', 'admin'];
