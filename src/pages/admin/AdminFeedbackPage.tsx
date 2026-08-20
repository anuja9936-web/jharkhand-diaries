import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Search,
  X,
} from 'lucide-react';
import { Badge, Button, Card, Input, Select, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_CONFIG } from '../../constants/admin';
import { getAdminFeedback, updateFeedbackStatus } from '../../services/admin/adminGovernanceService';
import type { FeedbackStatus, TourismFeedback } from '../../types/admin';

export function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<TourismFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Resolution Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<TourismFeedback | null>(null);
  const [targetStatus, setTargetStatus] = useState<FeedbackStatus>('resolved');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminFeedback({
        status: statusFilter,
        search: searchTerm,
      });
      setFeedbackList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load feedback submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFeedback();
  }, [statusFilter]);

  const handleOpenResolution = (fb: TourismFeedback, status: FeedbackStatus) => {
    setSelectedFeedback(fb);
    setTargetStatus(status);
    setResolutionSummary(fb.resolution_summary || '');
    setAdminNotes(fb.admin_notes || '');
  };

  const handleSaveResolution = async () => {
    if (!selectedFeedback) return;
    try {
      setUpdating(true);
      await updateFeedbackStatus(selectedFeedback.id, targetStatus, {
        resolutionSummary: resolutionSummary.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
      });

      setSelectedFeedback(null);
      void loadFeedback();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to update feedback status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Grievances & Moderation"
        title="Tourist Feedback & Complaint Desk"
        description="Review traveler reviews, destination infrastructure reports, and service operator complaints submitted by visitors across Jharkhand."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search feedback by reporter, subject, or message..."
              className="pl-10 text-xs"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-auto text-xs min-w-[150px]"
          >
            <option value="all">All Feedback Statuses</option>
            <option value="new">New Submissions</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed / Rejected</option>
          </Select>
        </div>
      </Card>

      {/* Feedback List */}
      {loading ? (
        <LoadingState label="Loading feedback records..." />
      ) : error ? (
        <ErrorState title="Error loading feedback" message={error} />
      ) : feedbackList.length === 0 ? (
        <EmptyState
          title="No feedback records found"
          message="There are currently no grievances or traveler reviews matching the selected filter."
        />
      ) : (
        <div className="grid gap-4">
          {feedbackList.map((item) => {
            const statusConfig = FEEDBACK_STATUS_CONFIG[item.status] || FEEDBACK_STATUS_CONFIG.new;
            const categoryLabel = FEEDBACK_CATEGORY_LABELS[item.category] || item.category;

            return (
              <Card key={item.id} className="p-5 space-y-3 transition-all hover:border-clay-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-clay-800">
                      {categoryLabel}
                    </span>

                    <Badge variant={statusConfig.badgeVariant} className="text-[10px]">
                      {statusConfig.label}
                    </Badge>

                    {item.district && (
                      <span className="inline-flex items-center gap-1 text-xs text-ink-600">
                        <MapPin className="h-3 w-3 text-clay-700" />
                        {item.district}
                      </span>
                    )}

                    {item.destination_name && (
                      <span className="text-xs text-ink-600 bg-sand/60 px-2 py-0.5 rounded-md">
                        {item.destination_name}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-ink-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold text-ink-900">{item.subject}</h3>
                  <p className="text-xs leading-relaxed text-ink-700">{item.message}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-ink-500">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-ink-800">By: {item.reporter_name}</span>
                    {item.reporter_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-ink-400" /> {item.reporter_email}
                      </span>
                    )}
                    {item.reporter_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-ink-400" /> {item.reporter_phone}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== 'resolved' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenResolution(item, 'resolved')}
                        className="text-xs h-7 px-2.5 font-semibold text-emerald-800"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Mark Resolved
                      </Button>
                    )}

                    {item.status === 'new' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenResolution(item, 'under_review')}
                        className="text-xs h-7 px-2.5 text-amber-800 hover:bg-amber-50"
                      >
                        <Clock className="mr-1 h-3 w-3" /> Review
                      </Button>
                    )}

                    {item.status !== 'closed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenResolution(item, 'closed')}
                        className="text-xs h-7 px-2 text-ink-500 hover:bg-red-50 hover:text-red-700"
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>

                {/* Resolution Summary or Admin Notes Banner */}
                {(item.resolution_summary || item.admin_notes) && (
                  <div className="rounded-xl border border-ink-100 bg-[#FAF8F5] p-3 text-xs space-y-1 mt-2">
                    {item.resolution_summary && (
                      <p className="text-emerald-900 font-medium">
                        <strong>Resolution:</strong> {item.resolution_summary}
                      </p>
                    )}
                    {item.admin_notes && (
                      <p className="text-ink-600">
                        <strong>Internal Note:</strong> {item.admin_notes}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolution & Status Update Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <h3 className="font-display text-lg font-bold text-ink-900">
                Update Grievance Status
              </h3>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-sand"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-sand/40 p-3">
                <p className="font-bold text-ink-900">{selectedFeedback.subject}</p>
                <p className="text-ink-600 line-clamp-2 mt-0.5">{selectedFeedback.message}</p>
              </div>

              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Status Decision</span>
                <Select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as FeedbackStatus)}
                >
                  <option value="resolved">Resolved</option>
                  <option value="under_review">Under Review / Investigation</option>
                  <option value="closed">Closed / Dismissed</option>
                </Select>
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Resolution Summary (Tourist/Public Note)</span>
                <Textarea
                  rows={2}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="e.g. Issue inspected by local ranger and repaired."
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Internal Administration Note</span>
                <Textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Forwarded to Latehar Tourism Development Officer."
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedFeedback(null)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveResolution} disabled={updating} className="font-bold">
                  {updating ? 'Saving...' : 'Save Decision'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
