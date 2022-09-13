import useSWR from "swr";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import fetcher from "@/lib/fetcher";

const useTeam = (slug: string, name: string) => {
  const url = `/api/organizations/${slug}/teams/${name}`;

  const { data, error } = useSWR<ApiResponse<Team>>(url, fetcher);

  return {
    isLoading: !error && !data,
    isError: error,
    team: data?.data,
  };
};

export default useTeam;
