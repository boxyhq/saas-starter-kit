import type { NextPageWithLayout } from "types";
import { useRouter } from "next/router";

import { Card } from "@/components/ui";
import { Loading, Error } from "@/components/ui";
import { TeamTab } from "@/components/interfaces/Team";
import useTeam from "hooks/useTeam";
import { Badge } from "react-daisyui";

const AuditLogs: NextPageWithLayout = () => {
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
      <TeamTab team={team} activeTab="audit-logs" />
      <Card heading="Audit Logs">
        <Card.Body className="px-3 py-3">
          <div className="space-y-3">
            <p className="text-sm">
              Audit Logs allow you to track and analyze each member activity.
            </p>
            <Badge color="warning">Coming Soon</Badge>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default AuditLogs;
