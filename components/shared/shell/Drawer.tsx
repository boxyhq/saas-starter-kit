import app from '@/lib/app';
import Link from 'next/link';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import TeamDropdown from '../TeamDropdown';
import { type SidebarMenuItem } from '../SidebarItem';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DrawerProps {
  sidebarOpen: boolean;
  navigation: SidebarMenuItem[];
  setSidebarOpen: (open: boolean) => void;
}

const Drawer = ({ sidebarOpen, setSidebarOpen, navigation }: DrawerProps) => {
  return (
    <>
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600/80" />
          <div className={classNames('fixed inset-0 flex')}>
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center text-xl font-bold">
                  {app.name}
                </div>
                <TeamDropdown />
                <Navigation menus={navigation} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center text-xl font-bold">
            {app.name}
          </div>
          <TeamDropdown />
          <Navigation menus={navigation} />
        </div>
      </div>
    </>
  );
};

const Navigation = ({ menus }) => {
  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {menus.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={classNames(
                    item.active
                      ? 'bg-gray-50 text-indigo-600'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.active
                        ? 'text-indigo-600'
                        : 'text-gray-400 group-hover:text-indigo-600',
                      'h-6 w-6 shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Drawer;
