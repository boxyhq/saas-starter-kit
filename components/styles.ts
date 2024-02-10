import styles from 'styles/sdk-override.module.css';

export const BOXYHQ_UI_CSS = {
  button: {
    ctoa: 'btn btn-md btn-primary',
    destructive: 'btn btn-md btn-error',
  },
  input: `${styles['sdk-input']} input input-bordered`,
  textarea: styles['sdk-input'],
  confirmationPrompt: {
    button: {
      ctoa: 'btn-md',
      cancel: 'btn-md btn-outline',
    },
  },
  secretInput: 'input input-bordered',
  section: 'mb-8',
};

export const tableWrapperClass = 'rounder border';
export const tableClass =
  'w-full text-left text-sm text-gray-500 dark:text-gray-400';
export const theadClass =
  'bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400';
export const trHeadClass = 'hover:bg-gray-50';
export const thClass = 'px-6 py-3';
export const trClass =
  'border-b bg-white last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
const tdClassBase = 'px-6 py-3 text-sm text-gray-500 dark:text-gray-400';
export const tdClass = `whitespace-nowrap ${tdClassBase}`;
export const tdClassWrap = `break-all ${tdClassBase}`;
