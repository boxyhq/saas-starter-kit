import type { Directory } from '@boxyhq/saml-jackson';

export interface JacksonDsync {
  createConnection: (params: {
    name: string;
    type: string;
    tenant: string;
  }) => Promise<{ data: Directory }>;
  getConnections: (param: { tenant: string }) => Promise<{ data: Directory[] }>;
  updateConnection: (params: any) => Promise<{ data: Directory }>;
  deleteConnection: (params: any) => Promise<{ data: null }>;
  getConnectionById: (directoryId: string) => Promise<{ data: Directory }>;
}
