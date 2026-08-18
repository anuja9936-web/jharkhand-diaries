import { USER_ROLES } from '../constants/roles';
import type { UserRole } from '../types/common';
import { clampRoleLabel } from './utils';

export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '';

export const clerkAppearance = {
  elements: {
    card: 'shadow-glow border border-ink-200 rounded-3xl',
    rootBox: 'w-full',
    footerActionLink: 'text-clay-700 hover:text-clay-800',
    formButtonPrimary:
      'bg-ink-900 hover:bg-ink-800 text-white shadow-lg shadow-ink-900/10 rounded-xl',
  },
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'iconButton',
  },
};

export function isUserRole(value: unknown): value is UserRole {
  return value === USER_ROLES.TOURIST || value === USER_ROLES.VENDOR || value === USER_ROLES.ADMIN;
}

export function resolveUserRole(value: unknown): UserRole | null {
  if (typeof value === 'string' && isUserRole(value)) {
    return value;
  }

  return null;
}

export function getDevDefaultRole(): UserRole {
  const configuredRole = resolveUserRole(import.meta.env.VITE_DEV_DEFAULT_ROLE);
  return configuredRole ?? 'tourist';
}

export function getMetadataRole(value: unknown): UserRole | null {
  if (typeof value === 'string') {
    return clampRoleLabel(value);
  }

  return null;
}
