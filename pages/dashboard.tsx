import useTeams from 'hooks/useTeams';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import type { NextPageWithLayout } from 'types';

import { Card } from '@/components/shared';

const Dashboard: NextPageWithLayout = () => {
  const router = useRouter();
  const { teams } = useTeams();
  const { t } = useTranslation('common');
  const { data: session } = useSession();

  if (teams) {
    if (teams.length > 0) {
      router.push(`/teams/${teams[0].slug}/settings`);
    } else {
      router.push('teams?newTeam=true');
    }
  }

  return (
    <>
      <Head>
        <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="Saas-starter-kit dashboard, saas-starter-kit, BoxyHQ&apso;s saas-starter-kit, BoxyHQ" />
        <meta name="description" content="Welcome to your dashboard for Saas-starter-kit of BoxyHQ. Here you will find everything related to your saas starter kit." />
        <title>Dashboard || Saas-starter-kit</title>
      </Head>

      <Card>
        <Card.Body>
          <div className="p-3">
            <p className="text-sm">
              {`${t('hi')}, ${session?.user.name} ${t(
                'you-have-logged-in-using'
              )} ${session?.user.email}`}
            </p>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default Dashboard;
