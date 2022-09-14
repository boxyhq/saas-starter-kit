import useSWR from "swr";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import fetcher from "@/lib/fetcher";

const useTeams = () => {
  const url = `/api/teams`;

  const { data, error } = useSWR<ApiResponse<Team[]>>(url, fetcher);

  return {
    isLoading: !error && !data,
    isError: error,
    teams: data?.data,
  };
};

export default useTeams;
