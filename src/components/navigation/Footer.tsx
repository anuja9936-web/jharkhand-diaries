import { Link } from 'react-router-dom';
import { publicNavItems } from '../../config/navigation';
import { siteConfig } from '../../config/site';

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-ink-900">{siteConfig.name}</p>
          <p className="text-sm leading-6 text-ink-600">
            A production-minded foundation for Jharkhand cultural and eco-tourism, built for Team Respawn.
          </p>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-clay-700">Navigation</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {publicNavItems.map((item) => (
              <Link key={item.href} to={item.href} className="text-sm text-ink-600 hover:text-ink-900">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-clay-700">Project note</p>
          <p className="text-sm leading-6 text-ink-600">
            This skeleton is intentionally non-affiliated and does not claim official government status.
          </p>
        </div>
      </div>
    </footer>
  );
}

