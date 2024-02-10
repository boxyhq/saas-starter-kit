import { TableHeader } from './TableHeader';
import { TableBody, TableBodyType } from './TableBody';

const tableWrapperClass = 'rounder border';
const tableClass = 'w-full text-left text-sm text-gray-500 dark:text-gray-400';

export const Table = ({
  cols,
  body,
}: {
  cols: string[];
  body: TableBodyType[];
}) => {
  return (
    <div className={tableWrapperClass}>
      <table className={tableClass}>
        <TableHeader cols={cols} />
        <TableBody body={body} />
      </table>
    </div>
  );
};
