import { Button } from 'react-daisyui';
import Badge from '@/components/shared/Badge';

const trClass =
  'border-b bg-white last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
const tdClassBase = 'px-6 py-3 text-sm text-gray-500 dark:text-gray-400';
const tdClass = `whitespace-nowrap ${tdClassBase}`;
//const tdClassWrap = `break-all ${tdClassBase}`;

interface TableBodyCell {
  text?: string;
  buttons?: {
    text: string;
    color?: string;
    onClick: () => void;
  }[];
  badge?: {
    text: string;
    color: string;
  };
  element?: React.JSX.Element;
}

export interface TableBodyType {
  id: string;
  cells: TableBodyCell[];
}

export const TableBody = ({ body }: { body: TableBodyType[] }) => {
  return (
    <tbody>
      {body.map((row) => {
        return (
          <tr key={row.id} className={trClass}>
            {row.cells?.map((cell: any, index: number) => {
              return (
                <td key={row.id + '-td-' + index} className={tdClass}>
                  {cell.buttons?.length === 0 ? null : (
                    <div className="flex space-x-2">
                      {cell.buttons?.map((button: any, index: number) => {
                        return (
                          <Button
                            key={row.id + '-button-' + index}
                            size="xs"
                            color={button.color}
                            variant="outline"
                            onClick={button.onClick}
                          >
                            {button.text}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  {cell.badge ? (
                    <Badge color={cell.badge.color}>{cell.badge.text}</Badge>
                  ) : null}
                  {cell.text ? cell.text : null}
                  {cell.element ? cell.element : null}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};
