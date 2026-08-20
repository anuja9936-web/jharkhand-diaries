import { useState, useEffect } from 'react';
import { Menu, X, Shield, Store, User as UserIcon } from 'lucide-react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { publicNavItems, partnerNavItems } from '../../config/navigation';
import { getDashboardPathForRole } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button, Badge } from '../ui';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Listen to scroll position for subtle shadow enhancement
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-300',
        'bg-[rgba(247,243,234,0.92)] backdrop-blur-xl border-b border-ink-200/70 text-ink-900',
        isScrolled ? 'shadow-[0_4px_20px_-8px_rgba(39,52,44,0.10)]' : '',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full ring-2 ring-clay-400/40 bg-sand/60 p-0.5 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:ring-clay-500">
            <img
              src="/images/jharkhand-logo.png"
              alt="Jharkhand Tourism Emblem"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
              Jharkhand Tourism
            </p>
            <p className="text-sm sm:text-base font-bold font-display tracking-tight text-ink-950">
              Jharkhand Diaries
            </p>
          </div>
        </Link>

        {/* Center: Main Tourist Navigation */}
        <nav className="hidden items-center gap-1 xl:gap-1.5 lg:flex">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                [
                  'rounded-full px-3 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-forest-900 text-white font-bold'
                    : 'text-ink-700 hover:text-ink-900 hover:bg-[#EFE9D8]',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Partner Access & Auth Status */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Subtle Partner Access */}
          <div className="hidden md:flex items-center gap-1.5 border-r border-ink-200 pr-2.5">
            {partnerNavItems.map((partner) => (
              <Link
                key={partner.href}
                to={partner.href}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-ink-200/80 bg-[#FFFDF8] text-ink-700 hover:text-ink-900 hover:bg-[#EFE9D8] hover:border-ink-300 transition-all duration-150"
                title={`Access ${partner.label} portal`}
              >
                {partner.role === 'provider' ? (
                  <Store className="h-3.5 w-3.5 text-clay-600" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-forest-700" />
                )}
                <span>{partner.label}</span>
              </Link>
            ))}
          </div>

          {/* User Auth or Sign-in */}
          {loading ? (
            <span className="text-xs animate-pulse font-medium text-ink-500">
              Loading...
            </span>
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <Badge
                variant="neutral"
                className="hidden xl:inline-flex text-xs py-0.5 bg-forest-100/90 text-forest-900 border border-forest-300 font-semibold"
              >
                {profile?.full_name ?? user.email?.split('@')[0] ?? role}
              </Badge>
              <Button
                variant="primary"
                size="sm"
                asChild
                className="bg-forest-900 text-white hover:bg-forest-800 text-xs font-bold"
              >
                <Link to={getDashboardPathForRole(role)}>Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-ink-700 hover:text-ink-950 hover:bg-sand/70"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold bg-clay-700 text-white hover:bg-clay-800 shadow-xs transition-all duration-150"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-ink-200 bg-sand/60 text-ink-800 hover:bg-sand hover:text-ink-950 transition lg:hidden focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-ink-200/70 bg-[#F7F3EA] px-4 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl text-ink-900">
          <div className="flex flex-col gap-1.5">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-clay-700">
              Discover Jharkhand
            </p>
            {publicNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-forest-900 text-white font-bold'
                      : 'text-ink-700 hover:bg-[#EFE9D8] hover:text-ink-900',
                  ].join(' ')
                }
              >
                <item.icon className="h-4 w-4 opacity-75" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Partner Links Section in Mobile Drawer */}
            <div className="mt-3 pt-3 border-t border-ink-200">
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-clay-700">
                Partner Portals
              </p>
              <div className="grid grid-cols-2 gap-2">
                {partnerNavItems.map((partner) => (
                  <Link
                    key={partner.href}
                    to={partner.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl border border-ink-200/90 bg-sand/40 px-3 py-2 text-xs font-semibold text-ink-800 hover:bg-sand hover:text-ink-950 transition-colors"
                  >
                    {partner.role === 'provider' ? (
                      <Store className="h-3.5 w-3.5 text-clay-700" />
                    ) : (
                      <Shield className="h-3.5 w-3.5 text-forest-700" />
                    )}
                    <span>{partner.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth status in mobile menu */}
            <div className="mt-3 pt-3 border-t border-ink-200 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-3 py-1 text-xs font-semibold text-ink-600">
                    Signed in as {profile?.full_name ?? user.email}
                  </div>
                  <Button asChild onClick={() => setMobileMenuOpen(false)} className="bg-forest-900 text-white hover:bg-forest-800 font-bold">
                    <Link to={getDashboardPathForRole(role)}>Go to Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="text-ink-700 hover:bg-sand/70">
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild onClick={() => setMobileMenuOpen(false)} className="bg-clay-700 text-white hover:bg-clay-800 font-bold">
                  <Link to="/login">Sign In / Join Platform</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
