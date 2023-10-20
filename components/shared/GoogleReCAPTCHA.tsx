import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface Props {
  recaptchaRef: React.RefObject<ReCAPTCHA>;
  onChange: (token: string) => void;
  siteKey: string | null;
}

const GoogleReCAPTCHA = ({ recaptchaRef, onChange, siteKey }: Props) => {
  if (!siteKey) {
    return null;
  }

  return (
    <div className="pt-4">
      <ReCAPTCHA ref={recaptchaRef} onChange={onChange} sitekey={siteKey} />
    </div>
  );
};

export default GoogleReCAPTCHA;
