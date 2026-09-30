import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Configuration, FrontendApi } from '@ory/client-fetch';

const basePath =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_ORY_SDK_URL || 'http://localhost:4433';

const frontend = new FrontendApi(
  new Configuration({ basePath, credentials: 'include' })
);

export type ClientSession = {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string | null;
  };
} | null;

type Status = 'loading' | 'authenticated' | 'unauthenticated';

const SessionContext = createContext<{
  data: ClientSession;
  status: Status;
  update: (data?: unknown) => Promise<ClientSession>;
}>({
  data: null,
  status: 'loading',
  update: async () => null,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClientSession>(null);
  const [status, setStatus] = useState<Status>('loading');

  const load = async (): Promise<ClientSession> => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const body = await response.json();
      if (!response.ok) {
        if (
          body.error?.redirectTo &&
          !window.location.pathname.startsWith('/auth/')
        ) {
          const redirect = new URL(
            body.error.redirectTo,
            window.location.origin
          );
          redirect.searchParams.set('return_to', window.location.href);
          window.location.assign(redirect.href);
        }
        throw new Error('Unable to load session');
      }
      const next = body as ClientSession;
      setData(next);
      setStatus(next ? 'authenticated' : 'unauthenticated');
      return next;
    } catch {
      setData(null);
      setStatus('unauthenticated');
      return null;
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SessionContext.Provider value={{ data, status, update: load }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export async function signOut(options?: { callbackUrl?: string }) {
  try {
    const flow = await frontend.createBrowserLogoutFlow();
    window.location.href = flow.logout_url;
  } catch {
    window.location.href = options?.callbackUrl ?? '/auth/login';
  }
}
