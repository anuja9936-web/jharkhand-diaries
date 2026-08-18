import { supabase } from '../../lib/supabase';

export async function listTourismAlerts(): Promise<unknown[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

