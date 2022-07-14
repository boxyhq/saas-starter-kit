import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import React from "react";
import { Button, Typography } from "@supabase/ui";

import env from "@lib/env";
import jackson from "@lib/jackson";
import tenants from "models/tenants";
import { inferSSRProps } from "@lib/inferSSRProps";
import { Card, AddEditSAMLConfig } from "@components/ui";

const Authentication: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ tenant, config }) => {
  const [visible, setVisible] = React.useState(config.enabled);

  if (visible) {
    return (
      <>
        <Typography.Title level={4}>{tenant.name}</Typography.Title>
        <Card heading="SAML Authentication">
          <Card.Body className="px-3 py-3">
            <div className="flex items-center justify-between">
              <Typography.Text>
                SAML authentication is currently enabled for this team.
              </Typography.Text>
              <Button
                size="tiny"
                type="outline"
                onClick={() => setVisible(!visible)}
              >
                Edit SAML Settings
              </Button>
            </div>
          </Card.Body>
        </Card>
      </>
    );
  }

  return <AddEditSAMLConfig tenant={tenant} config={config} />;
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
      config: {
        audience: env.samlAudience,
        acsUrl: env.acsUrl,
        enabled: Object.keys(samlConfig).length > 0,
      },
    },
  };
};

export default Authentication;
