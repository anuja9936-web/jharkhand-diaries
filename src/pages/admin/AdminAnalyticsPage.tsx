import { useEffect, useState } from 'react';
import {
  Activity,
  Building2,
  CalendarCheck,
  Compass,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui';
import { ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/StateBlocks';
import { AdminAIInsightsCard } from '../../components/ai/AdminAIInsightsCard';
import {
  getAdminDashboardMetrics,
  getAdminDistrictsData,
} from '../../services/admin/adminGovernanceService';
import type { AdminDashboardMetrics, DistrictTourismSummary } from '../../types/admin';

export function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [districts, setDistricts] = useState<DistrictTourismSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [metricsData, districtData] = await Promise.all([
          getAdminDashboardMetrics(),
          getAdminDistrictsData(),
        ]);
        setMetrics(metricsData);
        setDistricts(districtData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to compile analytics.');
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Intelligence & Reports"
          title="Tourism Ecosystem Analytics"
          description="Compiling district coverage, verified service capacity, and traveler engagement data..."
        />
        <LoadingState label="Computing analytics from live database..." />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Intelligence & Reports"
          title="Tourism Ecosystem Analytics"
          description="Ecosystem metrics calculated from live database records."
        />
        <ErrorState title="Unable to load analytics" message={error || 'Could not compile data.'} />
      </div>
    );
  }

  const verificationRate =
    metrics.providers.total > 0
      ? Math.round((metrics.providers.verified / metrics.providers.total) * 100)
      : 0;

  const topDistricts = districts.slice(0, 8);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Intelligence & Reports"
        title="Tourism Ecosystem Analytics"
        description="Comprehensive statistics and regional performance metrics calculated strictly from live platform activity."
      />

      {/* Verification & Real Data Notice */}
      <div className="rounded-2xl border border-ink-200/80 bg-white p-4 text-xs text-ink-600 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-700" />
          <span><strong>Live Data Source:</strong> Based on available platform activity and verified registrations across Jharkhand.</span>
        </div>
        <span className="text-[11px] text-ink-400">Updated today</span>
      </div>

      {/* Top Headline Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Destinations Curated"
          value={String(metrics.destinations.total)}
          detail={`${metrics.destinations.published} published across ${districts.filter(d => d.destinationsCount > 0).length} districts`}
          icon={MapPin}
        />

        <StatCard
          label="Registered Providers"
          value={String(metrics.providers.total)}
          detail={`${metrics.providers.verified} verified partners (${verificationRate}% verified)`}
          icon={ShieldCheck}
        />

        <StatCard
          label="Published Offerings"
          value={String(metrics.offerings.total)}
          detail="Active accommodations, tours, and craft listings"
          icon={Package}
        />

        <StatCard
          label="Tourist Requests"
          value={String(metrics.requests.total)}
          detail={`${metrics.requests.accepted} confirmed bookings and inquiries`}
          icon={CalendarCheck}
        />
      </div>

      {/* AI Tourism Governance Insights */}
      <AdminAIInsightsCard
        totalDestinations={metrics.destinations.total}
        totalProviders={metrics.providers.total}
        totalOfferings={metrics.offerings.total}
        pendingFeedbackCount={metrics.feedback.new + metrics.feedback.under_review}
      />

      {/* 2-Column Analytics Breakdown: Offerings by Type & Provider Verification Distribution */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Card 1: 5 Provider Offering Kinds Breakdown */}
        <Card className="p-6 space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
              Service Capacity
            </span>
            <h3 className="font-display text-lg font-bold text-ink-900 mt-0.5">
              Offerings by Provider Category
            </h3>
            <p className="text-xs text-ink-600">Distribution of tourism products and services listed on Jharkhand Diaries.</p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-900 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-clay-700" /> Accommodations & Stays
                </span>
                <span className="font-bold text-ink-900">{metrics.offerings.byKind.stay}</span>
              </div>
              <div className="h-2 rounded-full bg-sand overflow-hidden">
                <div
                  className="h-full bg-clay-700 rounded-full"
                  style={{
                    width: `${metrics.offerings.total > 0 ? (metrics.offerings.byKind.stay / metrics.offerings.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-900 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-clay-700" /> Artisan & Handicrafts
                </span>
                <span className="font-bold text-ink-900">{metrics.offerings.byKind.product}</span>
              </div>
              <div className="h-2 rounded-full bg-sand overflow-hidden">
                <div
                  className="h-full bg-clay-700 rounded-full"
                  style={{
                    width: `${metrics.offerings.total > 0 ? (metrics.offerings.byKind.product / metrics.offerings.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-900 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-clay-700" /> Guided Tours & Walks
                </span>
                <span className="font-bold text-ink-900">{metrics.offerings.byKind.tour}</span>
              </div>
              <div className="h-2 rounded-full bg-sand overflow-hidden">
                <div
                  className="h-full bg-clay-700 rounded-full"
                  style={{
                    width: `${metrics.offerings.total > 0 ? (metrics.offerings.byKind.tour / metrics.offerings.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-900 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-clay-700" /> Adventure & Experiences
                </span>
                <span className="font-bold text-ink-900">{metrics.offerings.byKind.experience}</span>
              </div>
              <div className="h-2 rounded-full bg-sand overflow-hidden">
                <div
                  className="h-full bg-clay-700 rounded-full"
                  style={{
                    width: `${metrics.offerings.total > 0 ? (metrics.offerings.byKind.experience / metrics.offerings.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-900 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-clay-700" /> Transport & Vehicle Services
                </span>
                <span className="font-bold text-ink-900">{metrics.offerings.byKind.transport}</span>
              </div>
              <div className="h-2 rounded-full bg-sand overflow-hidden">
                <div
                  className="h-full bg-clay-700 rounded-full"
                  style={{
                    width: `${metrics.offerings.total > 0 ? (metrics.offerings.byKind.transport / metrics.offerings.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Provider Trust & Verification Funnel */}
        <Card className="p-6 space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
              Partner Governance
            </span>
            <h3 className="font-display text-lg font-bold text-ink-900 mt-0.5">
              Provider Verification Funnel
            </h3>
            <p className="text-xs text-ink-600">Breakdown of service operator verification and trust status.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Verified Partners
              </span>
              <p className="font-display text-2xl font-bold text-emerald-900">
                {metrics.providers.verified}
              </p>
              <p className="text-[11px] text-emerald-700">Official badges granted</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Under Review
              </span>
              <p className="font-display text-2xl font-bold text-amber-900">
                {metrics.providers.under_review}
              </p>
              <p className="text-[11px] text-amber-700">Pending admin action</p>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-[#FAF8F5] p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-600">
                Unverified Providers
              </span>
              <p className="font-display text-2xl font-bold text-ink-900">
                {metrics.providers.unverified}
              </p>
              <p className="text-[11px] text-ink-500">Awaiting KYC submission</p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                Rejected / Needs Fix
              </span>
              <p className="font-display text-2xl font-bold text-red-900">
                {metrics.providers.rejected}
              </p>
              <p className="text-[11px] text-red-700">Documentation flagged</p>
            </div>
          </div>
        </Card>
      </div>

      {/* District-by-District Distribution Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
              Regional Footprint
            </span>
            <h3 className="font-display text-lg font-bold text-ink-900 mt-0.5">
              District Tourism Activity Matrix
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-ink-200 bg-[#FAF8F5] text-ink-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 font-bold">District</th>
                <th className="p-3 font-bold text-center">Destinations</th>
                <th className="p-3 font-bold text-center">Published</th>
                <th className="p-3 font-bold text-center">Total Providers</th>
                <th className="p-3 font-bold text-center">Verified Providers</th>
                <th className="p-3 font-bold text-center">Stays</th>
                <th className="p-3 font-bold text-center">Crafts</th>
                <th className="p-3 font-bold text-center">Tours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {topDistricts.map((d) => (
                <tr key={d.district} className="hover:bg-sand/30 transition-colors">
                  <td className="p-3 font-bold text-ink-900">{d.district}</td>
                  <td className="p-3 text-center">{d.destinationsCount}</td>
                  <td className="p-3 text-center text-emerald-800 font-semibold">{d.publishedDestinationsCount}</td>
                  <td className="p-3 text-center">{d.providersCount}</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">{d.verifiedProvidersCount}</td>
                  <td className="p-3 text-center">{d.accommodationsCount}</td>
                  <td className="p-3 text-center">{d.artisansCount}</td>
                  <td className="p-3 text-center">{d.guidesCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
