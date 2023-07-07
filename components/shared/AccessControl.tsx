import type { Permission } from '@/lib/roles';
import usePermissions from 'hooks/usePermissions';

interface AccessControlProps {
  children: React.ReactNode;
  resource: Permission['resource'];
  actions: Permission['actions'];
}

const hasPermission = (
  permissions: Permission[],
  resource: Permission['resource'],
  actions: Permission['actions']
) => {
  return permissions.some(
    (permission) =>
      permission.resource === resource &&
      (permission.actions === '*' ||
        permission.actions.some((action) => actions.includes(action)))
  );
};

export const AccessControl = ({
  children,
  resource,
  actions,
}: AccessControlProps) => {
  const { permissions } = usePermissions();

  if (!permissions) {
    return null;
  }

  if (!hasPermission(permissions, resource, actions)) {
    return null;
  }

  return <>{children}</>;
};
