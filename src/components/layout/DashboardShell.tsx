import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ExternalLink, LogOut } from 'lucide-react';
import { ROLE_LABELS } from '../../constants/roles';
import type { UserRole } from '../../types/common';
import { Badge, Button } from '../ui';
import { Sidebar } from '../navigation/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { VERIFICATION_STATUS_LABELS } from '../../constants/provider';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const verificationStatus = profile?.verification_status ?? 'unverified';
  const verificationConfig = VERIFICATION_STATUS_LABELS[verificationStatus] ?? VERIFICATION_STATUS_LABELS.unverified;

  return (
    <div className="flex min-h-screen w-full bg-[#FAF8F5] overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar role={role} />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-80 max-w-[85vw] flex-1 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink-200 p-4">
              <span className="font-display font-bold text-ink-900">Workspace Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-sand hover:text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setMobileMenuOpen(false)}>
              <Sidebar role={role} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/80 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-ink-200 bg-white p-2 text-ink-700 hover:bg-sand lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="accent">{ROLE_LABELS[role]}</Badge>
                  {role === 'provider' && (
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-clay-800">
                      {verificationConfig.label}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 font-display text-xl font-bold text-ink-900 sm:text-2xl">{title}</h1>
                <p className="hidden text-xs text-ink-600 sm:block">{description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {role === 'provider' && user?.id && (
                <Button variant="secondary" size="sm" asChild className="hidden md:inline-flex text-xs">
                  <Link to={`/providers/${user.id}`} target="_blank">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Public Profile
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs text-red-700 hover:bg-red-50">
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
