export function constructHeaders(
  requestId: string,
  optionHeaders?: { [prop: string]: any }
) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Request-Id": requestId,
    ...optionHeaders,
  };
}
