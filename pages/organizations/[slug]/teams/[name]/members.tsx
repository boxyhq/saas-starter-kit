import type { NextPageWithLayout } from "types";
import type { GetServerSidePropsContext } from "next";
import React from "react";
import { Button } from "react-daisyui";
import { useRouter } from "next/router";

import { Loading, Error } from "@/components/ui";
import { TeamTab, Members, AddMember } from "@/components/interfaces/Team";
import { inferSSRProps } from "@/lib/inferSSRProps";
import tenants from "models/tenants";
import useTeam from "hooks/useTeam";

const TeamMembers: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ tenant }) => {
  const router = useRouter();
  const { name } = router.query;
  const [visible, setVisible] = React.useState(false);

  const { isLoading, isError, team } = useTeam(tenant.slug, name as string);

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

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
  const { slug } = context.query;

  const tenant = await tenants.getTenant({ slug: slug as string });

  if (!tenant) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      tenant,
    },
  };
};

export default TeamMembers;
