import { supabase } from '../../lib/supabase';
import type {
  Destination,
  DestinationCategory,
} from '../../types/destination';
import { DESTINATION_CATEGORY_LABELS } from '../../constants/destinations';
import { normalizeSearchText } from '../../lib/utils';

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

async function fetchPublishedDestinations(): Promise<Destination[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('destinations')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SUPABASE] fetchPublishedDestinations error', error);
    throw error;
  }

  console.log('[SUPABASE] fetchPublishedDestinations count', data?.length ?? 0);
  return (data ?? []) as Destination[];
}

export async function getPublishedDestinations(): Promise<Destination[]> {
  return fetchPublishedDestinations();
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  console.log('[SUPABASE] getDestinationBySlug request', slug);
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('[SUPABASE] getDestinationBySlug error', error);
    throw error;
  }

  console.log('[SUPABASE] getDestinationBySlug result', data);
  return (data as Destination | null) ?? null;
}

export async function getDestinationsByCategory(category: DestinationCategory): Promise<Destination[]> {
  const destinations = await fetchPublishedDestinations();
  return destinations.filter((destination) => destination.category === category);
}

export async function getDestinationsByDistrict(district: string): Promise<Destination[]> {
  const normalizedDistrict = normalizeSearchText(district);
  const destinations = await fetchPublishedDestinations();
  return destinations.filter((destination) => normalizeSearchText(destination.district) === normalizedDistrict);
}

export async function searchDestinations(searchTerm: string): Promise<Destination[]> {
  const normalizedSearch = normalizeSearchText(searchTerm);

  if (!normalizedSearch) {
    return fetchPublishedDestinations();
  }

  const destinations = await fetchPublishedDestinations();

  return destinations.filter((destination) => {
    const searchableText = [
      destination.name,
      destination.district,
      destination.category,
      DESTINATION_CATEGORY_LABELS[destination.category],
      destination.short_description,
      destination.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
}
