import { eventTypes } from '@/lib/common';
import React, { ReactElement } from 'react';
import type { WebookFormSchema } from 'types';

const EventTypes = ({
  onChange,
  values,
  error,
}: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  values: WebookFormSchema['eventTypes'];
  error: string | string[] | undefined;
}) => {
  const events: ReactElement[] = [];

  eventTypes.forEach((eventType) => {
    events.push(
      <div className="flex items-center" key={eventType}>
        <input
          type="checkbox"
          name="eventTypes"
          value={eventType}
          onChange={onChange}
          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
          defaultChecked={values ? values.includes(eventType) : false}
        />
        <label className="ml-2 text-sm text-gray-900">{eventType}</label>
      </div>
    );
  });

  return (
    <>
      {events}
      {error && typeof error === 'string' && (
        <div className="label-text-alt text-red-500">{error}</div>
      )}
    </>
  );
};

export default EventTypes;
