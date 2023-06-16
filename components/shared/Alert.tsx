import React from 'react';
import { Alert as AlertCore, AlertProps } from 'react-daisyui';

const Alert = (props: AlertProps) => {
  const { children, ...rest } = props;

  return (
    <AlertCore {...rest} className={`rounded px-4 py-3`}>
      {children}
    </AlertCore>
  );
};

export default Alert;
