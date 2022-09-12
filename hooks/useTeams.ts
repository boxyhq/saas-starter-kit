import useSWR from "swr";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import fetcher from "@/lib/fetcher";

const useTeams = (slug: string) => {
  const url = `/api/organizations/${slug}/teams`;

  const { data, error } = useSWR<ApiResponse<Team[]>>(url, fetcher);

  return {
    isLoading: !error && !data,
    isError: error,
    teams: data?.data,
  };
};

export default useTeams;
