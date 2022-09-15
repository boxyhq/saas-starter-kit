import type { NextPageWithLayout } from "types";
import React from "react";
import { useRouter } from "next/router";

import { Card } from "@/components/ui";
import { Loading, Error } from "@/components/ui";
import { TeamTab } from "@/components/interfaces/Team";
import useTeam from "hooks/useTeam";
import { Badge } from "react-daisyui";

const DirectorySync: NextPageWithLayout = () => {
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
      <TeamTab team={team} activeTab="directory-sync" />
      <Card heading="Directory Sync">
        <Card.Body className="px-3 py-3">
          <div className="space-y-3">
            <p className="text-sm">
              Directory Sync helps Teams manage their organization membership
              from a third-party identity provider like OneLogin or Okta.
            </p>
            <Badge color="warning">Coming Soon</Badge>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default DirectorySync;
