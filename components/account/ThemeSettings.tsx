import {
  ChevronUpDownIcon,
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../shared';
import { useState } from 'react';
import { Theme, applyTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';

const ThemeSettings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme'));

  const { t } = useTranslation('common');

  const themes = [
    {
      id: 'system',
      name: t('system-default'),
      icon: ComputerDesktopIcon,
    },
    {
      id: 'dark',
      name: t('dark'),
      icon: MoonIcon,
    },
    {
      id: 'light',
      name: t('light'),
      icon: SunIcon,
    },
  ];

  const selectedTheme = themes.find((t) => t.id === theme) || themes[0];

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
                  className="border border-gray-300 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
                >
                  <div className="flex items-center gap-2">
                    <selectedTheme.icon className="w-5 h-5" />{' '}
                    {selectedTheme.name}
                  </div>
                  <ChevronUpDownIcon className="w-5 h-5" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content p-2 shadow-md bg-base-100 w-full rounded border px-2"
                >
                  {themes.map((theme) => (
                    <li key={theme.id}>
                      <button
                        className="w-full flex hover:bg-gray-100 focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
                        onClick={() => {
                          applyTheme(theme.id as Theme);
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
