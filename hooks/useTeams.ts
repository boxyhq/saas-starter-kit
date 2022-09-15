import useSWR, { mutate } from "swr";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import fetcher from "@/lib/fetcher";

const useTeams = () => {
  const url = `/api/teams`;

  const { data, error } = useSWR<ApiResponse<Team[]>>(url, fetcher);

  const mutateTeams = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    teams: data?.data,
    mutateTeams,
  };
};

export default useTeams;
