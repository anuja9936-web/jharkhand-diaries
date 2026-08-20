import type { Profile, UserRole } from '../../types/common';
import { supabase } from '../../lib/supabase';

export interface CreateProfileInput {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
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

export async function updateProfile(
  userId: string,
  updates: Partial<
    Pick<
      Profile,
      | 'full_name'
      | 'email'
      | 'phone'
      | 'avatar_url'
      | 'business_name'
      | 'owner_name'
      | 'description'
      | 'address'
      | 'district'
      | 'state'
      | 'website_url'
      | 'social_links'
      | 'provider_categories'
      | 'profile_image_url'
      | 'cover_image_url'
    >
  >
): Promise<Profile> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select('*').single();

  if (error) {
    throw error;
  }

  return data as Profile;
}

export async function getRoleForUserId(userId: string): Promise<UserRole | null> {
  const profile = await getProfileByUserId(userId);
  return profile?.role ?? null;
}
