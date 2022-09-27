import type { NextPageWithLayout } from "types";
import { useState } from "react";
import { Button } from "react-daisyui";
import { useRouter } from "next/router";

import { Loading, Error } from "@/components/ui";
import { TeamTab, Members } from "@/components/interfaces/Team";
import {
  InviteMember,
  PendingInvitations,
} from "@/components/interfaces/Invitation";

import useTeam from "hooks/useTeam";

const TeamMembers: NextPageWithLayout = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [visible, setVisible] = useState(false);

  const { isLoading, isError, team } = useTeam(slug as string);

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <h3 className="text-2xl font-bold">{team.name}</h3>
      <TeamTab team={team} activeTab="members" />
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
      <Members team={team} />
      <PendingInvitations team={team} />
      <InviteMember visible={visible} setVisible={setVisible} team={team} />
    </>
  );
};

export default TeamMembers;
