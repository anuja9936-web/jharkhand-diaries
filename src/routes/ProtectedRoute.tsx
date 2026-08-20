import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingState } from '../components/common/StateBlocks';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { loading, user } = useAuth();

  if (loading) {
    return <LoadingState label="Checking your access..." />;
  }

  if (!user) {
    const redirectPath = location.pathname.startsWith('/admin') ? '/auth/government' : '/login';
    return <Navigate to={redirectPath} replace state={{ from: location.pathname }} />;
  }

  return children;
}
