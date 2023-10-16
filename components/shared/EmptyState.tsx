import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded lg:p-20 border gap-2 bg-white dark:bg-black h-80 border-slate-300 dark:border-white">
      <InformationCircleIcon className="w-10 h-10" />
      <h3 className="text-semibold text-emphasis text-center text-lg">
        {title}
      </h3>
      {description && (
        <p className="text-default text-center font-light leading-6 text-sm">
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
