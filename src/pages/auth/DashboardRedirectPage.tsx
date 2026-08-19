import { Navigate } from 'react-router-dom';
import { LoadingState } from '../../components/common/StateBlocks';
import { useCurrentRole } from '../../hooks/useCurrentRole';
import { getDashboardPathForRole } from '../../lib/auth';

export function DashboardRedirectPage() {
  const { isHydrated, role } = useCurrentRole();

  if (!isHydrated) {
    return <LoadingState label="Loading your dashboard..." />;
  }

  return <Navigate to={getDashboardPathForRole(role)} replace />;
}
