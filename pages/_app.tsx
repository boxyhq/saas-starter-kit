import { AccountLayout } from '@/components/layouts';
import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import type { AppPropsWithLayout } from 'types';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { session, ...props } = pageProps;

  const getLayout =
    Component.getLayout || ((page) => <AccountLayout>{page}</AccountLayout>);

  return (
    <>
      <Head>
        <title>{app.name}</title>
      </Head>
      <SessionProvider session={session}>
        <Toaster />
        {getLayout(<Component {...props} />)}
      </SessionProvider>
    </>
  );
}

export default appWithTranslation<never>(MyApp);
