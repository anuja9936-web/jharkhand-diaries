import type { VendorProfile } from '../../types/vendor';
import { supabase } from '../../lib/supabase';

export async function getVendorProfile(userId: string): Promise<VendorProfile | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as VendorProfile | null;
}

