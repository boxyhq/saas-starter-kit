import { eventTypes } from '@/lib/common';
import React, { ReactElement } from 'react';
import type { WebookFormSchema } from 'types';
import { Checkbox } from '../shared';

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
      <Checkbox
        name="eventTypes"
        value={eventType}
        onChange={onChange}
        label={eventType}
        defaultChecked={values ? values.includes(eventType) : false}
      />
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
