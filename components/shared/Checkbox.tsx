import React from 'react';
import { Checkbox } from 'react-daisyui';

const CheckboxComponent = ({
  onChange,
  name,
  value,
  label,
  defaultChecked,
  className,
}: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
  className?: string;
}) => {
  return (
    <div className={`flex items-center ${className || ''}`} key={value}>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          name={name}
          value={value}
          onChange={onChange}
          defaultChecked={Boolean(defaultChecked)}
          className="h-4 w-4 rounded [--chkfg:oklch(var(--p))] [--chkbg:white]"
        />
        <span className="text-gray-700">{label}</span>
      </label>
    </div>
  );
};

export default CheckboxComponent;
