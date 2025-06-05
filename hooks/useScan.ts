import fetcher from '@/lib/fetcher';
import useSWR from 'swr';
import type { ApiResponse } from 'types';
import { Scan } from 'models/scan';

const useScan = (id?: string) => {
  const { data, error, isLoading } = useSWR<ApiResponse<Scan>>(id ? `/api/scans/${id}` : null, fetcher);

  return {
    isLoading,
    isError: error,
    scan: data?.data,
  };
};

export default useScan;
