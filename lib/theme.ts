export type Theme = 'system' | 'dark' | 'light';
export type ThemesProps = {
  id: Theme;
  name: string;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & React.RefAttributes<SVGSVGElement>
  >;
};

export const applyTheme = (theme: Theme) => {
  switch (theme) {
    case 'dark':
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'black');
      localStorage.setItem('theme', 'dark');
      break;
    case 'light':
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'corporate');
      localStorage.setItem('theme', 'light');
      break;
    case 'system':
    default:
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'black');
        localStorage.removeItem('theme');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'corporate');
        localStorage.removeItem('theme');
      }
      break;
  }
};
