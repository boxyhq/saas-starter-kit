import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import env from './env';

let supabase: SupabaseClient | null = null;

if (env.supabase.url && (env.supabase.serviceRoleKey || env.supabase.anonKey)) {
  const key = env.supabase.serviceRoleKey || env.supabase.anonKey;
  supabase = createClient(env.supabase.url as string, key as string);
}

export default supabase;
