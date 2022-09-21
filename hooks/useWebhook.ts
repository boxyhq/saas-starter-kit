import type { EndpointOut } from "svix";
import useSWR, { mutate } from "swr";

import type { ApiResponse } from "types";
import fetcher from "@/lib/fetcher";

const useWebhook = (slug: string, endpointId: string | null) => {
  const url = `/api/teams/${slug}/webhooks/${endpointId}`;

  const { data, error } = useSWR<ApiResponse<EndpointOut>>(
    slug ? url : null,
    fetcher
  );

  const mutateWebhook = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    webhook: data?.data,
    mutateWebhook,
  };
};

export default useWebhook;
