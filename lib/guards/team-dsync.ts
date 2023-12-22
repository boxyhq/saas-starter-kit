import { ApiError } from '../errors';
import { dsyncManager } from '@/lib/jackson/dsync/index';

type GuardOptions = {
  teamId: string;
  directoryId: string;
};

// Throw if the user is not allowed to access given Directory connection.
export const throwIfNoAccessToDirectory = async ({
  teamId,
  directoryId,
}: GuardOptions) => {
  if (!directoryId) {
    return;
  }

  const dsync = dsyncManager();

  const { data: connection } = await dsync.getConnectionById(directoryId);

  if (connection.tenant === teamId) {
    return;
  }

  throw new ApiError(
    403,
    `Forbidden. You don't have access to this directory connection.`
  );
};
