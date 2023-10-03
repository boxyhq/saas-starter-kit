import { AccountLayout } from '@/components/layouts';
import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import type { AppPropsWithLayout } from 'types';
import mixpanel from 'mixpanel-browser';

import '@boxyhq/react-ui/dist/style.css';
import '../styles/globals.css';
import { useEffect } from 'react';
import env from '@/lib/env';
import { Theme, applyTheme } from '@/lib/theme';
import { Themer } from '@boxyhq/react-ui/shared';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { session, ...props } = pageProps;

  // Add mixpanel
  useEffect(() => {
    if (env.mixpanel.token) {
      mixpanel.init(env.mixpanel.token, {
        debug: true,
        ignore_dnt: true,
        track_pageview: true,
      });
    }
    // persist theme
    applyTheme(localStorage.getItem('theme') as Theme);
  }, []);

  const getLayout =
    Component.getLayout || ((page) => <AccountLayout>{page}</AccountLayout>);

  return (
    <>
      <Head>
        <title>{app.name}</title>
        <link rel="icon" href="https://boxyhq.com/img/favicon.ico" />
      </Head>
      <SessionProvider session={session}>
        <Toaster toastOptions={{ duration: 4000 }} />
        <Themer
          overrideTheme={{
            '--primary-color': '#2563eb',
            '--primary-color-50': '#eff6ff',
            '--primary-color-100': '#dbeafe',
            '--primary-color-200': '#bfdbfe',
            '--primary-color-500': '#3b82f6',
            '--primary-color-600': '#2563eb',
            '--primary-color-700': '#1d4ed8',
            '--primary-color-800': '#1e40af',
            '--primary-color-900': '#1e3a8a',
            '--primary-color-950': '#172554',
          }}
        >
          {getLayout(<Component {...props} />)}
        </Themer>
      </SessionProvider>
    </>
  );
}

export default appWithTranslation<never>(MyApp);
