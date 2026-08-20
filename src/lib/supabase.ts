import { createClient } from '@supabase/supabase-js';

const g = typeof globalThis !== 'undefined' ? (globalThis as Record<string, any>) : {};
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (g.process?.env || {});

const supabaseUrl = (env.VITE_SUPABASE_URL || 'https://iltpyhsvitxtblhxmaeu.supabase.co') as string;
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '') as string;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
