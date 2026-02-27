'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cookie_consent';

type ConsentValue = 'all' | 'necessary' | null;

interface Props {
  text?: string;
  privacyUrl?: string;
}

const CookieBanner: React.FC<Props> = ({
  text = 'We use cookies to improve your experience and analyse site usage. You can accept all cookies or only the necessary ones.',
  privacyUrl = '/privacy',
}) => {
  const [consent, setConsent] = useState<ConsentValue | 'loading'>('loading');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
    setConsent(stored);
  }, []);

  const accept = (value: 'all' | 'necessary') => {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  };

  // Don't render until hydrated or if already consented
  if (consent === 'loading' || consent !== null) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-base-300/95 backdrop-blur border-t border-base-300 shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-base-content/80 flex-1">
          {text}{' '}
          <a href={privacyUrl} className="link link-primary">
            Privacy Policy
          </a>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => accept('necessary')}
            className="btn btn-sm btn-ghost btn-outline"
          >
            Necessary only
          </button>
          <button
            onClick={() => accept('all')}
            className="btn btn-sm btn-primary"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
