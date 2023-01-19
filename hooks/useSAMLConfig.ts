import fetcher from '@/lib/fetcher';
import type { SAMLSSORecord } from '@boxyhq/saml-jackson';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, SPSAMLConfig } from 'types';

const useSAMLConfig = (slug: string | undefined) => {
  const url = `/api/teams/${slug}/saml`;

  const { data, error, isLoading } = useSWR<
    ApiResponse<SPSAMLConfig & { config: SAMLSSORecord }>
  >(slug ? url : null, fetcher);

  const mutateSamlConfig = async () => {
    mutate(url);
  };

  return {
    isLoading,
    isError: error,
    samlConfig: data?.data,
    mutateSamlConfig,
  };
};

export default useSAMLConfig;
