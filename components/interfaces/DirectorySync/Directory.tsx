import { Team } from "@prisma/client";
import useDirectory from "hooks/useDirectory";
import { Loading, Error } from "@/components/ui";
import { useTranslation } from "next-i18next";

const Directory = ({ team }: { team: Team }) => {
  const { isLoading, isError, directory } = useDirectory(team.slug as string);
  const { t } = useTranslation("common");

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  if (!directory) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between space-y-2 border-t text-sm">
      <p className="mt-3 text-sm">{t("directory-sync-message")}</p>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{t("scim-url")}</span>
        </label>
        <input
          type="text"
          className="input-bordered input w-full"
          defaultValue={directory.scim.endpoint}
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{t("auth-token")}</span>
        </label>
        <input
          type="text"
          className="input-bordered input w-full"
          defaultValue={directory.scim.secret}
        />
      </div>
    </div>
  );
};

export default Directory;
