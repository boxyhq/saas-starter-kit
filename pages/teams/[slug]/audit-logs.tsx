import { TeamTab } from '@/components/interfaces/Team';
import { Card } from '@/components/ui';
import { Error, Loading } from '@/components/ui';
import env from '@/lib/env';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { getViewerToken } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import useTeam from 'hooks/useTeam';
import { getTeam, isTeamAdmin, isTeamMember } from 'models/team';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type { NextPageWithLayout } from 'types';

interface RetracedEventsBrowserProps {
  host: string;
  auditLogToken: string;
  header: string;
}

const RetracedEventsBrowser = dynamic<RetracedEventsBrowserProps>(
  () => import('@retracedhq/logs-viewer'),
  {
    ssr: false,
  }
);

const Events: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  auditLogToken,
  retracedHost,
}) => {
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation('common');

  const { isLoading, isError, team } = useTeam(slug as string);

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  if (!auditLogToken) {
    return (
      <Error message="Error getting audit log token. Please check your configuration." />
    );
  }

  return (
    <>
      <h3 className="text-2xl font-bold">{team.name}</h3>
      <TeamTab team={team} activeTab="audit-logs" />
      <Card heading="Audit Logs">
        <Card.Body>
          <RetracedEventsBrowser
            host={`${retracedHost}/viewer/v1`}
            auditLogToken={auditLogToken}
            header="Audit Logs"
          />
        </Card.Body>
      </Card>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const session = await getSession(req, res);

  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { slug } = query as { slug: string };

  const team = await getTeam({ slug });

  if (!(await isTeamAdmin(session.user.id, team.id))) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      auditLogToken: await getViewerToken(team.id, session.user.id),
      retracedHost: env.retraced.url,
    },
  };
}

export default Events;
