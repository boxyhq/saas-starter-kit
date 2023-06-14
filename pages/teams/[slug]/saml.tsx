import { CreateConnection } from '@/components/interfaces/SAML';
import { Alert, Error, InputWithLabel, Loading } from '@/components/ui';
import { Card } from '@/components/ui';
import useSAMLConfig from 'hooks/useSAMLConfig';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import type { NextPageWithLayout } from 'types';

const TeamSSO: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);

  const { slug } = router.query as { slug: string };

  const { isLoading, isError, team } = useTeam(slug);
  const { samlConfig } = useSAMLConfig(slug);

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const connectionExists = samlConfig && 'idpMetadata' in samlConfig.config;

  return (
    <>
      <Card heading={t('configure-singlesignon')}>
        <Card.Body className="px-3 py-3 text-sm">
          <div className="mb-3 flex items-center justify-between">
            <p>{t('allow-team')}</p>
            <Button
              onClick={() => setVisible(!visible)}
              variant="outline"
              color="secondary"
            >
              {t('configure')}
            </Button>
          </div>
          {connectionExists && (
            <>
              <Alert status="success">{t('saml-connection-established')}</Alert>
              <div className="flex flex-col justify-between space-y-2 mt-4">
                <p>{t('identity-provider')}</p>
                <InputWithLabel
                  label={t('entity-id')}
                  value={samlConfig.issuer}
                  className="w-full text-sm"
                />
                <InputWithLabel
                  label={t('acs-url')}
                  value={samlConfig.acs}
                  className="w-full text-sm"
                />
              </div>
            </>
          )}
        </Card.Body>
      </Card>
      <CreateConnection team={team} visible={visible} setVisible={setVisible} />
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default TeamSSO;
