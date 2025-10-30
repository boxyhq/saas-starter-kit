import { createClient } from '@supabase/supabase-js';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var supabase: any;
}

const getSupabaseClient = () => {
  const databaseProvider = process.env.DATABASE_PROVIDER || 'supabase';

  if (databaseProvider === 'supabase') {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY must be set when using Supabase');
    }

    // Create Supabase client for database operations
    const supabase = createClient(supabaseUrl, supabaseKey);

    return supabase;
  } else {
    throw new Error(`Unsupported DATABASE_PROVIDER: ${databaseProvider}. Only 'supabase' is supported in this configuration`);
  }
};

export const supabase =
  global.supabase ||
  getSupabaseClient();

if (process.env.NODE_ENV !== 'production') {
  global.supabase = supabase;
}

// For backward compatibility, export supabase as prisma
export const prisma = supabase;
