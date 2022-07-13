import { ApiResponse } from "types";
import { constructHeaders } from "./common";

export async function get<T = any>(
  url: string,
  options?: { [prop: string]: any }
): Promise<ApiResponse<T>> {
  const { headers: optionHeaders, ...otherOptions } = options ?? {};
  const headers = constructHeaders("1", optionHeaders);

  const response = await fetch(url, {
    method: "GET",
    headers,
    ...otherOptions,
  });

  return await response.json();
}
