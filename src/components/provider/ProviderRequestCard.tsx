import { Badge, Card } from '../ui';
import { getProviderOfferingKindLabel } from '../../constants/provider';
import type { ProviderRequestWithOffering } from '../../services/provider/providerMarketplaceService';

function renderRequestStatus(status: string) {
  if (status === 'accepted') {
    return 'success';
  }

  if (status === 'rejected' || status === 'cancelled') {
    return 'neutral';
  }

  if (status === 'completed') {
    return 'accent';
  }

  return 'warning';
}

function formatDate(value: string | null) {
  if (!value) {
    return 'No date set';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ProviderRequestCard({ request }: { request: ProviderRequestWithOffering }) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">
            {getProviderOfferingKindLabel(request.offering?.kind ?? request.request_type)}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-ink-900">{request.tourist_name}</h3>
          <p className="text-sm text-ink-600">{request.offering?.name ?? 'General provider request'}</p>
        </div>
        <Badge variant={renderRequestStatus(request.status)}>{request.status}</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-sand px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Requested date</p>
          <p className="mt-1 text-sm font-medium text-ink-900">{formatDate(request.preferred_date)}</p>
        </div>
        <div className="rounded-2xl bg-sand px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Duration</p>
          <p className="mt-1 text-sm font-medium text-ink-900">{request.duration ?? 'Not specified'}</p>
        </div>
        <div className="rounded-2xl bg-sand px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Participants</p>
          <p className="mt-1 text-sm font-medium text-ink-900">{request.participants}</p>
        </div>
        <div className="rounded-2xl bg-sand px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Contact</p>
          <p className="mt-1 text-sm font-medium text-ink-900">{request.tourist_email ?? 'Not shared'}</p>
        </div>
      </div>

      {request.message ? <p className="text-sm leading-6 text-ink-700">{request.message}</p> : null}
    </Card>
  );
}
