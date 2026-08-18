import { ClerkLoaded, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Menu, Sparkles } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { publicNavItems } from '../../config/navigation';
import { siteConfig } from '../../config/site';
import { Button, Badge } from '../ui';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-900 text-white shadow-lg shadow-ink-900/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">{siteConfig.name}</p>
            <p className="text-sm font-semibold text-ink-900">{siteConfig.platformName}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-sand text-ink-900' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Badge className="hidden md:inline-flex" variant="accent">
            Team Respawn
          </Badge>
          <ClerkLoaded>
            <SignedOut>
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="secondary" asChild>
                  <Link to="/sign-in">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/sign-up">Sign up</Link>
                </Button>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </ClerkLoaded>
          <Button variant="ghost" className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
