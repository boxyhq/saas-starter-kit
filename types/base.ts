export type ApiError = {
  code?: string;
  message: string;
  values: { [key: string]: string };
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
};

export type Role = "owner" | "member" | "billing";

export type SAMLConfig = {
  issuer: string;
  path: string;
  callback: string;
  acs: string;
};
