import type { UserRole } from '../types/common';

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  tourist: '/tourist/dashboard',
  provider: '/provider/dashboard',
  admin: '/admin/dashboard',
};

export function isUserRole(value: unknown): value is UserRole {
  return value === 'tourist' || value === 'provider' || value === 'admin';
}

export function normalizePersistedRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') {
    return null;
  }

  if (value === 'vendor') {
    return 'provider';
  }

  return isUserRole(value) ? value : null;
}

export function normalizePublicRegistrationRole(value: unknown): Extract<UserRole, 'tourist' | 'provider'> | null {
  if (typeof value !== 'string') {
    return null;
  }

  if (value === 'vendor') {
    return 'provider';
  }

  return value === 'tourist' || value === 'provider' ? value : null;
}

export function getDashboardPathForRole(role: UserRole): string {
  return ROLE_DASHBOARD_PATHS[role];
}
