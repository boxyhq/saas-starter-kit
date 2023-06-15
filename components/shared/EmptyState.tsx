import React from 'react';

const EmptyState = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 rounded py-24">
      <h3>{title}</h3>
    </div>
  );
};

export default EmptyState;
