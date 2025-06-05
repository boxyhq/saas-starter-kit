import { useTranslation } from 'next-i18next';

interface Props {
  scan: {
    url: string;
    score: number;
    suggestions: string[];
  };
}

const ScanResult = ({ scan }: Props) => {
  const { t } = useTranslation('common');

  if (!scan) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium leading-none tracking-tight">{scan.url}</h2>
      <p>
        {t('score')}: {scan.score}
      </p>
      <div>
        <h3 className="font-semibold">{t('gdpr-suggestions')}</h3>
        <ul className="list-disc pl-5 space-y-1">
          {scan.suggestions?.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ScanResult;
