import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  
  interface User {
    roles?: Array<{
      teamId: string;
      role: Role;
    }>;
  }
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      roles: { teamId: string; role: Role }[];
    };
  }

  interface Profile {
    requested: {
      tenant: string;
    };
    roles: string[];
    groups: string[];
  }
}
