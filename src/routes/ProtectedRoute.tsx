import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/common/StateBlocks';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <ClerkLoaded>
      <ClerkLoading>
        <LoadingState label="Checking your access..." />
      </ClerkLoading>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
      </SignedOut>
    </ClerkLoaded>
  );
}

export function ProtectedRouteFallback() {
  return <LoadingState label="Checking your access..." />;
}
