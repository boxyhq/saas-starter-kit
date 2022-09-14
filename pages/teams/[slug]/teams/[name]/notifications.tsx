import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import React from "react";

import { Card } from "@/components/ui";
import { TeamTab } from "@/components/interfaces/Team";
import { inferSSRProps } from "@/lib/inferSSRProps";
import tenants from "models/team";
import teams from "models/_teams";

const Notifications: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ tenant, team }) => {
  return (
    <>
      <h3 className="text-2xl font-bold">
        {tenant.name} - {team.name}
      </h3>
      <TeamTab team={team} tenant={tenant} activeTab="notifications" />
      <Card heading="Notifications">
        <Card.Body className="px-3 py-3">
          <div className="space-y-3">
            <p className="text-sm">
              No Notification integrations have been done yet.
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
  const { slug, teamName } = context.query;

  const tenant = await tenants.getTenant({ slug: slug as string });

  if (!tenant) {
    return {
      notFound: true,
    };
  }

  const team = await teams.getTeam({ name: teamName as string });

  if (!team) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      tenant,
      team,
    },
  };
};

export default Notifications;
