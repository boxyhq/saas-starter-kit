import useSWR, { mutate } from "swr";

import fetcher from "@/lib/fetcher";
import { ApiResponse } from "types";
import { Invitation } from "@prisma/client";

const useInvitations = (slug: string) => {
  const url = `/api/organizations/${slug}/invitations`;

  const { data } = useSWR<ApiResponse<Invitation[]>>(url, fetcher);

  const invitations = data?.data || [];

  const mutateInvitation = async () => {
    mutate(url);
  };

  return {
    invitations,
    mutateInvitation,
  };
};

export default useInvitations;
