import type { NextPageWithLayout } from "types";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card } from "@/components/ui";
import { Loading, Error } from "@/components/ui";
import { TeamTab } from "@/components/interfaces/Team";
import useTeam from "hooks/useTeam";
import { Badge } from "react-daisyui";
import { GetServerSidePropsContext } from "next";

const AuditLogs: NextPageWithLayout = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation("common");

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
            <p className="text-sm">{t("audit-logs")}</p>
            <Badge color="warning">{t("coming-soon")}</Badge>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
    },
  };
}

export default AuditLogs;
