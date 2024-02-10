import { theadClass, trHeadClass, thClass } from '@/components/styles';

export const TableHeader = ({ cols }: { cols: string[] }) => {
  return (
    <thead className={theadClass}>
      <tr className={trHeadClass}>
        {cols.map((col, index) => (
          <th key={index} scope="col" className={thClass}>
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
};
