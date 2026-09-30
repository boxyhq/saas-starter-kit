import type { User } from '@prisma/client';
import UploadAvatar from './UploadAvatar';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import UpdateTheme from './UpdateTheme';
import env from '@/lib/env';

interface UpdateAccountProps {
  user: Partial<User>;
}

const UpdateAccount = ({ user }: UpdateAccountProps) => {
  const { t } = useTranslation('common');
  return (
    <div className="flex gap-6 flex-col">
      <div className="rounded border p-6 space-y-3">
        <p>{user.name}</p>
        <p>{user.email}</p>
        <Link className="btn btn-primary btn-sm" href="/auth/settings">
          {t('manage-profile-settings')}
        </Link>
      </div>
      <UploadAvatar user={user} />
      {env.darkModeEnabled && <UpdateTheme />}
    </div>
  );
};

export default UpdateAccount;
