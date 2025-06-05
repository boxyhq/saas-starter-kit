import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import env from './env';

let supabase: SupabaseClient | null = null;

if (env.supabase.url && env.supabase.anonKey) {
  supabase = createClient(env.supabase.url, env.supabase.anonKey);
}

export default supabase;
