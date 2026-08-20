import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input, Select, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { JHARKHAND_DISTRICTS } from '../../constants/destinations';
import { PROVIDER_CAPABILITIES, VERIFICATION_STATUS_LABELS, getProviderCategoryLabel } from '../../constants/provider';
import { getAdminProviders, updateProviderVerification } from '../../services/admin/adminGovernanceService';
import type { AdminProviderItem } from '../../types/admin';
import type { ProviderCapability, ProviderVerificationStatus } from '../../types/provider';

export function AdminProvidersPage() {
  const [providers, setProviders] = useState<AdminProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<ProviderVerificationStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ProviderCapability | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Active Review Modal state
  const [selectedProvider, setSelectedProvider] = useState<AdminProviderItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_changes' | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminProviders({
        verificationStatus: statusFilter,
        category: categoryFilter,
        district: districtFilter,
        search: searchTerm,
      });
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load service providers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProviders();
  }, [statusFilter, categoryFilter, districtFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadProviders();
  };

  const handleVerificationAction = async () => {
    if (!selectedProvider || !actionType) return;

    if (actionType === 'reject' && !reasonInput.trim()) {
      alert('Please provide a reason for rejecting the verification.');
      return;
    }

    if (actionType === 'request_changes' && !reasonInput.trim()) {
      alert('Please describe what information or document is required from the provider.');
      return;
    }

    try {
      setProcessing(true);
      const nextStatus: ProviderVerificationStatus =
        actionType === 'approve'
          ? 'verified'
          : actionType === 'reject'
            ? 'rejected'
            : 'under_review';

      await updateProviderVerification(selectedProvider.id, nextStatus, {
        rejectionReason: actionType === 'reject' ? reasonInput.trim() : undefined,
        adminNotes: actionType === 'request_changes' ? reasonInput.trim() : undefined,
      });

      setActionSuccess(`Provider status successfully updated to ${nextStatus}.`);
      setTimeout(() => {
        setActionSuccess(null);
        setActionType(null);
        setSelectedProvider(null);
        setReasonInput('');
        void loadProviders();
      }, 1000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update verification status.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Trust & Compliance"
        title="Provider Verification & Oversight"
        description="Review business credentials, identity proofs, and service capabilities to grant official Jharkhand Tourism verification."
      />

      {/* Filter and Search Toolbar */}
      <Card className="p-4 sm:p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by business name, provider, email, or district..."
              className="pl-10 text-xs"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-auto text-xs min-w-[150px]"
          >
            <option value="all">All Verification Statuses</option>
            <option value="under_review">Under Review (Pending)</option>
            <option value="verified">Verified Partners</option>
            <option value="unverified">Unverified</option>
            <option value="rejected">Rejected</option>
          </Select>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="w-auto text-xs min-w-[160px]"
          >
            <option value="all">All Service Categories</option>
            {PROVIDER_CAPABILITIES.map((cap) => (
              <option key={cap.id} value={cap.id}>
                {cap.label}
              </option>
            ))}
          </Select>

          <Select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-auto text-xs min-w-[140px]"
          >
            <option value="all">All Districts</option>
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>

          <Button type="submit" size="sm" variant="secondary" className="text-xs">
            Filter
          </Button>
        </form>
      </Card>

      {/* Providers Table / Cards List */}
      {loading ? (
        <LoadingState label="Loading service providers..." />
      ) : error ? (
        <ErrorState title="Error loading providers" message={error} />
      ) : providers.length === 0 ? (
        <EmptyState
          title="No providers found"
          message="No service providers matched the selected filters or search criteria."
          actionLabel="Clear Filters"
          actionHref="/admin/vendors"
        />
      ) : (
        <div className="grid gap-4">
          {providers.map((provider) => {
            const vConfig = VERIFICATION_STATUS_LABELS[provider.verification_status] || VERIFICATION_STATUS_LABELS.unverified;
            return (
              <Card
                key={provider.id}
                className="p-5 transition-all hover:border-clay-300 hover:shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Provider Info */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-ink-900">
                        {provider.business_name || provider.full_name || 'Unnamed Provider'}
                      </h3>

                      {/* Verification Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          provider.verification_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : provider.verification_status === 'under_review'
                              ? 'bg-amber-100 text-amber-800'
                              : provider.verification_status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-sand text-ink-700'
                        }`}
                      >
                        {provider.verification_status === 'verified' && <ShieldCheck className="h-3 w-3" />}
                        {provider.verification_status === 'under_review' && <Clock className="h-3 w-3" />}
                        {provider.verification_status === 'rejected' && <ShieldAlert className="h-3 w-3" />}
                        {vConfig.label}
                      </span>

                      {provider.district && (
                        <Badge variant="neutral" className="text-[11px]">
                          <MapPin className="mr-1 h-3 w-3" />
                          {provider.district}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-600">
                      {provider.owner_name && <span>Contact: <strong>{provider.owner_name}</strong></span>}
                      {provider.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-ink-400" />
                          {provider.email}
                        </span>
                      )}
                      {provider.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-ink-400" />
                          {provider.phone}
                        </span>
                      )}
                    </div>

                    {/* Capability Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-ink-400 mr-1">Services:</span>
                      {provider.provider_categories.length > 0 ? (
                        provider.provider_categories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center rounded-lg bg-sand/80 px-2 py-0.5 text-[11px] font-medium text-clay-800"
                          >
                            {getProviderCategoryLabel(cat)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-ink-400 italic">No services configured</span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Public Profile */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setActionType(null);
                        setReasonInput('');
                      }}
                      className="text-xs"
                    >
                      Review Credentials
                    </Button>

                    <Button asChild variant="secondary" size="sm" className="text-xs">
                      <Link to={`/providers/${provider.id}`} target="_blank">
                        <ExternalLink className="mr-1 h-3.5 w-3.5 text-clay-700" />
                        Storefront
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Provider Detail Verification Modal / Drawer */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-ink-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-clay-700">
                    Government Verification Review
                  </span>
                  <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-bold text-ink-800">
                    ID: {selectedProvider.id.slice(0, 8)}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-ink-900 mt-1">
                  {selectedProvider.business_name || selectedProvider.full_name || 'Provider Verification'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProvider(null);
                  setActionType(null);
                }}
                className="rounded-xl p-2 text-ink-400 hover:bg-sand hover:text-ink-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionSuccess && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 font-medium">
                <Check className="h-4 w-4 text-emerald-700" />
                {actionSuccess}
              </div>
            )}

            {/* Provider Detailed Summary Grid */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="space-y-1 rounded-2xl border border-ink-100 bg-[#FAF8F5] p-4">
                <span className="font-semibold uppercase tracking-wider text-ink-400 text-[10px]">
                  Business & Operator Name
                </span>
                <p className="font-bold text-sm text-ink-900">
                  {selectedProvider.business_name || 'Not provided'}
                </p>
                <p className="text-ink-600">Owner: {selectedProvider.owner_name || selectedProvider.full_name || '—'}</p>
              </div>

              <div className="space-y-1 rounded-2xl border border-ink-100 bg-[#FAF8F5] p-4">
                <span className="font-semibold uppercase tracking-wider text-ink-400 text-[10px]">
                  District & Location
                </span>
                <p className="font-bold text-sm text-ink-900">
                  {selectedProvider.district ? `${selectedProvider.district}, Jharkhand` : 'District not set'}
                </p>
                <p className="text-ink-600">{selectedProvider.address || 'Local business address'}</p>
              </div>

              <div className="space-y-1 rounded-2xl border border-ink-100 bg-[#FAF8F5] p-4">
                <span className="font-semibold uppercase tracking-wider text-ink-400 text-[10px]">
                  Contact Information
                </span>
                <p className="text-ink-900 font-medium">{selectedProvider.phone || 'No phone registered'}</p>
                <p className="text-ink-600">{selectedProvider.email || 'No email registered'}</p>
              </div>

              <div className="space-y-1 rounded-2xl border border-ink-100 bg-[#FAF8F5] p-4">
                <span className="font-semibold uppercase tracking-wider text-ink-400 text-[10px]">
                  Current Status & Date
                </span>
                <p className="font-bold text-ink-900 uppercase">
                  {selectedProvider.verification_status}
                </p>
                <p className="text-ink-500">
                  Registered: {new Date(selectedProvider.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Provider Capabilities */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                Authorized Service Capabilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProvider.provider_categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-clay-300 bg-[#FAF4ED] px-3 py-1.5 text-xs font-semibold text-clay-900"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-clay-700" />
                    {getProviderCategoryLabel(cat)}
                  </span>
                ))}
              </div>
            </div>

            {/* Submitted Verification Documents / Details */}
            <div className="space-y-2 rounded-2xl border border-ink-200 bg-sand/20 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                Submitted Verification Metadata
              </h4>
              {Object.keys(selectedProvider.verification_details).length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  {Object.entries(selectedProvider.verification_details).map(([key, val]) => (
                    <div key={key} className="flex items-start justify-between border-b border-ink-100/50 pb-1">
                      <span className="text-ink-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium text-ink-900 max-w-sm text-right">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-500 italic">
                  Standard self-onboarding details submitted. No additional attachments uploaded.
                </p>
              )}
            </div>

            {/* Verification Actions Form */}
            <div className="space-y-4 pt-2 border-t border-ink-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                Administrative Decision
              </h4>

              {actionType && (
                <div className="space-y-2 rounded-2xl border border-ink-200 bg-[#FAF8F5] p-4">
                  <label className="block text-xs font-bold text-ink-900">
                    {actionType === 'reject'
                      ? 'Specify Rejection Reason (Required):'
                      : actionType === 'request_changes'
                        ? 'Message to Provider / Changes Required (Required):'
                        : 'Approval Confirmation Notes (Optional):'}
                  </label>
                  <Textarea
                    rows={3}
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder={
                      actionType === 'reject'
                        ? 'e.g. Identity document unreadable or mismatched district registration.'
                        : 'e.g. Please upload clear photo of local business registration certificate.'
                    }
                    className="text-xs"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={actionType === 'approve' ? undefined : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setActionType('approve');
                      setReasonInput('Credentials verified by Jharkhand Tourism Desk.');
                    }}
                    className="text-xs font-bold"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
                    Approve Verification
                  </Button>

                  <Button
                    type="button"
                    variant={actionType === 'request_changes' ? undefined : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setActionType('request_changes');
                      setReasonInput('');
                    }}
                    className="text-xs font-bold"
                  >
                    <AlertTriangle className="mr-1.5 h-4 w-4 text-amber-600" />
                    Request Changes
                  </Button>

                  <Button
                    type="button"
                    variant={actionType === 'reject' ? undefined : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setActionType('reject');
                      setReasonInput('');
                    }}
                    className="text-xs font-bold text-red-700 hover:bg-red-50"
                  >
                    <ShieldAlert className="mr-1.5 h-4 w-4" />
                    Reject
                  </Button>
                </div>

                {actionType && (
                  <Button
                    type="button"
                    onClick={handleVerificationAction}
                    disabled={processing}
                    size="sm"
                    className="text-xs font-bold"
                  >
                    {processing ? 'Processing...' : 'Confirm Decision'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
