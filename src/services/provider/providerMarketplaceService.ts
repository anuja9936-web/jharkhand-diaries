import { supabase } from '../../lib/supabase';
import type {
  ProviderCapability,
  ProviderNotification,
  ProviderOffering,
  ProviderOfferingKind,
  ProviderOfferingStatus,
  ProviderPublicProfile,
  ProviderRequest,
  ProviderRequestStatus,
  ProviderRequestType,
  ProviderVerificationStatus,
} from '../../types/provider';
import { JHARKHAND_ACCOMMODATIONS } from '../../constants/accommodationsData';
import {
  JHARKHAND_MARKETPLACE_PRODUCTS,
  JHARKHAND_MARKETPLACE_EXPERIENCES,
  JHARKHAND_CURATED_TOURS,
  JHARKHAND_CURATED_TRANSPORT,
} from '../../constants/marketplaceData';

const ALL_CURATED_OFFERINGS: ProviderOffering[] = [
  ...JHARKHAND_ACCOMMODATIONS,
  ...JHARKHAND_MARKETPLACE_PRODUCTS,
  ...JHARKHAND_MARKETPLACE_EXPERIENCES,
  ...JHARKHAND_CURATED_TOURS,
  ...JHARKHAND_CURATED_TRANSPORT,
];

function getClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

export async function getCurrentProviderUserId(): Promise<string> {
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
  offeringKind?: ProviderOfferingKind | null;
  requestType: ProviderRequestType;
  touristName: string;
  touristEmail?: string | null;
  preferredDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  duration?: string | null;
  participants?: number;
  numberOfPeople?: number;
  message?: string | null;
  estimatedAmount?: number | null;
  details?: Record<string, unknown>;
}

export interface ProviderRequestWithOffering extends ProviderRequest {
  offering?: Pick<ProviderOffering, 'id' | 'kind' | 'name' | 'slug' | 'cover_image' | 'district' | 'price'> | null;
}

export interface ProviderAnalyticsSummary {
  totalOfferings: number;
  publishedOfferings: number;
  draftOfferings: number;
  totalsByKind: Record<ProviderOfferingKind, number>;
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
  totalReviews: number;
  averageRating: number | null;
  profileCompletion: number;
  verificationStatus: ProviderVerificationStatus;
}

// ---------------------------------------------------------------------------
// Provider Offerings CRUD
// ---------------------------------------------------------------------------

export async function getMyProviderOfferings(kind?: ProviderOfferingKind): Promise<ProviderOffering[]> {
  const client = getClient();
  const userId = await getCurrentProviderUserId();

  let dbOfferings: ProviderOffering[] = [];

  try {
    let query = client
      .from('provider_offerings')
      .select('*')
      .eq('provider_id', userId)
      .order('updated_at', { ascending: false });

    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query;
    if (!error && data) {
      dbOfferings = data as ProviderOffering[];
    }
  } catch (err) {
    console.warn('[providerMarketplaceService] getMyProviderOfferings error:', err);
  }

  // Include curated demo offerings mapped to this provider's ID
  const curated = ALL_CURATED_OFFERINGS.filter((o) => !kind || o.kind === kind).map((o) => ({
    ...o,
    provider_id: userId,
  }));

  const dbSlugs = new Set(dbOfferings.map((o) => `${o.kind}:${o.slug}`));
  const combined = [...dbOfferings, ...curated.filter((c) => !dbSlugs.has(`${c.kind}:${c.slug}`))];

  return combined;
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
  const userId = await getCurrentProviderUserId();

  try {
    const { data, error } = await client
      .from('provider_offerings')
      .select('*')
      .eq('id', offeringId)
      .eq('provider_id', userId)
      .maybeSingle();

    if (!error && data) {
      return data as ProviderOffering;
    }
  } catch {
    // Non-fatal, check curated
  }

  // Check fallback curated
  const curated = ALL_CURATED_OFFERINGS.find((o) => o.id === offeringId || o.slug === offeringId);
  if (curated) {
    return { ...curated, provider_id: userId };
  }

  return null;
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
    // Fallback
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
  const userId = await getCurrentProviderUserId();

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
  const userId = await getCurrentProviderUserId();

  // If updating a curated offering that is not in DB yet, insert it with this offeringId
  const { data: existing } = await client
    .from('provider_offerings')
    .select('id')
    .eq('id', offeringId)
    .maybeSingle();

  if (!existing) {
    const { data: inserted, error: insertError } = await client
      .from('provider_offerings')
      .insert({
        ...buildOfferingPayload(input, userId),
        id: offeringId,
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }
    return inserted as ProviderOffering;
  }

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
  const userId = await getCurrentProviderUserId();

  const { error } = await client
    .from('provider_offerings')
    .delete()
    .eq('id', offeringId)
    .eq('provider_id', userId);

  if (error) {
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Provider Requests & Bookings
// ---------------------------------------------------------------------------

export async function getMyProviderRequests(): Promise<ProviderRequestWithOffering[]> {
  const client = getClient();
  const userId = await getCurrentProviderUserId();

  let dbRequests: ProviderRequestWithOffering[] = [];

  try {
    const { data, error } = await client
      .from('provider_requests')
      .select('*, offering:provider_offerings(id, kind, name, slug, cover_image, district, price)')
      .eq('provider_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      dbRequests = data as ProviderRequestWithOffering[];
    }

    // Also look for category-relevant requests for demo/test provider experience
    const { data: allReqs } = await client
      .from('provider_requests')
      .select('*, offering:provider_offerings(id, kind, name, slug, cover_image, district, price)')
      .neq('provider_id', userId)
      .order('created_at', { ascending: false });

    if (allReqs && allReqs.length > 0) {
      const { data: prof } = await client
        .from('profiles')
        .select('provider_categories')
        .eq('id', userId)
        .maybeSingle();

      const cats = ((prof?.provider_categories ?? []) as string[]).map((c) => c.toLowerCase());
      const demoReqs = (allReqs as ProviderRequestWithOffering[]).filter((r) => {
        const isDemo = r.provider_id.startsWith('a1111111') ||
          r.provider_id.startsWith('a2222222') ||
          r.provider_id.startsWith('a3333333') ||
          r.provider_id.startsWith('a4444444') ||
          r.provider_id.startsWith('a5555555') ||
          r.provider_id.startsWith('00000000');

        if (!isDemo) return false;
        const kind = r.offering_kind || (r.offering as ProviderOffering)?.kind;
        if (!kind) return true;
        return cats.includes(kind) || (kind === 'stay' && cats.includes('accommodation'));
      });

      const existingIds = new Set(dbRequests.map((r) => r.id));
      for (const req of demoReqs) {
        if (!existingIds.has(req.id)) {
          dbRequests.push(req);
        }
      }
    }
  } catch (err) {
    console.warn('[providerMarketplaceService] getMyProviderRequests error:', err);
  }

  // Attach curated offering details if offering relation is empty
  dbRequests.forEach((req) => {
    if (!req.offering && req.offering_id) {
      const curated = ALL_CURATED_OFFERINGS.find((o) => o.id === req.offering_id || o.slug === req.offering_id);
      if (curated) {
        req.offering = {
          id: curated.id,
          kind: curated.kind,
          name: curated.name,
          slug: curated.slug,
          cover_image: curated.cover_image,
          district: curated.district,
          price: curated.price,
        };
      }
    }
  });

  return dbRequests;
}

export async function getProviderRequestById(requestId: string): Promise<ProviderRequestWithOffering | null> {
  const client = getClient();

  const { data, error } = await client
    .from('provider_requests')
    .select('*, offering:provider_offerings(id, kind, name, slug, cover_image, district)')
    .eq('id', requestId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ProviderRequestWithOffering | null) ?? null;
}

/**
 * Helper to resolve the true provider user ID in Supabase
 */
async function resolveProviderId(offeringProviderId: string, kind?: ProviderOfferingKind | null): Promise<string> {
  const client = getClient();

  // If the offering's provider_id exists in profiles/auth, use it
  if (offeringProviderId && !offeringProviderId.startsWith('a1111111') && !offeringProviderId.startsWith('00000000')) {
    const { data: exists } = await client
      .from('profiles')
      .select('id')
      .eq('id', offeringProviderId)
      .maybeSingle();

    if (exists?.id) {
      return exists.id;
    }
  }

  // Find a registered provider matching the category
  const categoryToSearch = kind === 'stay' ? 'accommodation' : kind;
  if (categoryToSearch) {
    const { data: matchingProvider } = await client
      .from('profiles')
      .select('id')
      .eq('role', 'provider')
      .contains('provider_categories', [categoryToSearch])
      .limit(1)
      .maybeSingle();

    if (matchingProvider?.id) {
      return matchingProvider.id;
    }
  }

  // Fallback to any registered provider profile
  const { data: anyProvider } = await client
    .from('profiles')
    .select('id')
    .eq('role', 'provider')
    .limit(1)
    .maybeSingle();

  if (anyProvider?.id) {
    return anyProvider.id;
  }

  return offeringProviderId;
}

export async function createProviderRequest(input: ProviderRequestInput): Promise<ProviderRequest> {
  const client = getClient();
  const { data: authData } = await client.auth.getUser();
  const touristId = authData?.user?.id ?? null;

  if (!touristId) {
    throw new Error('Please sign in to submit a booking or inquiry request.');
  }

  const participantsCount = input.numberOfPeople || input.participants || 1;
  const dateValue = input.startDate || input.preferredDate || null;

  // Resolve target provider ID
  const resolvedProviderId = await resolveProviderId(input.providerId, input.offeringKind);

  // Proactively ensure tourist profile has role = 'tourist' so legacy RLS checks pass
  try {
    const { data: prof } = await client.from('profiles').select('id, role').eq('id', touristId).maybeSingle();
    if (!prof) {
      await client.from('profiles').insert({
        id: touristId,
        full_name: input.touristName.trim() || authData?.user?.user_metadata?.full_name || 'Valued Tourist',
        email: input.touristEmail?.trim() || authData?.user?.email,
        role: 'tourist',
      });
    } else if (!prof.role || prof.role === 'user') {
      await client.from('profiles').update({ role: 'tourist' }).eq('id', touristId);
    }
  } catch (err) {
    console.warn('[providerMarketplaceService] Profile role sync notice:', err);
  }

  // Check if offering exists in DB; if curated offering, ensure valid ID reference
  let validOfferingId: string | null = null;
  if (input.offeringId) {
    const { data: dbOffering } = await client
      .from('provider_offerings')
      .select('id')
      .eq('id', input.offeringId)
      .maybeSingle();

    if (dbOffering?.id) {
      validOfferingId = dbOffering.id;
    }
  }

  // Attempt 1: Full payload with enhanced columns
  try {
    const { data, error } = await client
      .from('provider_requests')
      .insert({
        provider_id: resolvedProviderId,
        offering_id: validOfferingId,
        offering_kind: input.offeringKind ?? null,
        request_type: input.requestType,
        tourist_id: touristId,
        tourist_name: input.touristName.trim() || 'Valued Tourist',
        tourist_email: input.touristEmail?.trim() || null,
        preferred_date: dateValue,
        start_date: input.startDate ?? dateValue,
        end_date: input.endDate ?? null,
        duration: input.duration ?? null,
        participants: participantsCount,
        number_of_people: participantsCount,
        message: input.message?.trim() || null,
        estimated_amount: input.estimatedAmount ?? null,
        details: {
          ...(input.details || {}),
          curated_offering_id: input.offeringId,
        },
        status: 'pending',
      })
      .select('*')
      .single();

    if (!error && data) {
      return data as ProviderRequest;
    }

    if (error && !error.message?.toLowerCase().includes('column') && !error.message?.toLowerCase().includes('schema cache')) {
      throw error;
    }
  } catch (err) {
    console.warn('[providerMarketplaceService] Enhanced insert failed, attempting baseline schema fallback:', err);
  }

  // Attempt 2: Baseline schema fallback (if newer migration columns not yet in Supabase schema cache)
  const legacyRequestType =
    input.requestType === 'tour' || input.requestType === 'transport' || input.requestType === 'enquiry'
      ? 'booking'
      : input.requestType;

  const extraNotes = [
    input.offeringKind ? `[Category: ${input.offeringKind}]` : '',
    input.startDate ? `[Start: ${input.startDate}]` : '',
    input.endDate ? `[End: ${input.endDate}]` : '',
    input.estimatedAmount ? `[Est: ₹${input.estimatedAmount}]` : '',
    input.details?.pickupLocation ? `[Pickup: ${input.details.pickupLocation}]` : '',
    input.details?.dropDestination ? `[Drop: ${input.details.dropDestination}]` : '',
    input.details?.deliveryAddress ? `[Delivery: ${input.details.deliveryAddress}]` : '',
    input.message?.trim() || '',
  ]
    .filter(Boolean)
    .join(' ');

  const { data: fallbackData, error: fallbackError } = await client
    .from('provider_requests')
    .insert({
      provider_id: resolvedProviderId,
      offering_id: validOfferingId,
      request_type: legacyRequestType,
      tourist_id: touristId,
      tourist_name: input.touristName.trim() || 'Valued Tourist',
      tourist_email: input.touristEmail?.trim() || null,
      preferred_date: dateValue,
      duration: input.duration ?? null,
      participants: participantsCount,
      message: extraNotes || null,
      status: 'pending',
    })
    .select('*')
    .single();

  if (fallbackError) {
    console.error('[providerMarketplaceService] createProviderRequest fallback error:', fallbackError.message);
    throw new Error(fallbackError.message || 'Unable to submit booking request.');
  }

  return fallbackData as ProviderRequest;
}

export async function updateProviderRequestStatus(
  requestId: string,
  status: ProviderRequestStatus,
  providerResponse?: string
): Promise<ProviderRequest> {
  const client = getClient();

  const updatePayload: Record<string, unknown> = { status };
  if (providerResponse !== undefined) {
    updatePayload.provider_response = providerResponse.trim() || null;
  }

  const { data, error } = await client
    .from('provider_requests')
    .update(updatePayload)
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) {
    console.error('[providerMarketplaceService] updateProviderRequestStatus error:', error.message);
    throw new Error(error.message || 'Unable to update request status.');
  }

  return data as ProviderRequest;
}

// ---------------------------------------------------------------------------
// Provider Profile & Capabilities
// ---------------------------------------------------------------------------

export async function getPublicProviderProfile(providerId: string): Promise<ProviderPublicProfile | null> {
  const client = getClient();
  const { data, error } = await client.rpc('get_public_provider_profile', { provider_user_id: providerId });

  if (error) {
    // If RPC is missing verification columns in older db, fallback to direct select
    const { data: profileData, error: profileErr } = await client
      .from('profiles')
      .select('id, full_name, business_name, owner_name, description, phone, avatar_url, cover_image_url, address, district, state, website_url, provider_categories, verification_status, created_at')
      .eq('id', providerId)
      .maybeSingle();

    if (profileErr || !profileData) {
      return null;
    }
    return profileData as ProviderPublicProfile;
  }

  const rows = (data ?? []) as ProviderPublicProfile[];
  return rows[0] ?? null;
}

export async function updateProviderCapabilities(capabilities: ProviderCapability[]): Promise<void> {
  const client = getClient();
  const userId = await getCurrentProviderUserId();

  const { error } = await client
    .from('profiles')
    .update({ provider_categories: capabilities })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function submitProviderVerification(
  verificationDetails: Record<string, unknown>
): Promise<void> {
  const client = getClient();
  const userId = await getCurrentProviderUserId();

  const { error } = await client
    .from('profiles')
    .update({
      verification_status: 'under_review',
      verification_details: verificationDetails,
      verification_submitted_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function getMyProviderNotifications(): Promise<ProviderNotification[]> {
  try {
    const client = getClient();
    const userId = await getCurrentProviderUserId();

    const { data, error } = await client
      .from('provider_notifications')
      .select('*')
      .eq('provider_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      return [];
    }

    return (data ?? []) as ProviderNotification[];
  } catch {
    return [];
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    const client = getClient();
    const userId = await getCurrentProviderUserId();

    await client
      .from('provider_notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('provider_id', userId);
  } catch {
    // Non-fatal
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const client = getClient();
    const userId = await getCurrentProviderUserId();

    await client
      .from('provider_notifications')
      .update({ read: true })
      .eq('provider_id', userId)
      .eq('read', false);
  } catch {
    // Non-fatal
  }
}
