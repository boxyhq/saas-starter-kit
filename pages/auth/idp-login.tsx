import { ReactElement, useEffect, useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { startKratosSSO } from '@/lib/startSSO';
import { redeemJacksonCode } from '@/lib/jacksonToken';
import jackson from '@/lib/jackson';
import env from '@/lib/env';
import { tenantCookie } from '@/lib/sso';
import { Loading } from '@/components/shared';

export default function SAMLIdPLogin() {
  const { t } = useTranslation('common');
  const [error, setError] = useState(false);

  useEffect(() => {
    startKratosSSO().catch(() => setError(true));
  }, []);

  return error ? <Link href="/auth/login">{t('sign-in')}</Link> : <Loading />;
}

export async function getServerSideProps({
  query,
  res,
  locale,
}: GetServerSidePropsContext) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!env.teamFeatures.sso || typeof query.code !== 'string') {
    return { notFound: true };
  }
  try {
    const token = await redeemJacksonCode({
      code: query.code,
      grant_type: 'authorization_code',
      client_id: 'dummy',
      client_secret: 'dummy',
      redirect_uri: `${env.appUrl}/auth/idp-login`,
    });
    const { oauthController } = await jackson();
    const profile = await oauthController.userInfo(token.access_token);
    if (
      !profile.requested?.isIdPFlow ||
      !profile.requested.tenant ||
      profile.requested.product !== env.jackson.productId
    ) {
      return { notFound: true };
    }
    // The unsolicited result selects the IdP only. A fresh Ory-controlled
    // round trip establishes the identity and the one-use membership grant.
    res.setHeader('Set-Cookie', tenantCookie(profile.requested.tenant));
    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      },
    };
  } catch {
    return { notFound: true };
  }
}

SAMLIdPLogin.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};
