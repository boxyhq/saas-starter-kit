import React from 'react';

const Card = (props: { heading: string; children: React.ReactNode }) => {
  const { heading, children } = props;

  return (
    <div className="mt-5 flex flex-col border border-gray-300">
      <div className="border-b border-gray-300 bg-gray-100 px-3 py-3 text-sm font-medium text-gray-900">
        {heading}
      </div>
      <div>{children}</div>
    </div>
  );
};

const Body = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`${className} bg-white`}>{children}</div>;
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return <div className="border-t border-gray-300 py-3 px-3">{children}</div>;
};

Card.Body = Body;
Card.Footer = Footer;

export default Card;
