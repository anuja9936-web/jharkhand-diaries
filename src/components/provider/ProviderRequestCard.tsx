import { useState } from 'react';
import {
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  MessageSquare,
  Package,
  Send,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react';
import { Badge, Button, Card, Textarea } from '../ui';
import { getProviderOfferingKindLabel } from '../../constants/provider';
import { formatIndianCurrency } from '../../lib/utils';
import type { ProviderRequestWithOffering } from '../../services/provider/providerMarketplaceService';
import type { ProviderOfferingKind, ProviderRequestStatus } from '../../types/provider';

function renderRequestStatus(status: string) {
  if (status === 'accepted') return 'success';
  if (status === 'rejected' || status === 'cancelled') return 'neutral';
  if (status === 'completed') return 'accent';
  return 'warning';
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Flexible';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ProviderRequestCard({
  request,
  onStatusChange,
  isUpdating,
}: {
  request: ProviderRequestWithOffering;
  onStatusChange?: (requestId: string, status: ProviderRequestStatus, responseMsg?: string) => Promise<void>;
  isUpdating?: boolean;
}) {
  const [showResponseBox, setShowResponseBox] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ProviderRequestStatus | null>(null);
  const [responseMessage, setResponseMessage] = useState(request.provider_response || '');

  const handleOpenAction = (status: ProviderRequestStatus) => {
    setTargetStatus(status);
    if (status === 'accepted' && !responseMessage) {
      setResponseMessage('We are pleased to accept your request. We look forward to hosting/serving you.');
    } else if (status === 'rejected' && !responseMessage) {
      setResponseMessage('Unfortunately, we are fully booked/unavailable for these requested dates.');
    } else if (status === 'completed' && !responseMessage) {
      setResponseMessage('Thank you for choosing our service! We hope you enjoyed your Jharkhand experience.');
    }
    setShowResponseBox(true);
  };

  const handleConfirmAction = async () => {
    if (!targetStatus || !onStatusChange) return;
    await onStatusChange(request.id, targetStatus, responseMessage);
    setShowResponseBox(false);
    setTargetStatus(null);
  };

  const kind = request.offering_kind || (request.offering?.kind as ProviderOfferingKind);
  const details = (request.details || {}) as Record<string, string>;

  return (
    <Card className="bg-[#FFFDF9] border border-ink-200 shadow-sm hover:border-clay-300 transition-all p-5 sm:p-6 space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-ink-200/70 pb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-sand p-2 flex items-center justify-center shrink-0">
            {kind === 'stay' ? (
              <Building2 className="h-5 w-5 text-amber-600" />
            ) : kind === 'tour' ? (
              <Compass className="h-5 w-5 text-emerald-600" />
            ) : kind === 'transport' ? (
              <Car className="h-5 w-5 text-blue-600" />
            ) : kind === 'product' ? (
              <Package className="h-5 w-5 text-clay-600" />
            ) : (
              <Sparkles className="h-5 w-5 text-purple-600" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-clay-700">
                {getProviderOfferingKindLabel(kind || request.request_type)}
              </span>
              <Badge variant={renderRequestStatus(request.status)}>{request.status}</Badge>
            </div>
            <h3 className="font-display font-bold text-base text-ink-950 mt-0.5">
              {request.offering?.name || (request.offering_kind ? `${request.offering_kind.charAt(0).toUpperCase() + request.offering_kind.slice(1)} Request` : 'Tourism Request')}
            </h3>
            <p className="text-xs text-ink-600 flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-forest-700" />
              <span><strong>Tourist:</strong> {request.tourist_name}</span>
              {request.tourist_email && <span>({request.tourist_email})</span>}
            </p>
          </div>
        </div>

        {request.estimated_amount ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-right self-start sm:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
              Estimated Total
            </span>
            <span className="font-bold text-sm text-ink-950">
              {formatIndianCurrency(request.estimated_amount)}
            </span>
          </div>
        ) : null}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl bg-sand/40 p-3 border border-ink-200/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Requested Dates</span>
          </span>
          <p className="font-bold text-ink-900">
            {formatDate(request.start_date || request.preferred_date)}
            {request.end_date ? ` – ${formatDate(request.end_date)}` : ''}
            {request.duration ? ` (${request.duration})` : ''}
          </p>
        </div>

        <div className="rounded-xl bg-sand/40 p-3 border border-ink-200/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Quantity / Travellers</span>
          </span>
          <p className="font-bold text-ink-900">
            {request.number_of_people || request.participants || 1} people / units
          </p>
        </div>

        <div className="rounded-xl bg-sand/40 p-3 border border-ink-200/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Received On</span>
          </span>
          <p className="font-bold text-ink-900">
            {new Date(request.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Category Specific Routing/Address Details */}
      {(details.pickupLocation || details.dropDestination || details.deliveryAddress) && (
        <div className="rounded-xl bg-blue-50/60 p-3 border border-blue-200 text-xs space-y-1 text-blue-950">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
            Location & Logistics Details
          </span>
          {details.pickupLocation && (
            <p><strong>Pickup:</strong> {details.pickupLocation}</p>
          )}
          {details.dropDestination && (
            <p><strong>Destination:</strong> {details.dropDestination}</p>
          )}
          {details.deliveryAddress && (
            <p><strong>Delivery/Pickup:</strong> {details.deliveryAddress}</p>
          )}
        </div>
      )}

      {/* Tourist Inquiry Message */}
      {request.message && (
        <div className="text-xs bg-white p-3.5 rounded-2xl border border-ink-200/70 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-clay-600" />
            <span>Tourist Inquiry / Message:</span>
          </span>
          <p className="text-ink-700 leading-relaxed">{request.message}</p>
        </div>
      )}

      {/* Existing Provider Response */}
      {request.provider_response && !showResponseBox && (
        <div className="text-xs bg-amber-50/70 p-3.5 rounded-2xl border border-amber-300 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Your Response to Tourist:</span>
          </span>
          <p className="text-ink-900 font-medium leading-relaxed">{request.provider_response}</p>
        </div>
      )}

      {/* Response / Action Panel */}
      {showResponseBox ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-ink-950 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Update Status to: <strong className="uppercase text-forest-900">{targetStatus}</strong></span>
            </span>
            <button
              type="button"
              onClick={() => setShowResponseBox(false)}
              className="text-xs text-ink-500 hover:text-ink-900 underline"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-700 uppercase tracking-wider mb-1">
              Add Message / Instructions for Tourist
            </label>
            <Textarea
              rows={2}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="e.g. Booking confirmed! We have reserved your room. Contact +91 9876543210 for check-in assistance."
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowResponseBox(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isUpdating}
              onClick={handleConfirmAction}
              className="bg-forest-900 text-white hover:bg-forest-800 font-bold text-xs"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              <span>{isUpdating ? 'Saving...' : `Confirm & Send to Tourist`}</span>
            </Button>
          </div>
        </div>
      ) : onStatusChange ? (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-200/60">
          <span className="text-[11px] text-ink-500 italic">
            Manage reservation status and send instructions to customer
          </span>

          <div className="flex flex-wrap gap-1.5">
            {request.status !== 'accepted' && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isUpdating}
                onClick={() => handleOpenAction('accepted')}
                className="text-xs font-bold bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-700" />
                <span>Accept</span>
              </Button>
            )}

            {request.status !== 'rejected' && request.status !== 'completed' && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isUpdating}
                onClick={() => handleOpenAction('rejected')}
                className="text-xs font-bold bg-red-50 text-red-900 border-red-200 hover:bg-red-100"
              >
                <XCircle className="h-3.5 w-3.5 mr-1 text-red-700" />
                <span>Reject</span>
              </Button>
            )}

            {request.status === 'accepted' && (
              <Button
                type="button"
                size="sm"
                disabled={isUpdating}
                onClick={() => handleOpenAction('completed')}
                className="text-xs font-bold bg-forest-900 text-white hover:bg-forest-800"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-amber-400" />
                <span>Mark Completed</span>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isUpdating}
              onClick={() => handleOpenAction(request.status)}
              className="text-xs font-semibold"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              <span>Send Note</span>
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
