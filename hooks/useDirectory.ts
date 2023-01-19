import fetcher from '@/lib/fetcher';
import { Directory } from '@boxyhq/saml-jackson';
import useSWR, { mutate } from 'swr';
import { ApiResponse } from 'types';

const useDirectory = (slug: string) => {
  const url = `/api/teams/${slug}/directory-sync`;

  const { data, error, isLoading } = useSWR<ApiResponse<Directory[]>>(
    slug ? url : null,
    fetcher
  );

  const mutateDirectory = async () => {
    mutate(url);
  };

  return {
    isLoading,
    isError: error,
    directories: data?.data || [],
    mutateDirectory,
  };
};

export default useDirectory;
