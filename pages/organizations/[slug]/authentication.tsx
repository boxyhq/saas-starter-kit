import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import React from "react";
import { Button } from "react-daisyui";

import env from "@/lib/env";
import jackson from "@/lib/jackson";
import { inferSSRProps } from "@/lib/inferSSRProps";
import { Card } from "@/components/ui";
import tenants from "models/tenants";
import { AddEditSAMLConfig } from "@/components/interfaces/SAML";

const Authentication: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ tenant, config, saml }) => {
  const [visible, setVisible] = React.useState(config.enabled);

  return (
    <>
      <h4>{tenant.name}</h4>
      {visible ? (
        <Card heading="SAML Authentication">
          <Card.Body className="px-3 py-3">
            <div className="flex items-center justify-between">
              <p>SAML authentication is currently enabled for this team.</p>
              <Button
                size="sm"
                onClick={() => setVisible(!visible)}
                variant="outline"
              >
                Edit SAML Settings
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <AddEditSAMLConfig tenant={tenant} />
      )}
      <Card heading="Configuring the Identity Provider">
        <Card.Body className="px-3 py-3">
          <div className="flex flex-col justify-between space-y-4 text-sm">
            <p>
              Identity Provider will ask you for the following information to
              configure your SAML app.
            </p>
            <p>
              <strong>Entity ID:</strong> {saml.issuer}
            </p>
            <p>
              <strong>ACS URL:</strong> {saml.acs}
            </p>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { slug } = context.query;

  const { apiController } = await jackson();

  const tenant = await tenants.getTenant({ slug: slug as string });

  if (!tenant) {
    return {
      notFound: true,
    };
  }

  const samlConfig = await apiController.getConfig({
    tenant: tenant.id,
    product: env.product,
  });

  return {
    props: {
      tenant,
      saml: env.saml,
      config: {
        enabled: Object.keys(samlConfig).length > 0,
      },
    },
  };
};

export default Authentication;
