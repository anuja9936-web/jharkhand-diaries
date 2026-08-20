import { useEffect, useState } from 'react';
import {
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input } from '../../components/ui';
import { ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { JHARKHAND_DISTRICTS } from '../../constants/destinations';
import { getAdminDestinations, getAdminDistrictsData, getAdminProviders } from '../../services/admin/adminGovernanceService';
import type { AdminProviderItem, DistrictTourismSummary } from '../../types/admin';
import type { Destination } from '../../types/destination';
import { getProviderCategoryLabel } from '../../constants/provider';

export function AdminDistrictsPage() {
  const [districtSummaries, setDistrictSummaries] = useState<DistrictTourismSummary[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Ranchi');
  const [districtDestinations, setDistrictDestinations] = useState<Destination[]>([]);
  const [districtProviders, setDistrictProviders] = useState<AdminProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const summaries = await getAdminDistrictsData();
      setDistrictSummaries(summaries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to compile district data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // When selected district changes, load its destinations and providers
  useEffect(() => {
    async function loadDistrictDetails() {
      if (!selectedDistrict) return;
      try {
        const [dests, provs] = await Promise.all([
          getAdminDestinations({ district: selectedDistrict }),
          getAdminProviders({ district: selectedDistrict }),
        ]);
        setDistrictDestinations(dests);
        setDistrictProviders(provs);
      } catch (err) {
        console.error('[DISTRICT] Error loading district items', err);
      }
    }
    void loadDistrictDetails();
  }, [selectedDistrict]);

  const activeSummary =
    districtSummaries.find((d) => d.district.toLowerCase() === selectedDistrict.toLowerCase()) || {
      district: selectedDistrict,
      destinationsCount: districtDestinations.length,
      publishedDestinationsCount: districtDestinations.filter((d) => d.status === 'published').length,
      providersCount: districtProviders.length,
      verifiedProvidersCount: districtProviders.filter((p) => p.verification_status === 'verified').length,
      underReviewProvidersCount: districtProviders.filter((p) => p.verification_status === 'under_review').length,
      accommodationsCount: 0,
      artisansCount: 0,
      guidesCount: 0,
      adventureCount: 0,
      transportCount: 0,
      requestsCount: 0,
      reviewsCount: 0,
      averageRating: null,
    };

  const filteredDistricts = districtSummaries.filter((d) =>
    d.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Regional Governance"
        title="24 District Tourism Management"
        description="Inspect destination footprints, registered local service operators, and tourism capacity across each district of Jharkhand."
      />

      {/* Main District Selector & Overview Grid */}
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Left Column: 24 District Selector Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-700">
              Districts ({JHARKHAND_DISTRICTS.length})
            </span>
            <div className="w-48">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search district..."
                className="text-xs h-8"
              />
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <LoadingState label="Loading district matrix..." />
            ) : error ? (
              <ErrorState title="Error" message={error} />
            ) : filteredDistricts.length === 0 ? (
              <p className="text-xs text-ink-500 py-4">No matching districts found.</p>
            ) : (
              filteredDistricts.map((item) => {
                const isSelected = item.district.toLowerCase() === selectedDistrict.toLowerCase();
                return (
                  <button
                    key={item.district}
                    type="button"
                    onClick={() => setSelectedDistrict(item.district)}
                    className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-clay-700 bg-[#FAF4ED] shadow-sm ring-1 ring-clay-700'
                        : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-sand/40'
                    }`}
                  >
                    <div>
                      <h4 className="font-display text-sm font-bold text-ink-900">{item.district}</h4>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        {item.destinationsCount} {item.destinationsCount === 1 ? 'Destination' : 'Destinations'} •{' '}
                        {item.providersCount} {item.providersCount === 1 ? 'Provider' : 'Providers'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.verifiedProvidersCount > 0 && (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                          {item.verifiedProvidersCount} Verified
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected District Comprehensive Dashboard */}
        <div className="space-y-6">
          {/* Active District Banner */}
          <Card className="p-6 bg-gradient-to-r from-clay-50/70 via-white to-sand/40 border-clay-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-clay-800">
                  <MapPin className="h-3.5 w-3.5 text-clay-700" />
                  District Administration Hub
                </div>
                <h2 className="font-display text-2xl font-bold text-ink-900 mt-1">
                  {selectedDistrict} District
                </h2>
                <p className="text-xs text-ink-600 mt-0.5">
                  State of Jharkhand • Tourism Development Committee Desk
                </p>
              </div>

              <Button asChild variant="secondary" size="sm" className="text-xs">
                <Link to={`/explore?district=${encodeURIComponent(selectedDistrict)}`} target="_blank">
                  <ExternalLink className="mr-1 h-3.5 w-3.5 text-clay-700" />
                  Public District View
                </Link>
              </Button>
            </div>

            {/* Quick District Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-ink-100/80 text-center">
              <div className="rounded-xl bg-white p-3 border border-ink-100 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Destinations
                </span>
                <p className="font-display text-xl font-bold text-ink-900 mt-1">
                  {activeSummary.destinationsCount}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-ink-100 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Total Providers
                </span>
                <p className="font-display text-xl font-bold text-ink-900 mt-1">
                  {activeSummary.providersCount}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-ink-100 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Verified Partners
                </span>
                <p className="font-display text-xl font-bold text-emerald-800 mt-1">
                  {activeSummary.verifiedProvidersCount}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-ink-100 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Under Review
                </span>
                <p className="font-display text-xl font-bold text-amber-800 mt-1">
                  {activeSummary.underReviewProvidersCount}
                </p>
              </div>
            </div>
          </Card>

          {/* District Destinations List */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink-900">
                Destinations in {selectedDistrict} ({districtDestinations.length})
              </h3>
              <Button asChild variant="secondary" size="sm" className="text-xs">
                <Link to="/admin/destinations">Add / Edit →</Link>
              </Button>
            </div>

            {districtDestinations.length === 0 ? (
              <p className="text-xs text-ink-500 py-4 italic">
                No destinations listed for {selectedDistrict} yet. Use Destination Management to add landmarks.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {districtDestinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="flex items-center justify-between rounded-xl border border-ink-100 bg-[#FAF8F5] p-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-ink-900">{dest.name}</h4>
                      <p className="text-[10px] text-ink-500 capitalize">{dest.category.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge variant={dest.status === 'published' ? 'neutral' : 'warning'} className="text-[10px]">
                      {dest.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* District Providers List */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink-900">
                Service Providers in {selectedDistrict} ({districtProviders.length})
              </h3>
              <Button asChild variant="secondary" size="sm" className="text-xs">
                <Link to="/admin/vendors">View Verification Queue →</Link>
              </Button>
            </div>

            {districtProviders.length === 0 ? (
              <p className="text-xs text-ink-500 py-4 italic">
                No service providers registered in {selectedDistrict} yet.
              </p>
            ) : (
              <div className="space-y-2">
                {districtProviders.map((prov) => (
                  <div
                    key={prov.id}
                    className="flex items-center justify-between rounded-xl border border-ink-100 bg-[#FAF8F5] p-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-900">{prov.business_name || prov.full_name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            prov.verification_status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sand text-ink-700'
                          }`}
                        >
                          {prov.verification_status}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        Services:{' '}
                        {prov.provider_categories.length > 0
                          ? prov.provider_categories.map((c) => getProviderCategoryLabel(c)).join(', ')
                          : 'General'}
                      </p>
                    </div>

                    <Button asChild variant="ghost" size="sm" className="text-xs">
                      <Link to={`/providers/${prov.id}`} target="_blank">
                        Profile
                      </Link>
                    </Button>
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
