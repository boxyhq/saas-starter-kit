import type { Directory } from '@boxyhq/saml-jackson';
import type { ApiResponse } from 'types';

type GetConnectionsResult<T> = T extends { tenant: string }
  ? ApiResponse<Directory[]>
  : T extends { dsyncId: string }
    ? ApiResponse<Directory>
    : never;

export interface JacksonDsync {
  createConnection: (params: {
    name: string;
    type: string;
    tenant: string;
  }) => Promise<ApiResponse<Directory>>;
  getConnections: (
    param: { tenant: string } | { dsyncId: string }
  ) => Promise<GetConnectionsResult<typeof param>>;
  updateConnection: (params: any) => Promise<ApiResponse<Directory>>;
  deleteConnection: (params: any) => Promise<ApiResponse<object>>;
}
