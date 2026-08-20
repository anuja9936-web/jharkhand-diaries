import {
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  Car,
  ChevronRight,
  Compass,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { VERIFICATION_STATUS_LABELS } from '../../constants/provider';
import type { ProviderCapability } from '../../types/provider';

interface ServiceNavItem {
  id: ProviderCapability;
  label: string;
  href: string;
  icon: typeof Building2;
}

const SERVICE_NAV_ITEMS: ServiceNavItem[] = [
  { id: 'accommodation', label: 'Accommodations', href: '/provider/stays', icon: Building2 },
  { id: 'artisan', label: 'Products & Crafts', href: '/provider/products', icon: Package },
  { id: 'guide', label: 'Tours & Guides', href: '/provider/tours', icon: Compass },
  { id: 'adventure', label: 'Experiences', href: '/provider/experiences', icon: Sparkles },
  { id: 'transport', label: 'Transport Services', href: '/provider/transport', icon: Car },
];

export function ProviderSidebar({ className = '' }: { className?: string }) {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const rawCapabilities = profile?.provider_categories ?? [];
  // If provider has selected specific capabilities, filter down strictly. If empty, show none until selected.
  const activeCapabilities = new Set<string>(rawCapabilities.map((c) => c.toLowerCase()));

  const visibleServices =
    rawCapabilities.length > 0
      ? SERVICE_NAV_ITEMS.filter((service) => activeCapabilities.has(service.id))
      : [];

  const verificationStatus = profile?.verification_status ?? 'unverified';
  const verificationConfig = VERIFICATION_STATUS_LABELS[verificationStatus] ?? VERIFICATION_STATUS_LABELS.unverified;

  const providerName =
    profile?.business_name || profile?.full_name || user?.email?.split('@')[0] || 'Local Provider';

  return (
    <aside
      className={`h-full w-72 shrink-0 flex flex-col justify-between border-r border-ink-200 bg-[#FDFBF7] p-4 overflow-y-auto ${
        className ? className : 'hidden lg:flex'
      }`}
    >
      <div className="space-y-5">
        {/* Brand & Workspace Identity */}
        <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clay-700">
              Jharkhand Diaries
            </span>
            {verificationStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            ) : verificationStatus === 'under_review' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                <ShieldAlert className="h-3 w-3" />
                In Review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                Unverified
              </span>
            )}
          </div>
          <h2 className="mt-2 truncate font-display text-lg font-bold text-ink-900">{providerName}</h2>
          <p className="mt-0.5 text-xs text-ink-500">Service Provider Portal</p>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-1 text-sm font-medium text-ink-700">
          {/* Main Dashboard */}
          <NavLink
            to="/provider/dashboard"
            end
            className={({ isActive }) =>
              [
                'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all',
                isActive
                  ? 'bg-clay-700 text-white font-semibold shadow-sm'
                  : 'hover:bg-sand/80 hover:text-ink-900',
              ].join(' ')
            }
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </span>
            <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
          </NavLink>

          {/* Type-Specific Services Group */}
          <div className="pt-3">
            <div className="flex items-center justify-between px-3.5 pb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
                My Services {visibleServices.length > 0 ? `(${visibleServices.length})` : ''}
              </span>
              {rawCapabilities.length === 0 && (
                <span className="text-[10px] font-semibold text-clay-700">Setup Required</span>
              )}
            </div>

            <div className="space-y-0.5">
              {visibleServices.length === 0 ? (
                <NavLink
                  to="/provider/dashboard"
                  className="group flex items-center justify-between rounded-xl border border-dashed border-clay-300 bg-sand/30 px-3 py-2 text-xs font-medium text-clay-800 hover:bg-sand transition-all"
                >
                  <span>Select services to manage →</span>
                </NavLink>
              ) : (
                visibleServices.map((service) => (
                  <NavLink
                    key={service.href}
                    to={service.href}
                    className={({ isActive }) =>
                      [
                        'group flex items-center justify-between rounded-xl px-3.5 py-2 text-xs transition-all',
                        isActive
                          ? 'bg-ink-900 text-white font-semibold shadow-sm'
                          : 'text-ink-600 hover:bg-sand hover:text-ink-900',
                      ].join(' ')
                    }
                  >
                    <span className="flex items-center gap-2.5">
                      <service.icon className="h-3.5 w-3.5" />
                      {service.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </NavLink>
                ))
              )}
            </div>
          </div>

          {/* Unified Operations */}
          <div className="pt-3">
            <div className="px-3.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
              Operations
            </div>

            <div className="space-y-0.5">
              <NavLink
                to="/provider/requests"
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-3">
                  <CalendarCheck className="h-4 w-4" />
                  Bookings & Requests
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </NavLink>

              <NavLink
                to="/provider/enquiries"
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  Messages & Enquiries
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </NavLink>

              <NavLink
                to="/provider/reviews"
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-3">
                  <Star className="h-4 w-4" />
                  Reviews
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </NavLink>

              <NavLink
                to="/provider/analytics"
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </NavLink>
            </div>
          </div>

          {/* Account & Trust */}
          <div className="pt-3">
            <div className="px-3.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
              Account & Trust
            </div>

            <div className="space-y-0.5">
              <NavLink
                to="/provider/verification"
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4" />
                  Verification
                </span>
                <span className="rounded-md bg-sand px-1.5 py-0.5 text-[10px] font-semibold text-clay-800">
                  {verificationConfig.label.split(' ')[0]}
                </span>
              </NavLink>

              <NavLink
                to="/provider/notifications"
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  Notifications
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </NavLink>

              <NavLink
                to="/provider/profile"
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4" />
                  My Profile & Setup
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </NavLink>

              <NavLink
                to="/provider/settings"
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  Settings
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      {/* Footer / Public Profile & Logout */}
      <div className="space-y-2 border-t border-ink-200 pt-4">
        {user?.id && (
          <NavLink
            to={`/providers/${user.id}`}
            target="_blank"
            className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-xs font-medium text-ink-700 border border-ink-200 hover:bg-sand hover:text-ink-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-clay-700" />
              View Public Profile
            </span>
            <span className="text-[10px] text-ink-400">Live</span>
          </NavLink>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
