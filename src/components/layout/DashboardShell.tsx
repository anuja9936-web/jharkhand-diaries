import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROLE_LABELS } from '../../constants/roles';
import type { UserRole } from '../../types/common';
import { Badge, Button, Card } from '../ui';
import { Sidebar } from '../navigation/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getDashboardPathForRole } from '../../lib/auth';

export function DashboardShell({
  role,
  title,
  description,
  children,
}: {
  role: UserRole;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-[calc(100vh-1px)]">
      <Sidebar role={role} />
      <main className="flex-1">
        <div className="border-b border-ink-200 bg-white/70 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge variant="accent">{ROLE_LABELS[role]} area</Badge>
              <h1 className="mt-2 text-2xl font-semibold text-ink-900">{title}</h1>
              <p className="mt-1 text-sm text-ink-600">{description}</p>
            </div>
            <div className="rounded-3xl border border-ink-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-clay-700">Signed in</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{profile?.full_name ?? user?.email ?? 'Account'}</p>
                <p className="text-xs text-ink-500">{profile?.email ?? user?.email ?? 'No email available'}</p>
                <div className="mt-3 flex items-center justify-end gap-3">
                  <Button variant="secondary" asChild>
                    <Link to={getDashboardPathForRole(role)}>Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="pattern-surface">{children}</Card>
        </div>
      </main>
    </div>
  );
}
