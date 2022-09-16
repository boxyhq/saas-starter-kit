import useSWR, { mutate } from "swr";

import fetcher from "@/lib/fetcher";
import { ApiResponse } from "types";
import { Invitation } from "@prisma/client";

const useInvitations = (slug: string) => {
  const url = `/api/teams/${slug}/invitations`;

  const { data, error } = useSWR<ApiResponse<Invitation[]>>(url, fetcher);

  const mutateInvitation = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    invitations: data?.data,
    mutateInvitation,
  };
};

export default useInvitations;
