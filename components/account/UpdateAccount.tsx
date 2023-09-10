import type { User } from '@prisma/client';
import UploadAvatar from './UploadAvatar';
import UpdateName from './UpdateName';
import UpdateEmail from './UpdateEmail';
import UpdateTheme from './UpdateTheme';

const UpdateAccount = ({ user }: { user: User }) => {
  return (
    <div className="flex gap-6 flex-col">
      <UpdateName user={user} />
      <UpdateEmail user={user} />
      <UploadAvatar user={user} />
      <UpdateTheme />
    </div>
  );
};

export default UpdateAccount;
