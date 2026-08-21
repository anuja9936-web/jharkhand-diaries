import { supabase } from '../../lib/supabase';
import type { TripDestinationRecord, TripRecord } from '../../types/tourist';

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
    throw new Error('Please sign in to manage trips.');
  }

  return data.user.id;
}

export interface TripFormInput {
  title: string;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  start_location?: string | null;
  notes?: string | null;
}

export interface TripDestinationInput {
  trip_id: string;
  destination_id: string;
  visit_date?: string | null;
  day_number?: number;
  visit_order?: number;
  notes?: string | null;
}

export async function getUserTrips(): Promise<TripRecord[]> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('trips')
    .select('*, trip_destinations(id, trip_id, destination_id, visit_date, day_number, visit_order, notes, created_at, destination:destinations(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as TripRecord[];
}

export async function getTripById(tripId: string): Promise<TripRecord | null> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('trips')
    .select('*, trip_destinations(id, trip_id, destination_id, visit_date, day_number, visit_order, notes, created_at, destination:destinations(*))')
    .eq('id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as unknown as TripRecord | null) ?? null;
}

export async function createTrip(input: TripFormInput): Promise<TripRecord> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('trips')
    .insert({
      user_id: userId,
      title: input.title.trim(),
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      budget: input.budget ?? null,
      start_location: input.start_location?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as TripRecord;
}

export async function updateTrip(tripId: string, input: TripFormInput): Promise<TripRecord> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('trips')
    .update({
      title: input.title.trim(),
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      budget: input.budget ?? null,
      start_location: input.start_location?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq('id', tripId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as TripRecord;
}

export async function deleteTrip(tripId: string): Promise<void> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { error } = await client.from('trips').delete().eq('id', tripId).eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function addDestinationToTrip(input: TripDestinationInput): Promise<TripDestinationRecord> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data: trip, error: tripError } = await client
    .from('trips')
    .select('id')
    .eq('id', input.trip_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (tripError) {
    throw tripError;
  }

  if (!trip) {
    throw new Error('Trip not found.');
  }

  const { data, error } = await client
    .from('trip_destinations')
    .insert({
      trip_id: input.trip_id,
      destination_id: input.destination_id,
      visit_date: input.visit_date || null,
      day_number: input.day_number ?? 1,
      visit_order: input.visit_order ?? 1,
      notes: input.notes?.trim() || null,
    })
    .select('id, trip_id, destination_id, visit_date, day_number, visit_order, notes, created_at, destination:destinations(*)')
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as TripDestinationRecord;
}

export interface UpdateTripDestinationInput {
  visit_date?: string | null;
  day_number?: number;
  visit_order?: number;
  notes?: string | null;
}

export async function updateTripDestination(
  tripDestinationId: string,
  input: UpdateTripDestinationInput
): Promise<TripDestinationRecord> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data: existing, error: fetchError } = await client
    .from('trip_destinations')
    .select('id, trip_id')
    .eq('id', tripDestinationId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existing) {
    throw new Error('Trip destination not found.');
  }

  const { data: trip, error: tripError } = await client
    .from('trips')
    .select('id')
    .eq('id', existing.trip_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (tripError) {
    throw tripError;
  }

  if (!trip) {
    throw new Error('Trip not found.');
  }

  const payload: Record<string, string | number | null> = {};

  if (input.visit_date !== undefined) {
    payload.visit_date = input.visit_date || null;
  }

  if (input.day_number !== undefined) {
    payload.day_number = input.day_number;
  }

  if (input.visit_order !== undefined) {
    payload.visit_order = input.visit_order;
  }

  if (input.notes !== undefined) {
    payload.notes = input.notes?.trim() || null;
  }

  const { data, error } = await client
    .from('trip_destinations')
    .update(payload)
    .eq('id', tripDestinationId)
    .select('id, trip_id, destination_id, visit_date, day_number, visit_order, notes, created_at, destination:destinations(*)')
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as TripDestinationRecord;
}

export async function removeTripDestination(tripDestinationId: string): Promise<void> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data: existing, error: fetchError } = await client
    .from('trip_destinations')
    .select('id, trip_id')
    .eq('id', tripDestinationId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existing) {
    throw new Error('Trip destination not found.');
  }

  const { data: trip, error: tripError } = await client
    .from('trips')
    .select('id')
    .eq('id', existing.trip_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (tripError) {
    throw tripError;
  }

  if (!trip) {
    throw new Error('Trip not found.');
  }

  const { error } = await client.from('trip_destinations').delete().eq('id', tripDestinationId);

  if (error) {
    throw error;
  }
}

export interface GeneratedItineraryInput {
  title: string;
  start_location?: string;
  budget?: number;
  duration_days?: number;
  days: Array<{
    dayNumber: number;
    destinationName?: string;
    destinationSlug?: string;
    activities?: string[];
    notes?: string;
  }>;
}

export async function saveGeneratedItineraryToTrip(input: GeneratedItineraryInput): Promise<TripRecord> {
  const client = getClient();
  const userId = await getCurrentUserId();

  // 1. Create main trip
  const { data: trip, error: tripErr } = await client
    .from('trips')
    .insert({
      user_id: userId,
      title: input.title,
      start_location: input.start_location || 'Ranchi',
      budget: input.budget ?? null,
      notes: `AI-Generated ${input.duration_days || input.days.length}-day Jharkhand Itinerary`,
    })
    .select('*')
    .single();

  if (tripErr) throw tripErr;

  // 2. Fetch destination lookups
  const { data: dbDests } = await client.from('destinations').select('id, name, slug');
  const destMap = new Map((dbDests ?? []).map((d) => [d.name.toLowerCase(), d.id]));
  const slugMap = new Map((dbDests ?? []).map((d) => [d.slug.toLowerCase(), d.id]));

  // 3. Insert stops
  for (let i = 0; i < input.days.length; i++) {
    const day = input.days[i];
    let destId: string | null = null;

    if (day.destinationSlug && slugMap.has(day.destinationSlug.toLowerCase())) {
      destId = slugMap.get(day.destinationSlug.toLowerCase())!;
    } else if (day.destinationName && destMap.has(day.destinationName.toLowerCase())) {
      destId = destMap.get(day.destinationName.toLowerCase())!;
    } else if (dbDests && dbDests.length > 0) {
      // Pick first matching or fallback
      destId = dbDests[i % dbDests.length].id;
    }

    if (destId) {
      try {
        await client.from('trip_destinations').insert({
          trip_id: trip.id,
          destination_id: destId,
          day_number: day.dayNumber || i + 1,
          visit_order: i + 1,
          notes: day.activities?.join(' • ') || day.notes || null,
        });
      } catch (destInsertErr) {
        console.warn('Trip stop insert warning:', destInsertErr);
      }
    }
  }

  return trip as TripRecord;
}

