import useSWR, { mutate } from "swr";
import type { SAMLSSORecord } from "@boxyhq/saml-jackson";

import type { ApiResponse, SPSAMLConfig } from "types";
import fetcher from "@/lib/fetcher";

const useSAMLConfig = (slug: string | undefined) => {
  const url = `/api/teams/${slug}/saml`;

  const { data, error } = useSWR<
    ApiResponse<SPSAMLConfig & { config: SAMLSSORecord }>
  >(slug ? url : null, fetcher);

  const mutateSamlConfig = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    samlConfig: data?.data,
    mutateSamlConfig,
  };
};

export default useSAMLConfig;
