import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROLE_LABELS } from '../../constants/roles';
import type { UserRole } from '../../types/common';
import { Badge, Button, Card } from '../ui';
import { Sidebar } from '../navigation/Sidebar';
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';

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
            <div className="flex items-center gap-3">
              <SignedOut>
                <Button variant="secondary" asChild>
                  <Link to="/sign-in">Sign in</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
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
