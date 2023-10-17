import useSWR from 'swr';
import env from '@/lib/env';
import fetcher from '@/lib/fetcher';
import { ApiResponse } from 'types';

type TeamFeatures = typeof env.teamFeatures;

const useTeamFeatures = () => {
  const { data, error, isLoading } = useSWR<ApiResponse<TeamFeatures>>(
    `/api/teams/features`,
    fetcher
  );

  return {
    error,
    isLoading,
    features: data?.data,
  };
};

export default useTeamFeatures;
