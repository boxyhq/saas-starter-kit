import { ApiResponse } from "types";
import { constructHeaders } from "./common";

export async function post<T = any>(
  url: string,
  data: { [prop: string]: any },
  options?: { [prop: string]: any }
): Promise<ApiResponse<T>> {
  const { headers: optionHeaders, ...otherOptions } = options ?? {};
  const headers = constructHeaders("1", optionHeaders);

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers,
    ...otherOptions,
  });

  return await response.json();
}
