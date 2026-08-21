import {
  AlertTriangle,
  BarChart3,
  Camera,
  ChevronRight,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminNavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const ADMIN_PRIMARY_LINKS: AdminNavItem[] = [
  { label: 'Administration Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Destination Management', href: '/admin/destinations', icon: MapPin },
  { label: 'Media & Photo Manager', href: '/admin/media', icon: Camera },
  { label: 'Provider Verification', href: '/admin/vendors', icon: ShieldCheck },
  { label: '24 District Portals', href: '/admin/districts', icon: Map },
];

const ADMIN_OPS_LINKS: AdminNavItem[] = [
  { label: 'Tourism Alerts & Advisories', href: '/admin/alerts', icon: AlertTriangle },
  { label: 'Feedback & Grievances', href: '/admin/feedback', icon: MessageSquare },
  { label: 'Tourism Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Content Management', href: '/admin/content', icon: FileText },
];

export function AdminSidebar({ className = '' }: { className?: string }) {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const adminName = profile?.full_name || user?.email?.split('@')[0] || 'Tourism Admin';

  return (
    <aside
      className={`h-full w-72 shrink-0 flex flex-col justify-between border-r border-ink-200 bg-[#FDFBF7] p-4 overflow-y-auto ${
        className ? className : 'hidden lg:flex'
      }`}
    >
      <div className="space-y-5">
        {/* Government Authority Badge & Identity */}
        <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-clay-700">
              Government of Jharkhand
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <Landmark className="h-3 w-3" />
              Tourism Desk
            </span>
          </div>
          <h2 className="mt-2 truncate font-display text-base font-bold text-ink-900">
            Jharkhand Tourism
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">Administration & Governance</p>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4 text-sm font-medium text-ink-700">
          {/* Main Governance Group */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
              Tourism Governance
            </div>
            {ADMIN_PRIMARY_LINKS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/admin/dashboard'}
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all text-xs font-medium',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
              </NavLink>
            ))}
          </div>

          {/* Operations & Intelligence Group */}
          <div className="space-y-1 pt-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
              Operations & Alerts
            </div>
            {ADMIN_OPS_LINKS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all text-xs font-medium',
                    isActive
                      ? 'bg-clay-700 text-white font-semibold shadow-sm'
                      : 'hover:bg-sand/80 hover:text-ink-900',
                  ].join(' ')
                }
              >
                <span className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="space-y-3 border-t border-ink-200 pt-4">
        <div className="rounded-xl bg-sand/60 p-3">
          <p className="text-[11px] font-semibold text-ink-900 truncate">{adminName}</p>
          <p className="text-[10px] text-ink-500">Government Administrator</p>
        </div>

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
