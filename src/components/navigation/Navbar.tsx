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

  // Listen to scroll position for smooth transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
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
          ? 'bg-ink-950/80 backdrop-blur-xl border-b border-white/15 text-white shadow-md'
          : 'bg-ink-900/95 backdrop-blur-2xl border-b border-ink-800 text-white shadow-xl',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-full ring-2 ring-amber-400/40 bg-white/20 p-0.5 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:ring-amber-300">
            <img
              src="/images/jharkhand-logo.png"
              alt="Jharkhand Tourism Emblem"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
              Jharkhand Tourism
            </p>
            <p className="text-sm sm:text-base font-bold font-display tracking-tight text-white">
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
                  'rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-amber-400 text-ink-950 font-bold shadow-md scale-105'
                    : 'text-sand/90 hover:text-white hover:bg-white/15',
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
          <div className="hidden md:flex items-center gap-2 border-r border-white/20 pr-3">
            {partnerNavItems.map((partner) => (
              <Link
                key={partner.href}
                to={partner.href}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-white/20 bg-white/10 text-amber-200/90 hover:text-white hover:bg-white/20 hover:border-amber-400/50 transition-all duration-200"
                title={`Access ${partner.label} portal`}
              >
                {partner.role === 'provider' ? (
                  <Store className="h-3.5 w-3.5 text-amber-300 opacity-90" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-forest-300 opacity-90" />
                )}
                <span>{partner.label}</span>
              </Link>
            ))}
          </div>

          {/* User Auth or Sign-in */}
          {loading ? (
            <span className="text-xs animate-pulse font-medium text-sand/70">
              Loading...
            </span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="accent"
                className="hidden xl:inline-flex text-xs py-0.5 bg-amber-400/20 text-amber-200 border border-amber-400/30"
              >
                {profile?.full_name ?? user.email?.split('@')[0] ?? role}
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="bg-white/15 text-white border-white/30 hover:bg-white/25"
              >
                <Link to={getDashboardPathForRole(role)}>Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sand/80 hover:text-white hover:bg-white/15"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400 hover:text-ink-950 shadow-xs transition-all duration-200"
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
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-black/40 text-white hover:bg-white/20 transition lg:hidden focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/15 bg-ink-950/98 backdrop-blur-2xl px-4 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl text-white">
          <div className="flex flex-col gap-1.5">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
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
                      ? 'bg-amber-400 text-ink-950 font-bold shadow-md'
                      : 'text-sand/90 hover:bg-white/15 hover:text-white',
                  ].join(' ')
                }
              >
                <item.icon className="h-4 w-4 opacity-80" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Partner Links Section in Mobile Drawer */}
            <div className="mt-3 pt-3 border-t border-white/15">
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400/80">
                Partner Portals
              </p>
              <div className="grid grid-cols-2 gap-2">
                {partnerNavItems.map((partner) => (
                  <Link
                    key={partner.href}
                    to={partner.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-white/15 hover:text-white transition-colors"
                  >
                    {partner.role === 'provider' ? (
                      <Store className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Shield className="h-3.5 w-3.5 text-forest-400" />
                    )}
                    <span>{partner.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth status in mobile menu */}
            <div className="mt-3 pt-3 border-t border-white/15 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-3 py-1 text-xs font-semibold text-sand/70">
                    Signed in as {profile?.full_name ?? user.email}
                  </div>
                  <Button asChild onClick={() => setMobileMenuOpen(false)} className="bg-amber-400 text-ink-950 hover:bg-amber-300">
                    <Link to={getDashboardPathForRole(role)}>Go to Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/15">
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild onClick={() => setMobileMenuOpen(false)} className="bg-amber-400 text-ink-950 hover:bg-amber-300">
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
