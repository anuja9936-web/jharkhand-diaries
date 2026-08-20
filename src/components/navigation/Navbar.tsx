import { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Menu,
  Shield,
  ShoppingBag,
  Store,
  User as UserIcon,
  X,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { partnerNavItems, publicNavGroups } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPathForRole } from '../../lib/auth';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Badge, Button } from '../ui';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role, loading, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  // Subtle elevation on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Click outside to close open dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMouseEnter = (groupId: string) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(groupId);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  const toggleDropdown = (groupId: string) => {
    setOpenDropdown((prev) => (prev === groupId ? null : groupId));
  };

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  const isGroupActive = (groupId: string) => {
    const group = publicNavGroups.find((g) => g.id === groupId);
    if (!group) return false;
    return group.items.some(
      (item) =>
        location.pathname === item.href ||
        (item.href !== '/' && location.pathname.startsWith(item.href))
    );
  };

  return (
    <header
      ref={navRef}
      className={[
        'sticky top-0 z-50 w-full transition-all duration-200',
        'bg-[rgba(247,243,234,0.95)] backdrop-blur-xl border-b border-ink-200/70 text-ink-900',
        isScrolled ? 'shadow-[0_4px_24px_-8px_rgba(39,52,44,0.12)]' : '',
      ].join(' ')}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        {/* 1. Left: Brand Identity (Logo & Title) */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0 select-none">
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full ring-2 ring-clay-400/40 bg-sand/60 p-0.5 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:ring-clay-500 shrink-0">
            <img
              src="/images/jharkhand-logo.png"
              alt="Jharkhand Tourism Emblem"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="shrink-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.24em] text-clay-700 leading-none">
              Jharkhand Tourism
            </p>
            <p className="text-sm sm:text-base font-bold font-display tracking-tight text-ink-950 leading-tight">
              Jharkhand Diaries
            </p>
          </div>
        </Link>

        {/* 2. Center: Desktop Structured Navigation (Grouped with Dropdowns) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {/* Home Link */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              [
                'rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-forest-900 text-white font-bold shadow-xs'
                  : 'text-ink-700 hover:text-ink-950 hover:bg-sand/70',
              ].join(' ')
            }
          >
            Home
          </NavLink>

          {/* Group 1: Explore Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('explore')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('explore')}
              className={[
                'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-150 whitespace-nowrap',
                isGroupActive('explore') || openDropdown === 'explore'
                  ? 'bg-forest-900 text-white font-bold shadow-xs'
                  : 'text-ink-700 hover:text-ink-950 hover:bg-sand/70',
              ].join(' ') }
              aria-expanded={openDropdown === 'explore'}
            >
              <span>Explore</span>
              <ChevronDown
                className={[
                  'h-3.5 w-3.5 transition-transform duration-200',
                  openDropdown === 'explore' ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            {/* Dropdown Menu */}
            {openDropdown === 'explore' && (
              <div className="absolute left-0 top-full pt-1.5 z-50 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-150">
                <div className="rounded-2xl border border-ink-200/90 bg-[#FFFDF9] p-2.5 shadow-xl backdrop-blur-xl ring-1 ring-black/5">
                  <div className="space-y-1">
                    {publicNavGroups
                      .find((g) => g.id === 'explore')
                      ?.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-sand/60 hover:shadow-xs"
                        >
                          <div className="rounded-lg bg-sand p-2 text-clay-700 transition-colors group-hover:bg-clay-700 group-hover:text-white shrink-0 mt-0.5">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-ink-900 group-hover:text-clay-800">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-ink-500 line-clamp-1 leading-snug">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group 2: Stays & Travel Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('travel-stays')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('travel-stays')}
              className={[
                'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-150 whitespace-nowrap',
                isGroupActive('travel-stays') || openDropdown === 'travel-stays'
                  ? 'bg-forest-900 text-white font-bold shadow-xs'
                  : 'text-ink-700 hover:text-ink-950 hover:bg-sand/70',
              ].join(' ') }
              aria-expanded={openDropdown === 'travel-stays'}
            >
              <span>Stays &amp; Travel</span>
              <ChevronDown
                className={[
                  'h-3.5 w-3.5 transition-transform duration-200',
                  openDropdown === 'travel-stays' ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            {/* Dropdown Menu */}
            {openDropdown === 'travel-stays' && (
              <div className="absolute left-0 top-full pt-1.5 z-50 w-72 sm:w-84 animate-in fade-in zoom-in-95 duration-150">
                <div className="rounded-2xl border border-ink-200/90 bg-[#FFFDF9] p-2.5 shadow-xl backdrop-blur-xl ring-1 ring-black/5">
                  <div className="space-y-1">
                    {publicNavGroups
                      .find((g) => g.id === 'travel-stays')
                      ?.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-sand/60 hover:shadow-xs"
                        >
                          <div className="rounded-lg bg-sand p-2 text-forest-700 transition-colors group-hover:bg-forest-900 group-hover:text-white shrink-0 mt-0.5">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-ink-900 group-hover:text-forest-900">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-ink-500 line-clamp-1 leading-snug">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Marketplace Link (Direct) */}
          <NavLink
            to="/marketplace"
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-forest-900 text-white font-bold shadow-xs'
                  : 'text-ink-700 hover:text-ink-950 hover:bg-sand/70',
              ].join(' ')
            }
          >
            <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
            <span>Marketplace</span>
          </NavLink>

          {/* Group 3: Culture & Stories Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('culture-community')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('culture-community')}
              className={[
                'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-150 whitespace-nowrap',
                isGroupActive('culture-community') || openDropdown === 'culture-community'
                  ? 'bg-forest-900 text-white font-bold shadow-xs'
                  : 'text-ink-700 hover:text-ink-950 hover:bg-sand/70',
              ].join(' ') }
              aria-expanded={openDropdown === 'culture-community'}
            >
              <span>Culture &amp; Stories</span>
              <ChevronDown
                className={[
                  'h-3.5 w-3.5 transition-transform duration-200',
                  openDropdown === 'culture-community' ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            {/* Dropdown Menu */}
            {openDropdown === 'culture-community' && (
              <div className="absolute right-0 top-full pt-1.5 z-50 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-150">
                <div className="rounded-2xl border border-ink-200/90 bg-[#FFFDF9] p-2.5 shadow-xl backdrop-blur-xl ring-1 ring-black/5">
                  <div className="space-y-1">
                    {publicNavGroups
                      .find((g) => g.id === 'culture-community')
                      ?.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-sand/60 hover:shadow-xs"
                        >
                          <div className="rounded-lg bg-sand p-2 text-clay-700 transition-colors group-hover:bg-clay-700 group-hover:text-white shrink-0 mt-0.5">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-ink-900 group-hover:text-clay-800">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-ink-500 line-clamp-1 leading-snug">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* 3. Right: Language Switcher, Partner Access & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher className="hidden sm:inline-flex" />

          {/* Subtle Partner Access Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 border-r border-ink-200/80 pr-2.5">
            {partnerNavItems.map((partner) => (
              <Link
                key={partner.href}
                to={partner.href}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-ink-200/80 bg-[#FFFDF8] text-ink-700 hover:text-ink-950 hover:bg-sand hover:border-ink-300 transition-all duration-150 whitespace-nowrap"
                title={`Access ${partner.label}`}
              >
                {partner.role === 'provider' ? (
                  <Store className="h-3.5 w-3.5 text-clay-600 shrink-0" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-forest-700 shrink-0" />
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
                className="hidden xl:inline-flex text-xs py-0.5 max-w-[140px] truncate bg-forest-100/90 text-forest-900 border border-forest-300 font-semibold"
              >
                {profile?.full_name ?? user.email?.split('@')[0] ?? role}
              </Badge>
              <Button
                variant="primary"
                size="sm"
                asChild
                className="bg-forest-900 text-white hover:bg-forest-800 text-xs font-bold whitespace-nowrap"
              >
                <Link to={getDashboardPathForRole(role)}>Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-ink-700 hover:text-ink-950 hover:bg-sand/70 whitespace-nowrap"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold bg-clay-700 text-white hover:bg-clay-800 shadow-xs transition-all duration-150 whitespace-nowrap"
              >
                <UserIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-ink-200 bg-sand/60 text-ink-800 hover:bg-sand hover:text-ink-950 transition lg:hidden focus:outline-none shrink-0"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-ink-200/80 bg-[#F7F3EA] px-4 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl text-ink-900 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Language Switcher in Mobile Drawer */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/70 rounded-2xl border border-ink-200/80">
              <span className="text-xs font-bold text-ink-700">Language / भाषा</span>
              <LanguageSwitcher />
            </div>

            {/* Home Direct Link */}
            <NavLink
              to="/"
              end
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
              <span>Home</span>
            </NavLink>

            {/* Group Sections */}
            {publicNavGroups.map((group) => (
              <div key={group.id} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-clay-700">
                  {group.label}
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                          isActive
                            ? 'bg-forest-900 text-white font-bold'
                            : 'text-ink-700 hover:bg-[#EFE9D8] hover:text-ink-900',
                        ].join(' ')
                      }
                    >
                      <item.icon className="h-4 w-4 opacity-75 shrink-0" />
                      <div className="min-w-0">
                        <div>{item.label}</div>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}

            {/* Marketplace Direct Link */}
            <NavLink
              to="/marketplace"
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
              <ShoppingBag className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Indigenous Marketplace</span>
            </NavLink>

            {/* Partner Links Section */}
            <div className="pt-2 border-t border-ink-200">
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
                      <Store className="h-3.5 w-3.5 text-clay-700 shrink-0" />
                    ) : (
                      <Shield className="h-3.5 w-3.5 text-forest-700 shrink-0" />
                    )}
                    <span>{partner.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Auth status in mobile menu */}
            <div className="pt-2 border-t border-ink-200 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-3 py-1 text-xs font-semibold text-ink-600 truncate">
                    Signed in as {profile?.full_name ?? user.email}
                  </div>
                  <Button
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-forest-900 text-white hover:bg-forest-800 font-bold"
                  >
                    <Link to={getDashboardPathForRole(role)}>Go to Dashboard</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-ink-700 hover:bg-sand/70 text-xs"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-clay-700 text-white hover:bg-clay-800 font-bold text-xs"
                >
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
