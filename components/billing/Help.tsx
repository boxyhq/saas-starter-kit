import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

import { Card } from '@/components/shared';

const Help = () => {
  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>Need anything else?</Card.Title>
          <Card.Description>
            If you require additional assistance regarding billing, our team is
            readily available to provide support.
          </Card.Description>
        </Card.Header>
        <div>
          <Link
            href="https://boxyhq.com/"
            className="btn btn-primary btn-outline btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact Support
            <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Help;
