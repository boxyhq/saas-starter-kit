import type { NextPageWithLayout } from "types";
import { useState } from "react";
import { Button } from "react-daisyui";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Loading, Error } from "@/components/ui";
import { TeamTab } from "@/components/interfaces/Team";
import { Webhooks, CreateWebhook } from "@/components/interfaces/Webhook";
import useTeam from "hooks/useTeam";
import { GetServerSidePropsContext } from "next";

const WebhookList: NextPageWithLayout = () => {
  const router = useRouter();
  const slug = router.query.slug as string;
  const { t } = useTranslation("common");

  const [visible, setVisible] = useState(false);

  const { isLoading, isError, team } = useTeam(slug);

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <h3 className="text-2xl font-bold">{team.name}</h3>
      <TeamTab team={team} activeTab="webhooks" />
      <div className="flex items-center justify-end">
        <Button
          size="sm"
          color="primary"
          className="text-white"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          {t("add-webhook")}
        </Button>
      </div>
      <Webhooks team={team} />
      <CreateWebhook visible={visible} setVisible={setVisible} team={team} />
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

export default WebhookList;
