import { Navigate } from 'react-router-dom';
import { useCurrentRole } from '../hooks/useCurrentRole';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/common';

export function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const { isHydrated, role } = useCurrentRole();

  if (!isHydrated) {
    return <div className="p-8">Loading access profile...</div>;
  }

  const isAllowed = allowedRoles.includes(role) || (role === 'admin' && allowedRoles.includes('admin'));

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
