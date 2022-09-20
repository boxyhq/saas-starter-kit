import useSWR, { mutate } from "swr";

import type { ApiResponse, TeamWithMemberCount } from "types";
import fetcher from "@/lib/fetcher";

const useTeams = () => {
  const url = `/api/teams`;

  const { data, error } = useSWR<ApiResponse<TeamWithMemberCount[]>>(
    url,
    fetcher
  );

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
