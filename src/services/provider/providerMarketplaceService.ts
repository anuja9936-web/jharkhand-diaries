import { supabase } from '../../lib/supabase';
import type {
  ProviderOffering,
  ProviderOfferingKind,
  ProviderOfferingStatus,
  ProviderPublicProfile,
  ProviderRequest,
  ProviderRequestStatus,
  ProviderRequestType,
} from '../../types/provider';
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

async function getCurrentUserId() {
  const client = getClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Please sign in as a provider to manage your business.');
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

export interface ProviderOfferingInput {
  kind: ProviderOfferingKind;
  name: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  category?: string | null;
  district?: string | null;
  address?: string | null;
  price?: number | null;
  currency?: string | null;
  status?: ProviderOfferingStatus;
  cover_image?: string | null;
  gallery?: string[];
  metadata?: Record<string, unknown> | null;
}

export interface ProviderRequestInput {
  providerId: string;
  offeringId?: string | null;
  requestType: ProviderRequestType;
  touristName: string;
  touristEmail?: string | null;
  preferredDate?: string | null;
  duration?: string | null;
  participants?: number;
  message?: string | null;
}

export interface ProviderRequestWithOffering extends ProviderRequest {
  offering?: Pick<ProviderOffering, 'id' | 'kind' | 'name' | 'slug' | 'cover_image' | 'district'> | null;
}

export async function getMyProviderOfferings(kind?: ProviderOfferingKind): Promise<ProviderOffering[]> {
  const client = getClient();
  const userId = await getCurrentUserId();

  let query = client
    .from('provider_offerings')
    .select('*')
    .eq('provider_id', userId)
    .order('updated_at', { ascending: false });

  if (kind) {
    query = query.eq('kind', kind);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as ProviderOffering[];
}

export async function getPublicProviderOfferings(kind?: ProviderOfferingKind): Promise<ProviderOffering[]> {
  let dbOfferings: ProviderOffering[] = [];

  try {
    const client = getClient();

    let query = client
      .from('provider_offerings')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query;

    if (!error && data) {
      dbOfferings = data as ProviderOffering[];
    }
  } catch (err) {
    console.warn('[providerMarketplaceService] getPublicProviderOfferings DB error', err);
  }

  const curated = ALL_CURATED_OFFERINGS.filter((o) => !kind || o.kind === kind);
  const dbIds = new Set(dbOfferings.map((o) => o.id));
  const combined = [...dbOfferings, ...curated.filter((c) => !dbIds.has(c.id))];

  return combined;
}

export async function getProviderOfferingById(offeringId: string): Promise<ProviderOffering | null> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('provider_offerings')
    .select('*')
    .eq('id', offeringId)
    .eq('provider_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ProviderOffering | null) ?? null;
}

export async function getPublicProviderOfferingBySlug(
  kind: ProviderOfferingKind,
  slug: string
): Promise<ProviderOffering | null> {
  try {
    const client = getClient();

    const { data, error } = await client
      .from('provider_offerings')
      .select('*')
      .eq('kind', kind)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (!error && data) {
      return data as ProviderOffering;
    }
  } catch {
    // Fallback to curated
  }

  const found = ALL_CURATED_OFFERINGS.find((o) => o.kind === kind && o.slug === slug);
  return found ?? null;
}

export async function getPublicProviderOfferingById(offeringId: string): Promise<ProviderOffering | null> {
  try {
    const client = getClient();

    const { data, error } = await client
      .from('provider_offerings')
      .select('*')
      .eq('id', offeringId)
      .eq('status', 'published')
      .maybeSingle();

    if (!error && data) {
      return data as ProviderOffering;
    }
  } catch {
    // ID might be a non-uuid slug or mock id
  }

  const found = ALL_CURATED_OFFERINGS.find((o) => o.id === offeringId || o.slug === offeringId);
  return found ?? null;
}

export async function getPublicProviderOfferingsByProvider(
  providerId: string,
  kind?: ProviderOfferingKind
): Promise<ProviderOffering[]> {
  const client = getClient();

  let query = client
    .from('provider_offerings')
    .select('*')
    .eq('provider_id', providerId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (kind) {
    query = query.eq('kind', kind);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as ProviderOffering[];
}

function buildOfferingPayload(input: ProviderOfferingInput, providerId: string) {
  const name = input.name.trim();
  const slug = (input.slug?.trim() || slugify(name)).toLowerCase();
  const shortDescription = input.short_description?.trim() || null;
  const description = input.description?.trim() || null;
  const category = input.category?.trim() || null;
  const district = input.district?.trim() || null;
  const address = input.address?.trim() || null;
  const coverImage = input.cover_image?.trim() || null;
  const gallery = (input.gallery ?? [])
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    provider_id: providerId,
    kind: input.kind,
    name,
    slug,
    short_description: shortDescription,
    description,
    category,
    district,
    address,
    price: input.price ?? null,
    currency: input.currency?.trim() || 'INR',
    status: input.status ?? 'draft',
    cover_image: coverImage,
    gallery,
    metadata: input.metadata ?? {},
  };
}

export async function createProviderOffering(input: ProviderOfferingInput): Promise<ProviderOffering> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('provider_offerings')
    .insert(buildOfferingPayload(input, userId))
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ProviderOffering;
}

export async function updateProviderOffering(
  offeringId: string,
  input: ProviderOfferingInput
): Promise<ProviderOffering> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('provider_offerings')
    .update(buildOfferingPayload(input, userId))
    .eq('id', offeringId)
    .eq('provider_id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ProviderOffering;
}

export async function deleteProviderOffering(offeringId: string): Promise<void> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { error } = await client.from('provider_offerings').delete().eq('id', offeringId).eq('provider_id', userId);

  if (error) {
    throw error;
  }
}

export async function getMyProviderRequests(): Promise<ProviderRequestWithOffering[]> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('provider_requests')
    .select('*, offering:provider_offerings(id, kind, name, slug, cover_image, district)')
    .eq('provider_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProviderRequestWithOffering[];
}

export async function createProviderRequest(input: ProviderRequestInput): Promise<ProviderRequest> {
  const client = getClient();
  const touristId = await getCurrentUserId();

  const { data, error } = await client
    .from('provider_requests')
    .insert({
      provider_id: input.providerId,
      offering_id: input.offeringId ?? null,
      request_type: input.requestType,
      tourist_id: touristId,
      tourist_name: input.touristName.trim(),
      tourist_email: input.touristEmail?.trim() || null,
      preferred_date: input.preferredDate ?? null,
      duration: input.duration ?? null,
      participants: input.participants ?? 1,
      message: input.message?.trim() || null,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ProviderRequest;
}

export async function updateProviderRequestStatus(
  requestId: string,
  status: ProviderRequestStatus
): Promise<ProviderRequest> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('provider_requests')
    .update({ status })
    .eq('id', requestId)
    .eq('provider_id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ProviderRequest;
}

export async function getPublicProviderProfile(providerId: string): Promise<ProviderPublicProfile | null> {
  const client = getClient();
  const { data, error } = await client.rpc('get_public_provider_profile', { provider_user_id: providerId });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ProviderPublicProfile[];
  return rows[0] ?? null;
}
