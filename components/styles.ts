import styles from 'styles/sdk-override.module.css';

export const BOXYHQ_UI_CSS = {
  button: {
    ctoa: 'btn btn-md btn-primary',
    destructive: 'btn btn-md btn-error',
    cancel: 'btn-md',
  },
  input: `${styles['sdk-input']} input input-bordered`,
  select: styles['sdk-select'],
  textarea: styles['sdk-input'],
  confirmationPrompt: {
    button: {
      ctoa: 'btn-md',
      cancel: 'btn-md',
    },
  },
  secretInput: 'input input-bordered',
  section: 'mb-8',
};
