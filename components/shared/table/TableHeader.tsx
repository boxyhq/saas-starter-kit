const theadClass =
  'bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400';
const trHeadClass = 'hover:bg-gray-50';
const thClass = 'px-6 py-3';

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
