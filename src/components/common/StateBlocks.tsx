import type { ComponentType, ReactNode } from 'react';
import { AlertTriangle, ArrowRight, Loader2, ShieldAlert, Sparkles, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../ui';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay-700">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">{title}</h1>
        {description ? <p className="max-w-3xl text-sm leading-6 text-ink-600 md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon = Workflow,
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-clay-400 via-forest-400 to-ink-900" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{value}</p>
          {detail ? <p className="mt-2 text-sm text-ink-600">{detail}</p> : null}
        </div>
        <div className="rounded-2xl bg-sand p-3 text-ink-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function LoadingState({ label = 'Loading the experience...' }: { label?: string }) {
  return (
    <Card className="flex items-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin text-clay-700" />
      <p className="text-sm text-ink-600">{label}</p>
    </Card>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this section right now. Please try again shortly.',
}: {
  title?: string;
  message?: string;
}) {
  return (
    <Card className="border-red-200 bg-red-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
        <div className="space-y-2">
          <h2 className="font-semibold text-red-950">{title}</h2>
          <p className="text-sm text-red-800">{message}</p>
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Card className="flex flex-col gap-4 border-dashed border-ink-300 bg-white/70 text-center">
      <div className="mx-auto rounded-full bg-sand p-4 text-ink-700">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
        <p className="text-sm text-ink-600">{message}</p>
      </div>
      {actionHref && actionLabel ? (
        <div className="pt-1">
          <Button asChild variant="secondary">
            <Link to={actionHref} className="inline-flex items-center gap-2">
              {actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export function UnauthorizedState() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-700" />
        <div className="space-y-3">
          <div>
            <h2 className="font-semibold text-ink-900">Access restricted</h2>
            <p className="text-sm text-ink-600">
              This area is available only to the correct account role. If this looks wrong, your profile role
              needs to be synced from the backend later.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link to="/">Return home</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function NotFoundState() {
  return (
    <Card className="border-ink-200 bg-white/85 text-center">
      <div className="mx-auto w-fit rounded-full bg-sand p-4 text-ink-700">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-ink-900">Page not found</h2>
      <p className="mt-2 text-sm text-ink-600">
        The route you opened does not exist in this skeleton yet.
      </p>
      <div className="mt-5">
        <Button asChild variant="secondary">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </Card>
  );
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  bullets = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Card className="pattern-surface space-y-4">
        <div className="inline-flex rounded-full bg-clay-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-clay-800">
          Skeleton preview
        </div>
        <p className="max-w-3xl text-sm leading-6 text-ink-700">
          This page is intentionally lightweight for now. We are establishing the structure, route protection,
          and design language before feature work begins.
        </p>
        {bullets.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {bullets.map((bullet) => (
              <div key={bullet} className="rounded-2xl border border-ink-200 bg-white/80 p-4 text-sm text-ink-700">
                {bullet}
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
