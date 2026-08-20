import { supabase } from '../../lib/supabase';
import type {
  ProviderOffering,
  ProviderOfferingKind,
  ProviderPublicProfile,
  ProviderRequest,
  ProviderRequestStatus,
  ProviderRequestType,
  TouristNotification,
} from '../../types/provider';

function getClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
  return supabase;
}

export async function getCurrentUserId(): Promise<string> {
  const client = getClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Please sign in to manage bookings.');
  }

  return data.user.id;
}

export interface TouristBookingWithDetails extends ProviderRequest {
  offering?: Pick<ProviderOffering, 'id' | 'kind' | 'name' | 'slug' | 'cover_image' | 'district' | 'price'> | null;
  provider?: Pick<ProviderPublicProfile, 'id' | 'business_name' | 'full_name' | 'phone' | 'district' | 'avatar_url'> | null;
}

export interface CreateBookingRequestInput {
  providerId: string;
  offeringId?: string | null;
  offeringKind: ProviderOfferingKind;
  requestType: ProviderRequestType;
  touristName: string;
  touristEmail?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  preferredDate?: string | null;
  duration?: string | null;
  numberOfPeople?: number;
  participants?: number;
  message?: string | null;
  estimatedAmount?: number | null;
  details?: Record<string, unknown>;
}

/**
 * Fetch all booking requests made by the current authenticated tourist
 */
export async function getMyTouristBookings(): Promise<TouristBookingWithDetails[]> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('provider_requests')
    .select('*, offering:provider_offerings(id, kind, name, slug, cover_image, district, price)')
    .eq('tourist_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Tourist Booking Service] Error fetching bookings:', error.message);
    throw error;
  }

  const bookings = (data ?? []) as TouristBookingWithDetails[];

  // Attach provider profile summary and curated offering details if available
  if (bookings.length > 0) {
    const providerIds = Array.from(new Set(bookings.map((b) => b.provider_id).filter(Boolean)));
    if (providerIds.length > 0) {
      const { data: profiles } = await client
        .from('profiles')
        .select('id, business_name, full_name, phone, district, avatar_url')
        .in('id', providerIds);

      if (profiles) {
        const profileMap = new Map(profiles.map((p) => [p.id, p]));
        bookings.forEach((b) => {
          b.provider = profileMap.get(b.provider_id) || null;
        });
      }
    }
  }

  return bookings;
}

/**
 * Create a new tourist booking or inquiry request
 */
export async function createTouristBooking(input: CreateBookingRequestInput): Promise<ProviderRequest> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const participantsCount = input.numberOfPeople || input.participants || 1;
  const dateValue = input.startDate || input.preferredDate || null;

  // Resolve target provider ID
  let targetProviderId = input.providerId;
  if (!targetProviderId || targetProviderId.startsWith('a1111111') || targetProviderId.startsWith('00000000')) {
    const categoryToSearch = input.offeringKind === 'stay' ? 'accommodation' : input.offeringKind;
    const { data: matchingProvider } = await client
      .from('profiles')
      .select('id')
      .eq('role', 'provider')
      .contains('provider_categories', [categoryToSearch])
      .limit(1)
      .maybeSingle();

    if (matchingProvider?.id) {
      targetProviderId = matchingProvider.id;
    } else {
      const { data: anyProvider } = await client
        .from('profiles')
        .select('id')
        .eq('role', 'provider')
        .limit(1)
        .maybeSingle();
      if (anyProvider?.id) {
        targetProviderId = anyProvider.id;
      }
    }
  }

  // Proactively ensure tourist profile has role = 'tourist' so legacy RLS checks pass
  try {
    const { data: prof } = await client.from('profiles').select('id, role').eq('id', userId).maybeSingle();
    if (!prof) {
      const { data: authData } = await client.auth.getUser();
      await client.from('profiles').insert({
        id: userId,
        full_name: input.touristName.trim() || authData?.user?.user_metadata?.full_name || 'Valued Tourist',
        email: input.touristEmail?.trim() || authData?.user?.email,
        role: 'tourist',
      });
    } else if (!prof.role || prof.role === 'user') {
      await client.from('profiles').update({ role: 'tourist' }).eq('id', userId);
    }
  } catch (err) {
    console.warn('[Tourist Booking Service] Profile role sync notice:', err);
  }

  // Check if offering exists in DB
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
        provider_id: targetProviderId,
        offering_id: validOfferingId,
        offering_kind: input.offeringKind,
        request_type: input.requestType,
        tourist_id: userId,
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
    console.warn('[Tourist Booking Service] Enhanced insert failed, attempting baseline schema fallback:', err);
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
      provider_id: targetProviderId,
      offering_id: validOfferingId,
      request_type: legacyRequestType,
      tourist_id: userId,
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
    console.error('[Tourist Booking Service] createTouristBooking fallback error:', fallbackError.message);
    throw new Error(fallbackError.message || 'Unable to submit booking request.');
  }

  return fallbackData as ProviderRequest;
}

/**
 * Cancel a pending booking request by tourist
 */
export async function cancelTouristBooking(bookingId: string): Promise<ProviderRequest> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('provider_requests')
    .update({ status: 'cancelled' as ProviderRequestStatus })
    .eq('id', bookingId)
    .eq('tourist_id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('[Tourist Booking Service] Error cancelling booking:', error.message);
    throw error;
  }

  return data as ProviderRequest;
}

/**
 * Fetch notifications for current tourist
 */
export async function getMyTouristNotifications(): Promise<TouristNotification[]> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('tourist_notifications')
    .select('*')
    .eq('tourist_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    // If table not created yet, return empty list gracefully
    return [];
  }

  return (data ?? []) as TouristNotification[];
}

/**
 * Mark tourist notification as read
 */
export async function markTouristNotificationAsRead(notificationId: string): Promise<void> {
  const client = getClient();
  const userId = await getCurrentUserId();

  await client
    .from('tourist_notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('tourist_id', userId);
}
