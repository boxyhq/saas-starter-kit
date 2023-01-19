import useSWR, { mutate } from "swr";

import fetcher from "@/lib/fetcher";
import { ApiResponse } from "types";
import { Directory } from "@boxyhq/saml-jackson";

const useDirectory = (slug: string) => {
  const url = `/api/teams/${slug}/directory-sync`;

  const { data, error, isLoading } = useSWR<ApiResponse<Directory>>(
    slug ? url : null,
    fetcher
  );

  const mutateDirectory = async () => {
    mutate(url);
  };

  return {
    isLoading,
    isError: error,
    directory: data?.data,
    mutateDirectory,
  };
};

export default useDirectory;
