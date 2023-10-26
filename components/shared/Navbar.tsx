import Link from 'next/link';
import { Button } from 'react-daisyui';
import { signOut } from 'next-auth/react';
import { MouseEventHandler } from 'react';
import useTheme from 'hooks/useTheme';
import app from '@/lib/app';
import env from '@/lib/env';

export default function Navbar({
  toggleSidebar,
}: {
  toggleSidebar: MouseEventHandler<HTMLButtonElement>;
}) {
  const { toggleTheme, selectedTheme } = useTheme();

  return (
    <nav className="fixed z-30 w-full border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-black">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button
              onClick={toggleSidebar}
              aria-expanded="true"
              aria-controls="sidebar"
              className="mr-2 cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <svg
                className="hidden h-6 w-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="flex items-center text-xl font-bold lg:ml-2.5">
              <Link href="/">
                <span className="self-center whitespace-nowrap">
                  {app.name}
                </span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {env.darkModeEnabled && (
              <button
                className="p-0 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-gray-200 dark:hover:text-black"
                onClick={toggleTheme}
              >
                <selectedTheme.icon className="w-5 h-5" />
              </button>
            )}
            <Button size="sm" variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
