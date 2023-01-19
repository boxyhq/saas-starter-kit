import { Error, Loading } from '@/components/ui';
import { Team } from '@prisma/client';
import useDirectory from 'hooks/useDirectory';
import { useTranslation } from 'next-i18next';

const Directory = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, directories } = useDirectory(team.slug);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  if (directories && directories.length === 0) {
    return null;
  }

  const directory = directories[0];

  return (
    <div className="flex flex-col justify-between space-y-2 border-t text-sm">
      <p className="mt-3 text-sm">{t('directory-sync-message')}</p>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{t('scim-url')}</span>
        </label>
        <input
          type="text"
          className="input-bordered input w-full"
          defaultValue={directory.scim.endpoint}
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{t('auth-token')}</span>
        </label>
        <input
          type="text"
          className="input-bordered input w-full"
          defaultValue={directory.scim.secret}
        />
      </div>
    </div>
  );
};

export default Directory;
