import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TeamNavigation from './TeamNavigation';
import UserNavigation from './UserNavigation';

const Navigation = () => {
  const { asPath, isReady, query } = useRouter();
  const [activePathname, setActivePathname] = useState<null | string>(null);

  const { slug } = query as { slug: string };

  useEffect(() => {
    if (isReady && asPath) {
      const activePathname = new URL(asPath, location.href).pathname;
      setActivePathname(activePathname);
    }
  }, [asPath, isReady]);

  return (
    <nav className="flex flex-1 flex-col">
      {slug ? (
        <TeamNavigation slug={slug} activePathname={activePathname} />
      ) : (
        <UserNavigation activePathname={activePathname} />
      )}
    </nav>
  );
};

export default Navigation;
