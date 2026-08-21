import { createClient } from '@supabase/supabase-js';

const g = typeof globalThis !== 'undefined' ? (globalThis as Record<string, any>) : {};
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (g.process?.env || {});

const defaultUrl = 'https://iltpyhsvitxtblhxmaeu.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdHB5aHN2aXR4dGJsaHhtYWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzY2NzgsImV4cCI6MjEwMjY1MjY3OH0.psgbFRQOYEaQaOl4ku3JuIIGnT6JsSmtw9laRA350Tg';

const supabaseUrl = (env.VITE_SUPABASE_URL || defaultUrl) as string;
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || defaultAnonKey) as string;

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
