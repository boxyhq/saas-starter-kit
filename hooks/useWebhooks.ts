import type { EndpointOut } from "svix";
import useSWR, { mutate } from "swr";

import type { ApiResponse } from "types";
import fetcher from "@/lib/fetcher";

const useWebhooks = (slug: string) => {
  const url = `/api/teams/${slug}/webhooks`;

  const { data, error } = useSWR<ApiResponse<EndpointOut[]>>(
    slug ? url : null,
    fetcher
  );

  const mutateWebhooks = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    webhooks: data?.data,
    mutateWebhooks,
  };
};

export default useWebhooks;
