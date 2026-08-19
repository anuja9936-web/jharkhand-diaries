import { useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../types/common';
import { normalizePersistedRole, normalizePublicRegistrationRole } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { getProfileByUserId } from '../services/users/profileService';
import { AuthContext } from './auth-context';

interface AuthActionResult {
  error: string | null;
  needsConfirmation?: boolean;
}

interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  role: Extract<UserRole, 'tourist' | 'provider'>;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (input: SignUpInput) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  refreshProfile: () => Promise<void>;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getFriendlyAuthError(error: unknown): string {
  const rawMessage =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'We could not complete that request.';

  const message = rawMessage.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }

  if (message.includes('user already registered')) {
    return 'That email is already registered. Please sign in instead.';
  }

  if (message.includes('password') && message.includes('weak')) {
    return 'Please choose a stronger password.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please try again.';
  }

  if (message.includes('email') && message.includes('confirm')) {
    return 'Please check your email to confirm your account.';
  }

  return rawMessage;
}

async function loadProfileWithRetry(userId: string): Promise<Profile | null> {
  if (!supabase) {
    return null;
  }

  const attempts = 4;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const profile = await getProfileByUserId(userId);

    if (profile) {
      return profile;
    }

    if (attempt < attempts - 1) {
      await delay(250);
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = async (nextSession: Session | null) => {
    if (!nextSession) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSession(nextSession);
    setUser(nextSession.user);

    try {
      const loadedProfile = await loadProfileWithRetry(nextSession.user.id);
      setProfile(loadedProfile);
    } catch (error) {
      console.error('[AUTH] Failed to load profile', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const client = supabase;

    if (!client) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const initialize = async () => {
      const { data, error } = await client.auth.getSession();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error('[AUTH] Failed to load current session', error);
        setLoading(false);
        return;
      }

      await syncSession(data.session);
    };

    initialize();

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) {
        return;
      }

      void syncSession(nextSession);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const role: UserRole = (() => {
    const profileRole = normalizePersistedRole(profile?.role);
    const registrationRole = normalizePublicRegistrationRole(session?.user.user_metadata?.role);

    return profileRole ?? registrationRole ?? 'tourist';
  })();

  const signIn = async (email: string, password: string): Promise<AuthActionResult> => {
    if (!supabase) {
      return { error: 'Supabase is not configured.' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: getFriendlyAuthError(error) };
    }

    return { error: null };
  };

  const signUp = async (input: SignUpInput): Promise<AuthActionResult> => {
    if (!supabase) {
      return { error: 'Supabase is not configured.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          role: input.role,
        },
      },
    });

    if (error) {
      return { error: getFriendlyAuthError(error) };
    }

    return {
      error: null,
      needsConfirmation: !data.session,
    };
  };

  const signOut = async (): Promise<AuthActionResult> => {
    if (!supabase) {
      return { error: 'Supabase is not configured.' };
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: getFriendlyAuthError(error) };
    }

    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);

    return { error: null };
  };

  const refreshProfile = async () => {
    if (!session?.user || !supabase) {
      return;
    }

    try {
      const loadedProfile = await loadProfileWithRetry(session.user.id);
      setProfile(loadedProfile);
    } catch (error) {
      console.error('[AUTH] Failed to refresh profile', error);
    }
  };

  const value: AuthContextValue = {
    user,
    session,
    profile,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
