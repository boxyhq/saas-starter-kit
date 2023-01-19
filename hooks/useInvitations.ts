import fetcher from '@/lib/fetcher';
import { Invitation } from '@prisma/client';
import useSWR, { mutate } from 'swr';
import { ApiResponse } from 'types';

const useInvitations = (slug: string) => {
  const url = `/api/teams/${slug}/invitations`;

  const { data, error, isLoading } = useSWR<ApiResponse<Invitation[]>>(
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
