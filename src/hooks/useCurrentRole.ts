import { useUser } from '@clerk/clerk-react';
import { getDevDefaultRole, getMetadataRole } from '../lib/clerk';
import type { CurrentUserProfileState } from '../types/user';

export function useCurrentRole(): CurrentUserProfileState {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return {
      profile: null,
      role: 'tourist',
      isHydrated: false,
    };
  }

  const metadataRole = getMetadataRole(user?.publicMetadata?.role);

  return {
    profile: null,
    role: metadataRole ?? getDevDefaultRole(),
    isHydrated: true,
  };
}

