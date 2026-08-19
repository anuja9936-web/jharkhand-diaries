import { supabase } from '../../lib/supabase';
import type { FavouriteRecord } from '../../types/tourist';

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
    throw new Error('Please sign in to save destinations.');
  }

  return data.user.id;
}

export async function getUserFavourites(): Promise<FavouriteRecord[]> {
  const client = getClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    return [];
  }

  const { data, error } = await client
    .from('favourites')
    .select('id, user_id, destination_id, created_at, destination:destinations(*)')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as FavouriteRecord[];
}

export async function getFavouriteDestinationIds(): Promise<Set<string>> {
  const favourites = await getUserFavourites();
  return new Set(favourites.map((favourite) => favourite.destination_id));
}

export async function addFavourite(destinationId: string): Promise<void> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { error } = await client.from('favourites').insert({
    user_id: userId,
    destination_id: destinationId,
  });

  if (error) {
    throw error;
  }
}

export async function removeFavourite(destinationId: string): Promise<void> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { error } = await client
    .from('favourites')
    .delete()
    .eq('user_id', userId)
    .eq('destination_id', destinationId);

  if (error) {
    throw error;
  }
}

export async function toggleFavourite(destinationId: string): Promise<boolean> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data: existing, error: selectError } = await client
    .from('favourites')
    .select('id')
    .eq('user_id', userId)
    .eq('destination_id', destinationId)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    const { error } = await client.from('favourites').delete().eq('id', existing.id);

    if (error) {
      throw error;
    }

    return false;
  }

  const { error } = await client.from('favourites').insert({
    user_id: userId,
    destination_id: destinationId,
  });

  if (error) {
    throw error;
  }

  return true;
}
