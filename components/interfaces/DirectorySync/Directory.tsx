import { Team } from "@prisma/client";
import useDirectory from "hooks/useDirectory";
import { Loading, Error } from "@/components/ui";

const Directory = ({ team }: { team: Team }) => {
  const { isLoading, isError, directory } = useDirectory(team.slug as string);

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
      <p className="mt-3 text-sm">
        Directory Sync Provider will ask you for the following information to
        configure your SCIM app.
      </p>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">SCIM URL</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          defaultValue={directory.scim.endpoint}
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Auth Token</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          defaultValue={directory.scim.secret}
        />
      </div>
    </div>
  );
};

export default Directory;
