import { supabase } from '../../lib/supabase';
import type { Destination, DestinationCategory, DestinationStatus } from '../../types/destination';

function getClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

async function getCurrentUserId() {
  const client = getClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Please sign in as a provider to manage listings.');
  }

  return data.user.id;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface ProviderListingInput {
  name: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  district: string;
  category: DestinationCategory;
  latitude?: number | null;
  longitude?: number | null;
  cover_image?: string | null;
  gallery?: string[];
  eco_zone?: boolean;
  best_time?: string | null;
  entry_fee?: number | null;
  status?: DestinationStatus;
}

export async function getMyProviderListings(): Promise<Destination[]> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('destinations')
    .select('*')
    .eq('provider_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Destination[];
}

export async function getProviderListingById(listingId: string): Promise<Destination | null> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('destinations')
    .select('*')
    .eq('id', listingId)
    .eq('provider_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Destination | null) ?? null;
}

function buildListingPayload(input: ProviderListingInput, providerId: string) {
  const name = input.name.trim();
  const slug = (input.slug?.trim() || slugify(name)).toLowerCase();
  const district = input.district.trim();
  const shortDescription = input.short_description?.trim() || null;
  const description = input.description?.trim() || null;
  const coverImage = input.cover_image?.trim() || null;
  const bestTime = input.best_time?.trim() || null;
  const gallery = (input.gallery ?? [])
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    provider_id: providerId,
    name,
    slug,
    short_description: shortDescription,
    description,
    district,
    category: input.category,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    cover_image: coverImage,
    gallery,
    eco_zone: input.eco_zone ?? false,
    best_time: bestTime,
    entry_fee: input.entry_fee ?? null,
    status: input.status ?? 'draft',
  };
}

export async function createProviderListing(input: ProviderListingInput): Promise<Destination> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client.from('destinations').insert(buildListingPayload(input, userId)).select('*').single();

  if (error) {
    throw error;
  }

  return data as Destination;
}

export async function updateProviderListing(listingId: string, input: ProviderListingInput): Promise<Destination> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('destinations')
    .update(buildListingPayload(input, userId))
    .eq('id', listingId)
    .eq('provider_id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Destination;
}

export async function deleteProviderListing(listingId: string): Promise<void> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { error } = await client.from('destinations').delete().eq('id', listingId).eq('provider_id', userId);

  if (error) {
    throw error;
  }
}
