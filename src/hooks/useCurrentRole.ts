import { useAuth } from './useAuth';
import type { CurrentUserProfileState } from '../types/user';

export function useCurrentRole(): CurrentUserProfileState {
  const { loading, profile, role } = useAuth();

  return {
    profile,
    role,
    isHydrated: !loading,
  };
}
