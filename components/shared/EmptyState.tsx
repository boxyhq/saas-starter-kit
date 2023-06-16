import { FolderPlusIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-md lg:p-20 border-2 border-dashed gap-3 bg-white h-80 border-slate-600">
      <FolderPlusIcon className='w-12 h-12' />
      <h3 className='text-semibold text-emphasis text-center text-xl'>{title}</h3>
      {description && <p className='text-default text-center font-light leading-6'>{description}</p>}
    </div>
  );
};

export default EmptyState;
