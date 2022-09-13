import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import React from "react";
import { Button } from "react-daisyui";

import { TeamsList, CreateTeam } from "@/components/interfaces/Team";
import { inferSSRProps } from "@/lib/inferSSRProps";
import tenants from "models/tenants";

const Members: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  organization,
}) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <h4>{organization.name}</h4>
        <Button
          size="sm"
          color="primary"
          className="text-white"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          Create Team
        </Button>
      </div>
      <CreateTeam
        visible={visible}
        setVisible={setVisible}
        tenant={organization}
      />
      <TeamsList tenant={organization} />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { slug } = context.query;

  const organization = await tenants.getTenant({ slug: slug as string });

  if (!organization) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      organization,
    },
  };
};

export default Members;
