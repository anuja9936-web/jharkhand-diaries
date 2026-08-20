import { useEffect, useMemo, useState } from 'react';
import { Mail, Calendar, User, Package, Check, X, Search } from 'lucide-react';
import { Badge, Button, Card, Input } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import {
  getMyProviderRequests,
  updateProviderRequestStatus,
  type ProviderRequestWithOffering,
} from '../../services/provider/providerMarketplaceService';
import type { ProviderRequestStatus } from '../../types/provider';

export function ProviderEnquiriesPage() {
  const [requests, setRequests] = useState<ProviderRequestWithOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProviderRequestStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProviderRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleStatusChange = async (requestId: string, newStatus: ProviderRequestStatus) => {
    try {
      setUpdatingId(requestId);
      await updateProviderRequestStatus(requestId, newStatus);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        r.tourist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.tourist_email && r.tourist_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.message && r.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.offering?.name && r.offering.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  if (loading) {
    return <LoadingState label="Loading messages and enquiries..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load enquiries" message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communication Hub"
        title="Messages & Enquiries"
        description="Direct tourist enquiries, custom craft orders, booking requests, and learning inquiries."
      />

      {/* Filters and search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search by tourist name, email or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-clay-700 text-white shadow-sm'
                  : 'bg-white text-ink-700 border border-ink-200 hover:bg-sand'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title={requests.length === 0 ? 'No enquiries yet' : 'No enquiries match the filter'}
          message={
            requests.length === 0
              ? 'When travellers explore your offerings and send inquiries or booking requests, they will appear here.'
              : 'Try changing your status filter or search query.'
          }
          actionLabel="Refresh Enquiries"
          actionHref="/provider/enquiries"
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <Card key={req.id} className="p-5 sm:p-6 transition-all hover:shadow-sm border border-ink-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-bold text-ink-900 text-base">
                      {req.tourist_name}
                    </span>
                    <Badge variant="accent">{req.request_type.toUpperCase()}</Badge>
                    <Badge
                      variant={
                        req.status === 'accepted'
                          ? 'success'
                          : req.status === 'rejected'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {req.status.toUpperCase()}
                    </Badge>
                  </div>

                  {req.offering && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-clay-700">
                      <Package className="h-3.5 w-3.5" />
                      Re: {req.offering.name} ({req.offering.kind})
                    </p>
                  )}

                  {req.message && (
                    <p className="rounded-xl bg-sand/60 p-3 text-sm text-ink-800 leading-relaxed italic">
                      "{req.message}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-500 pt-1">
                    {req.tourist_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {req.tourist_email}
                      </span>
                    )}
                    {req.preferred_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Preferred Date: {req.preferred_date}
                      </span>
                    )}
                    {req.participants > 1 && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {req.participants} participants / qty
                      </span>
                    )}
                    <span>
                      Received: {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {req.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(req.id, 'accepted')}
                        disabled={updatingId === req.id}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(req.id, 'rejected')}
                        disabled={updatingId === req.id}
                        className="text-red-700 hover:bg-red-50"
                      >
                        <X className="mr-1 h-3.5 w-3.5" />
                        Decline
                      </Button>
                    </>
                  )}
                  {req.status === 'accepted' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange(req.id, 'completed')}
                      disabled={updatingId === req.id}
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
