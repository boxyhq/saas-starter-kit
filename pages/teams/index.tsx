import type { NextPageWithLayout } from "types";
import { Button } from "react-daisyui";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { CreateTeam, Teams } from "@/components/interfaces/Team";
import { GetServerSidePropsContext } from "next";

const AllTeams: NextPageWithLayout = () => {
  const [visible, setVisible] = useState(false);

  const { t } = useTranslation("common");

  return (
    <>
      <div className="flex items-center justify-between">
        <h4>{t("all-teams")}</h4>
        <Button
          size="sm"
          color="primary"
          className="text-white"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          {t("create-team")}
        </Button>
      </div>
      <CreateTeam visible={visible} setVisible={setVisible} />
      <Teams />
    </>
  );
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
    },
  };
}

export default AllTeams;
