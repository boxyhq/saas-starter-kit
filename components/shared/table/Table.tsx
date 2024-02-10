import { tableWrapperClass, tableClass } from '@/components/styles';
import { TableHeader } from './TableHeader';
import { TableBody, TableBodyType } from './TableBody';

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
