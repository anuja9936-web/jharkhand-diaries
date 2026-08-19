import type { UserRole } from '../types/common';

export const USER_ROLES = {
  TOURIST: 'tourist',
  PROVIDER: 'provider',
  ADMIN: 'admin',
} as const satisfies Record<string, UserRole>;

export const ROLE_LABELS: Record<UserRole, string> = {
  tourist: 'Tourist',
  provider: 'Service Provider',
  admin: 'Government / Admin',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  tourist: 'Explore destinations, plan trips, and save experiences.',
  provider: 'Manage listings, verification, earnings, and local services.',
  admin: 'Monitor tourism activity and support platform operations.',
};

export const ROLE_ACCESS_ORDER: UserRole[] = ['tourist', 'provider', 'admin'];
