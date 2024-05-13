import { Button } from 'react-daisyui';
import Badge from '@/components/shared/Badge';
import { useTranslation } from 'next-i18next';

const trClass =
  'border-b bg-white last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
const tdClassBase = 'px-6 py-3 text-sm text-gray-500 dark:text-gray-400';
const tdClass = `whitespace-nowrap ${tdClassBase}`;
const tdClassWrap = `break-all ${tdClassBase}`;

interface TableBodyCell {
  wrap?: boolean;
  text?: string;
  minWidth?: number;
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
  actions?: {
    text: string;
    icon: React.JSX.Element;
    onClick: () => void;
    destructive?: boolean;
  }[];
}

export interface TableBodyType {
  id: string;
  cells: TableBodyCell[];
}

export const TableBody = ({
  cols,
  body,
  noMoreResults,
}: {
  cols: string[];
  body: TableBodyType[];
  noMoreResults?: boolean;
}) => {
  const { t } = useTranslation('common');

  if (noMoreResults) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={cols.length}
            className="px-6 py-3 text-center text-sm text-gray-500"
          >
            {t('no-more-results')}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {body.map((row) => {
        return (
          <tr key={row.id} className={trClass}>
            {row.cells?.map((cell: any, index: number) => {
              return (
                <td
                  key={row.id + '-td-' + index}
                  className={`${cell.wrap ? tdClassWrap : tdClass}`}
                  style={
                    cell.minWidth ? { minWidth: `${cell.minWidth}px` } : {}
                  }
                >
                  {!cell.buttons || cell.buttons?.length === 0 ? null : (
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
                  {!cell.actions || cell.actions?.length === 0 ? null : (
                    <span className="flex gap-3">
                      {cell.actions?.map((action: any, index: number) => {
                        return (
                          <div
                            key={row.id + '-diva-' + index}
                            className="tooltip"
                            data-tip={action.text}
                          >
                            <button
                              key={row.id + '-action-' + index}
                              className={`py-2 ${action.destructive ? 'text-red-500 hover:text-red-900' : 'hover:text-green-400'}`}
                              onClick={action.onClick}
                            >
                              {action.icon}
                            </button>
                          </div>
                        );
                      })}
                    </span>
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
