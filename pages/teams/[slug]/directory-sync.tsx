import type { NextPageWithLayout } from "types";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-daisyui";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card } from "@/components/ui";
import { Loading, Error } from "@/components/ui";
import { TeamTab } from "@/components/interfaces/Team";
import useTeam from "hooks/useTeam";
import {
  CreateDirectory,
  Directory,
} from "@/components/interfaces/DirectorySync";
import useDirectory from "hooks/useDirectory";
import { GetServerSidePropsContext } from "next";

const DirectorySync: NextPageWithLayout = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [visible, setVisible] = useState(false);

  const { isLoading, isError, team } = useTeam(slug as string);
  const { directory } = useDirectory(slug as string);
  const { t } = useTranslation("common");

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
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm">{t("provision")}</p>
            {directory === null ? (
              <Button
                size="sm"
                onClick={() => setVisible(!visible)}
                variant="outline"
                color="secondary"
              >
                {t("enable")}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setVisible(!visible)}
                variant="outline"
                color="error"
                disabled
              >
                {t("remove")}
              </Button>
            )}
          </div>
          <Directory team={team} />
        </Card.Body>
      </Card>
      <CreateDirectory visible={visible} setVisible={setVisible} team={team} />
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

export default DirectorySync;
