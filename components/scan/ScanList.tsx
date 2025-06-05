import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import useScans from 'hooks/useScans';
import { WithLoadingAndError } from '@/components/shared';
import { Table } from '@/components/shared/table/Table';

const ScanList = () => {
  const { t } = useTranslation('common');
  const { scans, isLoading, isError } = useScans();

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <h2 className="text-xl font-medium leading-none tracking-tight">
          {t('scan-history')}
        </h2>
        <Table
          cols={[t('url'), t('created'), t('score'), t('actions')]}
          body={
            scans
              ? scans.map((scan) => ({
                  id: scan.id,
                  cells: [
                    { wrap: true, text: scan.url },
                    { wrap: true, text: new Date(scan.created_at).toLocaleDateString() },
                    { wrap: true, text: String(scan.score) },
                    {
                      element: (
                        <Link href={`/scans/${scan.id}`} className="link">
                          {t('view')}
                        </Link>
                      ),
                    },
                  ],
                }))
              : []
          }
          noMoreResults={scans?.length === 0}
        />
      </div>
    </WithLoadingAndError>
  );
};

export default ScanList;
