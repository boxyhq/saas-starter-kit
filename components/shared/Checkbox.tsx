import React from 'react';

const Checkbox = ({
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
        <input
          type="checkbox"
          name={name}
          value={value}
          onChange={onChange}
          className="h-4 w-4 rounded bg-primary checkbox-primary"
          defaultChecked={Boolean(defaultChecked)}
        />
        <span className="text-gray-700">{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;
