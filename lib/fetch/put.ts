import { constructHeaders } from "./common";

export async function put(
  url: string,
  data: { [prop: string]: any },
  options?: { [prop: string]: any }
): Promise<any> {
  const { headers: optionHeaders, ...otherOptions } = options ?? {};
  const headers = constructHeaders("1", optionHeaders);

  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(data),
    headers,
    ...otherOptions,
  });

  return await response.json();
}
