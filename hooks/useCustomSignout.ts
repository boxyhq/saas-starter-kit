import { signOut } from '@/lib/orySession';

export function useCustomSignOut() {
  return async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };
}
