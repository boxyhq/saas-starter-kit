import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const getPrismaClient = () => {
  const databaseProvider = process.env.DATABASE_PROVIDER || 'postgres';

  if (databaseProvider === 'supabase') {
    // For Supabase, use the connection string that points to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY must be set when using Supabase');
    }

    // Supabase uses PostgreSQL under the hood, so we can still use Prisma
    // but with Supabase-specific connection details
    return new PrismaClient({
      datasources: {
        db: {
          url: `postgresql://postgres:${supabasePublishableKey}@${new URL(supabaseUrl).host}:5432/postgres`,
        },
      },
      //log: ["error"],
    });
  } else if (databaseProvider === 'postgres') {
    // Default PostgreSQL setup
    return new PrismaClient({
      //log: ["error"],
    });
  } else {
    throw new Error(`Unsupported DATABASE_PROVIDER: ${databaseProvider}. Supported values: 'postgres', 'supabase'`);
  }
};

export const prisma =
  global.prisma ||
  getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
