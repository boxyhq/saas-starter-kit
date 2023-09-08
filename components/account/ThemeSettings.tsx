import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { Card } from '../shared';
import { useTranslation } from 'react-i18next';
import useTheme from 'hooks/useTheme';

const ThemeSettings = () => {
  const { t } = useTranslation('common');
  const { setTheme, themes, selectedTheme, applyTheme } = useTheme();

  return (
    <Card heading={t('theme')}>
      <Card.Body className="px-3 py-3">
        <div className="flex justify-between items-center">
          <span>{t('interface-theme')}</span>
          <div className="px-4 py-2">
            <div className="flex">
              <div className="dropdown w-60">
                <div
                  tabIndex={0}
                  className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
                >
                  <div className="flex items-center gap-2">
                    <selectedTheme.icon className="w-5 h-5" />{' '}
                    {selectedTheme.name}
                  </div>
                  <ChevronUpDownIcon className="w-5 h-5" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
                >
                  {themes.map((theme) => (
                    <li key={theme.id}>
                      <button
                        className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
                        onClick={() => {
                          applyTheme(theme.id);
                          setTheme(theme.id);
                          if (document.activeElement) {
                            (document.activeElement as HTMLElement).blur();
                          }
                        }}
                      >
                        {theme.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
export default ThemeSettings;
