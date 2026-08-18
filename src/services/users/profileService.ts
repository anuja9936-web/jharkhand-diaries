import type { Profile, UserRole } from '../../types/common';
import { supabase } from '../../lib/supabase';

export interface CreateProfileInput {
  clerk_user_id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
}

export async function getProfileByClerkUserId(clerkUserId: string): Promise<Profile | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Profile | null;
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.from('profiles').insert(input).select('*').single();

  if (error) {
    throw error;
  }

  return data as Profile;
}

export async function upsertProfile(input: CreateProfileInput): Promise<Profile> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.from('profiles').upsert(input).select('*').single();

  if (error) {
    throw error;
  }

  return data as Profile;
}

export async function getRoleForClerkUserId(clerkUserId: string): Promise<UserRole | null> {
  const profile = await getProfileByClerkUserId(clerkUserId);
  return profile?.role ?? null;
}

