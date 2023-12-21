import type { Directory, Response } from '@boxyhq/saml-jackson';
import type { ApiResponse } from 'types';

type GetConnectionsResult<T> = T extends { tenant: string }
  ? Directory[]
  : T extends { dsyncId: string }
    ? Directory
    : never;

export interface JacksonDsync {
  createConnection: (params: {
    name: string;
    type: string;
    tenant: string;
  }) => Promise<ApiResponse<Directory> | Response<Directory>>;
  getConnections: (
    param: { tenant: string } | { dsyncId: string }
  ) => Promise<
    | ApiResponse<GetConnectionsResult<typeof param>>
    | Response<GetConnectionsResult<typeof param>>
  >;
  updateConnection: (
    params: any
  ) => Promise<ApiResponse<Directory> | Response<Directory>>;
  deleteConnection: (
    params: any
  ) => Promise<ApiResponse<null> | Response<null>>;
}
