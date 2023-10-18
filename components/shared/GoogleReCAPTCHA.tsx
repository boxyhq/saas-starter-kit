import React from 'react';
import env from '@/lib/env';
import ReCAPTCHA from 'react-google-recaptcha';

interface Props {
  onChange: (token: string) => void;
}

const GoogleReCAPTCHA = ({ onChange }: Props) => {
  const ref = React.createRef();

  if (!env.recaptcha.siteKey) {
    return null;
  }

  return (
    <div className="pt-4">
      <ReCAPTCHA
        ref={ref}
        onChange={onChange}
        sitekey={env.recaptcha.siteKey}
      />
    </div>
  );
};

export default GoogleReCAPTCHA;
