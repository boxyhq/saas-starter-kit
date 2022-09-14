import useSWR from "swr";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import fetcher from "@/lib/fetcher";

const useTeam = (slug: string) => {
  const url = `/api/teams/${slug}`;

  const { data, error } = useSWR<ApiResponse<Team>>(url, fetcher);

  return {
    isLoading: !error && !data,
    isError: error,
    team: data?.data,
  };
};

export default useTeam;
