import { AuthLayout } from '@/components/layouts';
import { LetterAvatar } from '@/components/shared';
import jackson from '@/lib/jackson';
import { SAMLSSORecord } from '@boxyhq/saml-jackson';
import type { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';

interface IdPSelectionProps {
  connections: SAMLSSORecord[];
}

export default function IdPSelection({ connections }: IdPSelectionProps) {
  const router = useRouter();

  const connectionSelected = (clientID: string) => {
    return router.push(`${router.asPath}&idp_hint=${clientID}`);
  };

  return (
    <>
      <div className="rounded p-6 border">
        <div className="flex flex-col gap-4">
          {connections.map((connection) => {
            return (
              <button
                type="button"
                className="w-full btn btn-outline justify-start"
                onClick={() => {
                  connectionSelected(connection.clientID);
                }}
                key={connection.clientID}
              >
                <div className="flex gap-2 text-left items-center">
                  {connection.name && <LetterAvatar name={connection.name} />}
                  <div>{connection.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

IdPSelection.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="sso-login" description="desc-sso-login">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext) => {
  const { apiController } = await jackson();

  const paramsToRelay = { ...query } as { [key: string]: string };

  const { authFlow, tenant, product, idp_hint } = query as {
    authFlow: 'sp-initiated';
    tenant?: string;
    product?: string;
    idp_hint?: string;
    entityId?: string;
  };

  if (!tenant || !product) {
    return {
      redirect: {
        destination: '/auth/sso',
        permanent: false,
      },
    };
  }

  // The user has selected an IdP to continue with
  if (idp_hint) {
    const params = new URLSearchParams(paramsToRelay).toString();

    const destinations = {
      'sp-initiated': `/api/oauth/authorize?${params}`,
    };

    return {
      redirect: {
        destination: destinations[authFlow],
        permanent: false,
      },
    };
  }

  // No IdP selected, fetch the list of IdPs
  const connections = await apiController.getConnections({
    tenant,
    product,
  });

  // Transform the connections into a format that we can use
  // Send only the clientID and name to the frontend
  const connectionsFormatted = connections.map((connection) => {
    const idpMetadata =
      'idpMetadata' in connection ? connection.idpMetadata : undefined;
    const oidcProvider =
      'oidcProvider' in connection ? connection.oidcProvider : undefined;

    const name =
      connection.name ||
      (idpMetadata
        ? idpMetadata.friendlyProviderName || idpMetadata.provider
        : oidcProvider?.friendlyProviderName || oidcProvider?.provider);

    return {
      clientID: connection.clientID,
      name,
    };
  });

  return {
    props: {
      connections: connectionsFormatted,
    },
  };
};
