import * as React from 'react';

type TableProps = {
  body: JSX.Element | JSX.Element[];
  head?: JSX.Element | JSX.Element[];
  className?: string;
  containerClassName?: string;
  borderless?: boolean;
  headTrClasses?: string;
};

function Table({ body, head }: TableProps) {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>{head}</tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}

type ThProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const Th: React.FC<ThProps> = ({ children, className, style }) => {
  const classes = ['px-6 py-3 text-left'];

  if (className) classes.push(className);

  return (
    <th className={classes.join(' ')} style={style}>
      <span>{children}</span>
    </th>
  );
};

type TrProps = {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
};

const Tr: React.FC<TrProps> = ({ children, onClick, style }) => {
  return (
    <tr
      className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
      onClick={onClick}
      style={style}
    >
      {children}
    </tr>
  );
};

type TdProps = {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLProps<HTMLTableCellElement>;

const Td: React.FC<TdProps> = ({ children, colSpan, style, ...rest }) => {
  return (
    <td className="px-6 py-4" colSpan={colSpan} style={style} {...rest}>
      {children}
    </td>
  );
};

Table.th = Th;
Table.td = Td;
Table.tr = Tr;

export default Table;
