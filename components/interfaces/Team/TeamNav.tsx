import NavItem from '@/components/ui/NavItem';
import { teamNavigations } from '@/lib/teams';
import { useRouter } from 'next/router';

const TeamNav = ({ slug }: { slug: string }) => {
  const { route } = useRouter();

  const pageKey = route.split('[slug]/');

  const navigations = teamNavigations(slug, pageKey[1]);

  return (
    <>
      {navigations.map((menu) => {
        return (
          <NavItem
            href={menu.href}
            text={menu.name}
            active={menu.active}
            key={menu.href}
            icon={menu.icon}
          />
        );
      })}
    </>
  );
};

export default TeamNav;
