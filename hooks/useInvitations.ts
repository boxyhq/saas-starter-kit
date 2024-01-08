import useSWR, { mutate } from 'swr';

import fetcher from '@/lib/fetcher';
import type { ApiResponse } from 'types';
import { Invitation } from '@prisma/client';

type TeamInvitation = Pick<
  Invitation,
  'id' | 'email' | 'role' | 'expires' | 'allowedDomain' | 'token'
> & { url: string };

const useInvitations = (slug: string, sentViaEmail: boolean) => {
  const url = `/api/teams/${slug}/invitations?sentViaEmail=${sentViaEmail}`;

  const { data, error, isLoading } = useSWR<ApiResponse<TeamInvitation[]>>(
    url,
    fetcher
  );

  const mutateInvitation = async () => {
    mutate(url);
  };

  return {
    isLoading,
    isError: error,
    invitations: data?.data,
    mutateInvitation,
  };
};

export default useInvitations;
