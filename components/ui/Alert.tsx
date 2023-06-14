import React from 'react';
import { Alert as AlertCore, AlertProps } from 'react-daisyui';

const Alert = (props: AlertProps) => {
  const { children, status = "success", ...rest } = props;

  const classes = {
    danger: 'bg-red-100 border-red-400 text-red-700',
    success: 'bg-green-100 border-green-400 text-green-700',
  };

  return (
    <AlertCore {...rest} className={`rounded px-4 py-3 text-white ${classes[status]}`}>
      {children}
    </AlertCore>
  );
};

export default Alert;