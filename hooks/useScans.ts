import fetcher from '@/lib/fetcher';
import useSWR, { mutate } from 'swr';
import type { ApiResponse } from 'types';
import { Scan } from 'models/scan';

const useScans = () => {
  const url = '/api/scans';
  const { data, error, isLoading } = useSWR<ApiResponse<Scan[]>>(url, fetcher);

  const mutateScans = async () => {
    mutate(url);
  };

  return {
    isLoading,
    isError: error,
    scans: data?.data,
    mutateScans,
  };
};

export default useScans;
