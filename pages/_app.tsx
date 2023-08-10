import { AccountLayout } from '@/components/layouts';
import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import type { AppPropsWithLayout } from 'types';
import mixpanel from 'mixpanel-browser';

import '../styles/globals.css';
import { useEffect } from 'react';
import env from '@/lib/env';

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
  }, []);

  const getLayout =
    Component.getLayout || ((page) => <AccountLayout>{page}</AccountLayout>);

  return (
    <>
      <Head>
        <title>{app.name}</title>
      </Head>
      <SessionProvider session={session}>
        <Toaster toastOptions={{ duration: 4000 }} />
        {getLayout(<Component {...props} />)}
      </SessionProvider>
    </>
  );
}

export default appWithTranslation<never>(MyApp);
