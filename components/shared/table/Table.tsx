import { TableHeader } from './TableHeader';
import { TableBody, TableBodyType } from './TableBody';

const tableWrapperClass = 'relative rounder border overflow-x-auto scrollbar';
const tableClass = 'w-full text-left text-sm text-gray-500 dark:text-gray-400';

export const Table = ({
  cols,
  body,
  noMoreResults,
}: {
  cols: string[];
  body: TableBodyType[];
  noMoreResults?: boolean;
}) => {
  return (
    <div className={tableWrapperClass}>
      <table className={tableClass}>
        <TableHeader cols={cols} />
        <TableBody cols={cols} body={body} noMoreResults={noMoreResults} />
      </table>
    </div>
  );
};
