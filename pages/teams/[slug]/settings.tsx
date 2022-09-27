import { useRouter } from "next/router";

import useTeam from "hooks/useTeam";
import {
  TeamTab,
  RemoveTeam,
  TeamSettings,
} from "@/components/interfaces/Team";
import { Error, Loading } from "@/components/ui";
import type { NextPageWithLayout } from "types";

const Settings: NextPageWithLayout = () => {
  const router = useRouter();
  const { slug } = router.query;

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
      <TeamTab team={team} activeTab="settings" />
      <TeamSettings team={team} />
      <RemoveTeam team={team} />
    </>
  );
};

export default Settings;
