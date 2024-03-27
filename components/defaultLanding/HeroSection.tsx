import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const HeroSection = () => {
  const { t } = useTranslation('common');
  return (
    <div className="hero py-52">
      <div className="hero-content text-center">
        <div className="max-w-7xl">
          <h1 className="text-5xl font-bold"> {t('enterprise-saas-kit')}</h1>
          <p className="py-6 text-2xl font-normal">
            {t('kickstart-your-enterprise')}
          </p>
          <div className="flex items-center justify-center gap-2 ">
            <Link
              href="/auth/join"
              className="btn btn-primary px-8 no-underline"
            >
              {t('get-started')}
            </Link>
            <Link
              href="https://github.com/boxyhq/saas-starter-kit"
              className="btn btn-outline px-8"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
