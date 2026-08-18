import type { Destination } from '../../types/destination';
import { supabase } from '../../lib/supabase';

export async function listDestinations(): Promise<Destination[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from('destinations').select('*').order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Destination[];
}

