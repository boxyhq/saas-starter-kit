import useSWR, { mutate } from "swr";

import type { ApiResponse } from "types";
import fetcher from "@/lib/fetcher";
import type { TeamMember, User } from "@prisma/client";

type TeamMemberWithUser = TeamMember & { user: User };

const useTeamMembers = (slug: string) => {
  const url = `/api/teams/${slug}/members`;

  const { data, error } = useSWR<ApiResponse<TeamMemberWithUser[]>>(
    url,
    fetcher
  );

  const mutateTeamMembers = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    members: data?.data,
    mutateTeamMembers,
  };
};

export default useTeamMembers;
