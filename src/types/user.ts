import type { Profile, UserRole } from './common';

export type UserProfile = Profile;

export interface CurrentUserProfileState {
  profile: Profile | null;
  role: UserRole;
  isHydrated: boolean;
}

