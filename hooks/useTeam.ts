import useSWR from "swr";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import fetcher from "@/lib/fetcher";

const useTeam = (slug: string | undefined) => {
  const url = `/api/teams/${slug}`;

  const { data, error, isLoading } = useSWR<ApiResponse<Team>>(
    slug ? url : null,
    fetcher
  );

  return {
    isLoading,
    isError: error,
    team: data?.data,
  };
};

export default useTeam;
