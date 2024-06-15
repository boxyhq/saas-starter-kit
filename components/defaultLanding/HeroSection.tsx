import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const HeroSection = () => {
  const { t } = useTranslation('common');
  return (
    <div className="hero py-52">
      <div className="hero-content text-center">
        <div className="max-w-7xl">
          <h1 className="text-5xl font-bold">
            {' '}
            {t('Build Professional Resumes with AI')}
          </h1>
          <p className="py-6 text-2xl font-normal">
            {t(
              'Create ATS-friendly resumes in minutes.'
            )}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link
              href="/auth/join"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg focus:outline-none focus:shadow-outline"
            >
              {t('get-started')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
