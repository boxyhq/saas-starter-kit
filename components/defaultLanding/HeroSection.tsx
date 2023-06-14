import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const HeroSection = () => {
  const { t } = useTranslation('common');
  return (
    <div className="hero py-52">
      <div className="hero-content text-center">
        <div className="max-w-7md">
          <h1 className="text-5xl font-bold"> {t('enterprise-saas-kit')}</h1>
          <p className="py-6 text-2xl font-normal">
            {t('kickstart-your-enterprise')}
          </p>
          <div className="flex items-center justify-center gap-2 ">
            <Link href="/auth/join">
              <a className="btn-primary btn px-8 no-underline">
                {t('get-started')}
              </a>
            </Link>
            <Link href="https://github.com/boxyhq/saas-starter-kit">
              <a className="btn-outline btn px-8">GitHub</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
