import type { Action, Resource } from '@/lib/permissions';
import useCanAccess from 'hooks/useCanAccess';

interface AccessControlProps {
  children: React.ReactNode;
  resource: Resource;
  actions: Action[];
}

export const AccessControl = ({
  children,
  resource,
  actions,
}: AccessControlProps) => {
  const { canAccess } = useCanAccess();

  if (!canAccess(resource, actions)) {
    return null;
  }

  return <>{children}</>;
};
