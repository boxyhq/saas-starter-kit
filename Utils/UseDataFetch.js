// UseDataFetch.js
import useSWR from "swr";
import { fetcher } from "./axios.config";

export const UseDataFetch = (instance, pathKey) => {
  const { data, error } = useSWR([pathKey, instance], fetcher, {
    refreshInterval: 50000,
  });

  return { data, loading: !error && !data, error };
};
