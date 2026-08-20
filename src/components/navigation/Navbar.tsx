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

  const isHome = location.pathname === '/';

  // Listen to scroll position for glassmorphism transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
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
        isHome && !isScrolled
          ? 'bg-ink-950/40 backdrop-blur-md border-b border-white/10 text-white shadow-xs'
          : 'bg-white/90 backdrop-blur-xl border-b border-ink-200/80 text-ink-900 shadow-sm',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div
            className={[
              'relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-full ring-2 transition-all duration-300 group-hover:scale-105',
              isHome && !isScrolled
                ? 'ring-amber-400/40 bg-white/20 shadow-md'
                : 'ring-forest-500/20 bg-white shadow-sm',
            ].join(' ')}
          >
            <img
              src="/images/jharkhand-logo.png"
              alt="Jharkhand Tourism Emblem"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p
              className={[
                'text-[10px] sm:text-xs font-bold uppercase tracking-[0.24em] transition-colors',
                isHome && !isScrolled ? 'text-amber-300' : 'text-clay-700',
              ].join(' ')}
            >
              Jharkhand Tourism
            </p>
            <p
              className={[
                'text-sm sm:text-base font-bold font-display tracking-tight transition-colors',
                isHome && !isScrolled ? 'text-white' : 'text-ink-900',
              ].join(' ')}
            >
              Jharkhand Diaries
            </p>
          </div>
        </Link>

        {/* Center: Main Tourist Navigation */}
        <nav className="hidden items-center gap-0.5 xl:gap-1 lg:flex">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                [
                  'rounded-full px-3 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-200',
                  isActive
                    ? isHome && !isScrolled
                      ? 'bg-white/25 text-white shadow-xs backdrop-blur-sm'
                      : 'bg-ink-900 text-white shadow-sm'
                    : isHome && !isScrolled
                      ? 'text-white/80 hover:bg-white/15 hover:text-white'
                      : 'text-ink-700 hover:bg-sand hover:text-ink-900',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Partner Access & Auth Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Subtle Partner Access */}
          <div className="hidden md:flex items-center gap-1.5 border-r border-ink-200/40 pr-3">
            {partnerNavItems.map((partner) => (
              <Link
                key={partner.href}
                to={partner.href}
                className={[
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
                  isHome && !isScrolled
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100',
                ].join(' ')}
                title={`Access ${partner.label} portal`}
              >
                {partner.role === 'provider' ? (
                  <Store className="h-3.5 w-3.5 opacity-70" />
                ) : (
                  <Shield className="h-3.5 w-3.5 opacity-70" />
                )}
                <span>{partner.label}</span>
              </Link>
            ))}
          </div>

          {/* User Auth or Sign-in */}
          {loading ? (
            <span
              className={[
                'text-xs animate-pulse font-medium',
                isHome && !isScrolled ? 'text-white/60' : 'text-ink-400',
              ].join(' ')}
            >
              Loading...
            </span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="accent"
                className="hidden xl:inline-flex text-xs py-0.5"
              >
                {profile?.full_name ?? user.email?.split('@')[0] ?? role}
              </Badge>
              <Button
                variant={isHome && !isScrolled ? 'secondary' : 'primary'}
                size="sm"
                asChild
              >
                <Link to={getDashboardPathForRole(role)}>Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={
                  isHome && !isScrolled
                    ? 'text-white/80 hover:text-white hover:bg-white/20'
                    : ''
                }
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className={[
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
                  isHome && !isScrolled
                    ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                    : 'border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 shadow-2xs',
                ].join(' ')}
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
            className={[
              'grid h-9 w-9 place-items-center rounded-xl border transition lg:hidden focus:outline-none',
              isHome && !isScrolled
                ? 'border-white/20 bg-black/30 text-white hover:bg-white/20'
                : 'border-ink-200 bg-white/80 text-ink-800 hover:bg-sand',
            ].join(' ')}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-ink-200/80 bg-white/98 backdrop-blur-2xl px-4 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl text-ink-900">
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
                    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-ink-900 text-white shadow-xs'
                      : 'text-ink-700 hover:bg-sand hover:text-ink-900',
                  ].join(' ')
                }
              >
                <item.icon className="h-4 w-4 opacity-70" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Partner Links Section */}
            <div className="mt-3 pt-3 border-t border-ink-100">
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                Partner Portals
              </p>
              <div className="grid grid-cols-2 gap-2">
                {partnerNavItems.map((partner) => (
                  <Link
                    key={partner.href}
                    to={partner.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 rounded-lg border border-ink-200/80 bg-ink-50/70 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                  >
                    {partner.role === 'provider' ? (
                      <Store className="h-3.5 w-3.5 text-clay-600" />
                    ) : (
                      <Shield className="h-3.5 w-3.5 text-forest-600" />
                    )}
                    <span>{partner.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth status in mobile menu */}
            <div className="mt-3 pt-3 border-t border-ink-100 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-3 py-1 text-xs font-semibold text-ink-500">
                    Signed in as {profile?.full_name ?? user.email}
                  </div>
                  <Button asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to={getDashboardPathForRole(role)}>Go to Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild onClick={() => setMobileMenuOpen(false)}>
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
