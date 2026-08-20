import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Landmark,
  Map,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui';
import { ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/StateBlocks';
import {
  getAdminAlerts,
  getAdminDashboardMetrics,
  getAdminFeedback,
  getAdminProviders,
} from '../../services/admin/adminGovernanceService';
import type { AdminDashboardMetrics, AdminProviderItem, TourismAlert, TourismFeedback } from '../../types/admin';
import { getProviderCategoryLabel } from '../../constants/provider';

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [pendingProviders, setPendingProviders] = useState<AdminProviderItem[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<TourismAlert[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<TourismFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsData, providersData, alertsData, feedbackData] = await Promise.all([
        getAdminDashboardMetrics(),
        getAdminProviders({ verificationStatus: 'under_review' }).catch(() => []),
        getAdminAlerts().catch(() => []),
        getAdminFeedback().catch(() => []),
      ]);

      setMetrics(metricsData);
      setPendingProviders(providersData.slice(0, 5));
      setActiveAlerts(alertsData.filter((a) => a.status === 'published').slice(0, 3));
      setRecentFeedback(feedbackData.slice(0, 4));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load administration dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Government of Jharkhand"
          title="Tourism Administration"
          description="Loading live ecosystem intelligence, verified providers, and administrative controls..."
        />
        <LoadingState label="Connecting to tourism database..." />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Government of Jharkhand"
          title="Tourism Administration"
          description="Monitor and manage Jharkhand's tourism ecosystem."
        />
        <ErrorState title="Unable to load dashboard" message={error || 'Could not compile metrics.'} />
        <Button onClick={loadData} variant="secondary">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Official Government Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-ink-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <Landmark className="h-3.5 w-3.5" />
                Jharkhand Tourism Administration
              </span>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-clay-800">
                24 Districts Active
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
              Tourism Administration
            </h1>
            <p className="text-sm leading-relaxed text-ink-600 sm:text-base">
              Monitor and manage Jharkhand's tourism ecosystem, verify local service providers, curate destinations, and broadcast travel advisories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild size="sm">
              <Link to="/admin/destinations">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Destination
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/admin/alerts">
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-amber-700" />
                Publish Alert
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Governance Links Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-6 border-t border-ink-100 text-xs">
          <span className="font-semibold text-ink-500 uppercase tracking-wider text-[11px] mr-2">
            Quick Actions:
          </span>
          <Link
            to="/admin/vendors"
            className="inline-flex items-center gap-1 rounded-xl bg-sand/60 px-3 py-1.5 font-medium text-ink-800 hover:bg-sand transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-clay-700" />
            Review Providers ({metrics.providers.under_review} pending)
          </Link>
          <Link
            to="/admin/destinations"
            className="inline-flex items-center gap-1 rounded-xl bg-sand/60 px-3 py-1.5 font-medium text-ink-800 hover:bg-sand transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-clay-700" />
            Manage Destinations ({metrics.destinations.total})
          </Link>
          <Link
            to="/admin/districts"
            className="inline-flex items-center gap-1 rounded-xl bg-sand/60 px-3 py-1.5 font-medium text-ink-800 hover:bg-sand transition-colors"
          >
            <Map className="h-3.5 w-3.5 text-clay-700" />
            View Districts
          </Link>
          <Link
            to="/admin/feedback"
            className="inline-flex items-center gap-1 rounded-xl bg-sand/60 px-3 py-1.5 font-medium text-ink-800 hover:bg-sand transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5 text-clay-700" />
            Review Feedback ({metrics.feedback.new} new)
          </Link>
        </div>
      </div>

      {/* Real Platform Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Destinations"
          value={String(metrics.destinations.total)}
          detail={`${metrics.destinations.published} published • ${metrics.destinations.draft} in draft`}
          icon={MapPin}
        />

        <StatCard
          label="Registered Providers"
          value={String(metrics.providers.total)}
          detail={`${metrics.providers.verified} verified • ${metrics.providers.under_review} under review`}
          icon={ShieldCheck}
        />

        <StatCard
          label="Service Offerings"
          value={String(metrics.offerings.total)}
          detail={`${metrics.offerings.byKind.stay} stays • ${metrics.offerings.byKind.product} crafts • ${metrics.offerings.byKind.tour} tours`}
          icon={Package}
        />

        <StatCard
          label="Active Travel Advisories"
          value={String(metrics.alerts.active)}
          detail={metrics.alerts.active > 0 ? 'Broadcast to tourist pages' : 'No active alerts'}
          icon={AlertTriangle}
        />
      </div>

      {/* Main Grid: Pending Provider Verification Queue & Active Alerts */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column: Verification Queue */}
        <div className="space-y-6">
          <Card className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                  Trust & Compliance Desk
                </span>
                <h2 className="font-display text-lg font-bold text-ink-900">
                  Provider Verification Queue
                </h2>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/admin/vendors">View All Providers ({metrics.providers.total})</Link>
              </Button>
            </div>

            {pendingProviders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink-200 bg-sand/30 p-8 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                <p className="font-bold text-sm text-ink-900">All submissions reviewed</p>
                <p className="text-xs text-ink-600 mt-1 max-w-sm mx-auto">
                  There are currently no provider verification requests pending review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-[#FAF8F5] p-4 transition-all hover:bg-sand/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-ink-900">
                          {provider.business_name || provider.full_name || 'Provider Account'}
                        </h4>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          Under Review
                        </span>
                      </div>
                      <p className="text-xs text-ink-600">
                        {provider.district ? `${provider.district}, Jharkhand` : 'District not set'} •{' '}
                        {provider.provider_categories.length > 0
                          ? provider.provider_categories.map((c) => getProviderCategoryLabel(c)).join(', ')
                          : 'No category selected'}
                      </p>
                    </div>

                    <Button asChild size="sm" variant="secondary" className="text-xs">
                      <Link to="/admin/vendors">Review Credentials →</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* District Distribution Overview Callout */}
          <Card className="space-y-4 p-6 bg-gradient-to-br from-white to-[#FAF4ED]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                  Regional Coverage
                </span>
                <h3 className="font-display text-lg font-bold text-ink-900">
                  24 District Tourism Overview
                </h3>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/admin/districts">Open District Portals →</Link>
              </Button>
            </div>
            <p className="text-xs text-ink-600 leading-relaxed">
              Monitor destinations, local guides, stays, and handicraft artisan clusters across Ranchi, Latehar, Deoghar, Hazaribagh, and all 24 districts of Jharkhand.
            </p>
          </Card>
        </div>

        {/* Right Column: Active Alerts & Feedback Highlights */}
        <div className="space-y-6">
          {/* Active Advisories Card */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <h3 className="font-display text-base font-bold text-ink-900">
                  Active Travel Advisories
                </h3>
              </div>
              <Link to="/admin/alerts" className="text-xs font-semibold text-clay-700 hover:underline">
                Manage
              </Link>
            </div>

            {activeAlerts.length === 0 ? (
              <p className="text-xs text-ink-500 py-4 text-center">No active travel alerts.</p>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-xl border border-ink-200 bg-white p-3.5 space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink-900">{alert.title}</span>
                      <Badge variant={alert.severity === 'critical' ? 'accent' : 'neutral'} className="text-[10px]">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-600 line-clamp-2">{alert.description}</p>
                    <p className="text-[10px] text-ink-400 pt-1">
                      {alert.district ? `District: ${alert.district}` : 'Statewide Notice'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Grievances & Feedback */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-clay-700" />
                <h3 className="font-display text-base font-bold text-ink-900">
                  Recent Feedback & Grievances
                </h3>
              </div>
              <Link to="/admin/feedback" className="text-xs font-semibold text-clay-700 hover:underline">
                View all ({metrics.feedback.total})
              </Link>
            </div>

            {recentFeedback.length === 0 ? (
              <p className="text-xs text-ink-500 py-4 text-center">No feedback submissions yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentFeedback.map((fb) => (
                  <div key={fb.id} className="rounded-xl border border-ink-100 bg-[#FAF8F5] p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-900 truncate max-w-[180px]">{fb.subject}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          fb.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fb.status === 'under_review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sand text-ink-700'
                        }`}
                      >
                        {fb.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-ink-600 line-clamp-1">{fb.message}</p>
                    <p className="text-[10px] text-ink-400">By {fb.reporter_name} • {fb.district || 'General'}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
