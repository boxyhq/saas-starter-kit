import type { Action, Resource } from '@/lib/permissions';
import useCanAccess from 'hooks/useCanAccess';
import useActiveSubscription from 'hooks/useActiveSubscription';

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
  const { hasActiveSubscription } = useActiveSubscription();

  if (!canAccess(resource, actions) || !hasActiveSubscription()) {
    return null;
  }

  return <>{children}</>;
};
