import React from 'react';
import env from '@/lib/env';
import ReCAPTCHA from 'react-google-recaptcha';

interface Props {
  recaptchaRef: React.RefObject<ReCAPTCHA>;
  onChange: (token: string) => void;
}

const GoogleReCAPTCHA = ({ recaptchaRef, onChange }: Props) => {
  if (!env.recaptcha.siteKey) {
    return null;
  }

  return (
    <div className="pt-4">
      <ReCAPTCHA
        ref={recaptchaRef}
        onChange={onChange}
        sitekey={env.recaptcha.siteKey}
      />
    </div>
  );
};

export default GoogleReCAPTCHA;
