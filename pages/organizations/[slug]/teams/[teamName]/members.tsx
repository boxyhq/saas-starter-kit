import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import React from "react";
import { Button } from "react-daisyui";

import { TeamsList, CreateTeam, TeamTab } from "@/components/interfaces/Team";
import { inferSSRProps } from "@/lib/inferSSRProps";
import tenants from "models/tenants";
import teams from "models/teams";

const Members: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  tenant,
  team,
}) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <h3 className="text-2xl font-bold">
        {tenant.name} - {team.name}
      </h3>
      <TeamTab team={team} tenant={tenant} activeTab="members" />
      <div className="flex items-center justify-end">
        <Button
          size="sm"
          color="primary"
          className="text-white"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          Add Member
        </Button>
      </div>
      {/* <CreateTeam visible={visible} setVisible={setVisible} tenant={tenant} />
      <TeamsList tenant={tenant} /> */}
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

export default Members;
