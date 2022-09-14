import useSWR from "swr";

import type { SAMLConfig } from "@/lib/jackson";
import type { ApiResponse, SPSAMLConfig } from "types";
import fetcher from "@/lib/fetcher";

const useSAMLConfig = (slug: string | undefined) => {
  const url = `/api/teams/${slug}/saml`;

  const { data, error } = useSWR<
    ApiResponse<SPSAMLConfig & { config: SAMLConfig }>
  >(slug ? url : null, fetcher);

  return {
    isLoading: !error && !data,
    isError: error,
    samlConfig: data?.data,
  };
};

export default useSAMLConfig;
