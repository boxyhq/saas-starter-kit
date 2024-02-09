import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';

import { Card } from '@/components/shared';

const Help = () => {
  const { t } = useTranslation('common');

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('need-anything-else')}</Card.Title>
          <Card.Description>{t('billing-assistance-message')}</Card.Description>
        </Card.Header>
        <div>
          <Link
            href={process.env.NEXT_PUBLIC_SUPPORT_URL || ''}
            className="btn btn-primary btn-outline btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('contact-support')}
            <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Help;
