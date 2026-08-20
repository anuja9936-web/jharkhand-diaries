/**
 * Public Offering Service
 *
 * A separate public-facing service for reading published provider offerings
 * WITHOUT requiring authentication. The existing providerMarketplaceService.ts
 * requires auth (calls getCurrentUserId()), making it unsuitable for public
 * pages like destination detail "Experiences Nearby" and "Stay Nearby".
 *
 * This service uses the anon Supabase client with RLS policies that permit
 * reading published offerings without an authenticated session.
 */

import { supabase } from '../../lib/supabase';
import type { ProviderOffering, ProviderOfferingKind } from '../../types/provider';
import { normalizeSearchText } from '../../lib/utils';
import { JHARKHAND_ACCOMMODATIONS } from '../../constants/accommodationsData';
import {
  JHARKHAND_MARKETPLACE_PRODUCTS,
  JHARKHAND_MARKETPLACE_EXPERIENCES,
} from '../../constants/marketplaceData';

const ALL_CURATED_OFFERINGS: ProviderOffering[] = [
  ...JHARKHAND_ACCOMMODATIONS,
  ...JHARKHAND_MARKETPLACE_PRODUCTS,
  ...JHARKHAND_MARKETPLACE_EXPERIENCES,
];

function getClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
  return supabase;
}

/**
 * Fetch published provider offerings by district and optional kind.
 * Prioritizes database rows and seamlessly falls back to curated catalog.
 */
export async function getPublishedOfferingsByDistrict(
  district: string,
  kind?: ProviderOfferingKind,
  limit = 6
): Promise<ProviderOffering[]> {
  const normalizedDistrict = normalizeSearchText(district);
  let dbOfferings: ProviderOffering[] = [];

  try {
    const client = getClient();

    let query = client
      .from('provider_offerings')
      .select('*')
      .eq('status', 'published')
      .limit(limit);

    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query;

    if (!error && data) {
      dbOfferings = (data as ProviderOffering[]).filter(
        (o) => o.district && normalizeSearchText(o.district) === normalizedDistrict
      );
    }
  } catch (err) {
    console.warn('[publicOfferingService] getPublishedOfferingsByDistrict DB error', err);
  }

  const curated = ALL_CURATED_OFFERINGS.filter(
    (o) =>
      (!kind || o.kind === kind) &&
      o.district &&
      normalizeSearchText(o.district) === normalizedDistrict
  );

  const dbIds = new Set(dbOfferings.map((o) => o.id));
  const combined = [...dbOfferings, ...curated.filter((c) => !dbIds.has(c.id))];

  return combined.slice(0, limit);
}

/**
 * Fetch a set of published offerings across any district.
 */
export async function getPublishedOfferingsByKind(
  kind: ProviderOfferingKind,
  limit = 6
): Promise<ProviderOffering[]> {
  let dbOfferings: ProviderOffering[] = [];

  try {
    const client = getClient();

    const { data, error } = await client
      .from('provider_offerings')
      .select('*')
      .eq('status', 'published')
      .eq('kind', kind)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      dbOfferings = data as ProviderOffering[];
    }
  } catch (err) {
    console.warn('[publicOfferingService] getPublishedOfferingsByKind DB error', err);
  }

  const curated = ALL_CURATED_OFFERINGS.filter((o) => o.kind === kind);
  const dbIds = new Set(dbOfferings.map((o) => o.id));
  const combined = [...dbOfferings, ...curated.filter((c) => !dbIds.has(c.id))];

  return combined.slice(0, limit);
}
