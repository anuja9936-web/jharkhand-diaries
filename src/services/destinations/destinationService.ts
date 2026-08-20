import { supabase } from '../../lib/supabase';
import type {
  Destination,
  DestinationCategory,
} from '../../types/destination';
import { DESTINATION_CATEGORY_LABELS } from '../../constants/destinations';
import { VERIFIED_JHARKHAND_DESTINATIONS } from '../../constants/jharkhandDistrictsGeo';
import { normalizeSearchText } from '../../lib/utils';

function getSupabaseClient() {
  return supabase;
}

async function fetchPublishedDestinations(): Promise<Destination[]> {
  const client = getSupabaseClient();
  if (!client) {
    return VERIFIED_JHARKHAND_DESTINATIONS;
  }

  try {
    const { data, error } = await client
      .from('destinations')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SUPABASE] fetchPublishedDestinations error, using fallback data', error);
      return VERIFIED_JHARKHAND_DESTINATIONS;
    }

    if (!data || data.length === 0) {
      return VERIFIED_JHARKHAND_DESTINATIONS;
    }

    // Merge Supabase destinations with verified dataset ensuring no duplicate slugs
    const existingSlugs = new Set((data as Destination[]).map((d) => d.slug));
    const supplemental = VERIFIED_JHARKHAND_DESTINATIONS.filter((d) => !existingSlugs.has(d.slug));

    return [...(data as Destination[]), ...supplemental];
  } catch (err) {
    console.warn('[SUPABASE] error fetching destinations, falling back', err);
    return VERIFIED_JHARKHAND_DESTINATIONS;
  }
}

export async function getPublishedDestinations(): Promise<Destination[]> {
  return fetchPublishedDestinations();
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('destinations')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (!error && data) {
        return data as Destination;
      }
    } catch (err) {
      console.warn('[SUPABASE] getDestinationBySlug fetch error', err);
    }
  }

  const fallback = VERIFIED_JHARKHAND_DESTINATIONS.find((d) => d.slug === slug || d.id === slug);
  return fallback ?? null;
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

/**
 * Returns up to `limit` published destinations related to the given one,
 * preferring same-category, then same-district matches.
 * The source destination is always excluded from results.
 */
export async function getRelatedDestinations(
  excludeId: string,
  category: DestinationCategory,
  district: string,
  limit = 4
): Promise<Destination[]> {
  const all = await fetchPublishedDestinations();
  const others = all.filter((d) => d.id !== excludeId);

  // Prefer same category
  const sameCat = others.filter((d) => d.category === category);
  if (sameCat.length >= limit) {
    return sameCat.slice(0, limit);
  }

  // Supplement with same district
  const sameDistrict = others.filter(
    (d) => d.category !== category && normalizeSearchText(d.district) === normalizeSearchText(district)
  );

  return [...sameCat, ...sameDistrict].slice(0, limit);
}

