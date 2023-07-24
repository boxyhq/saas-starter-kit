import { Card } from '@/components/shared';
import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import env from '@/lib/env';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { getViewerToken } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import useCanAccess from 'hooks/useCanAccess';
import useTeam from 'hooks/useTeam';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
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
  error,
}) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { isLoading, isError, team } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  if (isError || error) {
    return <Error message={isError?.message || error?.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      <TeamTab activeTab="audit-logs" team={team} />
      <Card heading={t('audit-logs')}>
        <Card.Body>
          {canAccess('team_audit_log', ['read']) && auditLogToken && (
            <RetracedEventsBrowser
              host={`${retracedHost}/viewer/v1`}
              auditLogToken={auditLogToken}
              header={t('audit-logs')}
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const session = await getSession(req, res);
  const teamMember = await getTeamMember(
    session?.user.id as string,
    query.slug as string
  );

  try {
    throwIfNotAllowed(teamMember, 'team_audit_log', 'read');

    const auditLogToken = await getViewerToken(
      teamMember.team.id,
      session?.user.id as string
    );

    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        error: null,
        auditLogToken,
        retracedHost: env.retraced.url,
      },
    };
  } catch (error: any) {
    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        error: {
          message: error.message,
        },
        auditLogToken: null,
        retracedHost: null,
      },
    };
  }
}

export default Events;
