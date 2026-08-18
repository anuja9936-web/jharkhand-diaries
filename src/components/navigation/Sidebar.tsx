import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { roleNavMap } from '../../config/navigation';
import { ROLE_LABELS } from '../../constants/roles';
import type { UserRole } from '../../types/common';
import { Badge } from '../ui';

export function Sidebar({ role }: { role: UserRole }) {
  const links = roleNavMap[role];

  return (
    <aside className="hidden h-full w-72 shrink-0 border-r border-ink-200 bg-white/85 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col gap-6 p-5">
        <div className="rounded-3xl bg-ink-900 p-5 text-white shadow-glow">
          <Badge className="mb-3 bg-white/10 text-white" variant="neutral">
            {ROLE_LABELS[role]}
          </Badge>
          <h2 className="text-2xl font-semibold">Role workspace</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">
            This is a role-aware skeleton. Real authorization will be synchronized from Supabase later.
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === `/${role}`}
              className={({ isActive }) =>
                [
                  'group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive ? 'bg-sand text-ink-900' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                ].join(' ')
              }
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

