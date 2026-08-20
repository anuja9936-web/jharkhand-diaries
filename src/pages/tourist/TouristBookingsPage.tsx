import { useEffect, useState } from 'react';
import {
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  MessageSquare,
  Package,
  RotateCcw,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  cancelTouristBooking,
  getMyTouristBookings,
  type TouristBookingWithDetails,
} from '../../services/tourist/touristBookingService';
import { JHARKHAND_ACCOMMODATIONS } from '../../constants/accommodationsData';
import {
  JHARKHAND_MARKETPLACE_PRODUCTS,
  JHARKHAND_MARKETPLACE_EXPERIENCES,
  JHARKHAND_CURATED_TOURS,
  JHARKHAND_CURATED_TRANSPORT,
} from '../../constants/marketplaceData';
import { useTranslation } from '../../i18n';
import { formatIndianCurrency } from '../../lib/utils';
import { Badge, Button, Card } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import type { ProviderOffering, ProviderOfferingKind, ProviderRequestStatus } from '../../types/provider';

const ALL_CURATED: ProviderOffering[] = [
  ...JHARKHAND_ACCOMMODATIONS,
  ...JHARKHAND_MARKETPLACE_PRODUCTS,
  ...JHARKHAND_MARKETPLACE_EXPERIENCES,
  ...JHARKHAND_CURATED_TOURS,
  ...JHARKHAND_CURATED_TRANSPORT,
];

type FilterTab = 'all' | ProviderRequestStatus;

export function TouristBookingsPage() {
  const { language, t } = useTranslation();
  const [bookings, setBookings] = useState<TouristBookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyTouristBookings();
      setBookings(data);
    } catch (err) {
      console.error('[Tourist Bookings] Error loading:', err);
      setError(err instanceof Error ? err.message : 'Unable to load booking requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm(language === 'hi' ? 'क्या आप इस बुकिंग अनुरोध को रद्द करना चाहते हैं?' : 'Are you sure you want to cancel this booking request?')) {
      return;
    }

    setCancellingId(bookingId);
    setActionNotice(null);
    try {
      await cancelTouristBooking(bookingId);
      setActionNotice(language === 'hi' ? 'बुकिंग अनुरोध सफलतापूर्वक रद्द कर दिया गया।' : 'Booking request cancelled successfully.');
      await loadBookings();
    } catch (err) {
      console.error('[Tourist Bookings] Error cancelling:', err);
      setActionNotice(err instanceof Error ? err.message : 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const getStatusBadge = (status: ProviderRequestStatus) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">{language === 'hi' ? 'स्वीकृत (Accepted)' : 'Accepted'}</Badge>;
      case 'rejected':
        return <Badge variant="neutral">{language === 'hi' ? 'अस्वीकृत (Rejected)' : 'Rejected'}</Badge>;
      case 'completed':
        return <Badge variant="neutral">{language === 'hi' ? 'पूर्ण (Completed)' : 'Completed'}</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">{language === 'hi' ? 'रद्द (Cancelled)' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="warning">{language === 'hi' ? 'लंबित (Pending)' : 'Pending'}</Badge>;
    }
  };

  const getKindIcon = (kind?: ProviderOfferingKind | null) => {
    switch (kind) {
      case 'stay':
        return <Building2 className="h-4 w-4 text-amber-600" />;
      case 'tour':
        return <Compass className="h-4 w-4 text-emerald-600" />;
      case 'transport':
        return <Car className="h-4 w-4 text-blue-600" />;
      case 'product':
        return <Package className="h-4 w-4 text-clay-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-purple-600" />;
    }
  };

  if (loading) {
    return <LoadingState label={language === 'hi' ? 'आपके बुकिंग अनुरोध लोड हो रहे हैं...' : 'Loading your booking requests...'} />;
  }

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        eyebrow={language === 'hi' ? 'पर्यटक पोर्टल' : 'Tourist Portal'}
        title={language === 'hi' ? 'मेरे बुकिंग एवं सेवा अनुरोध' : 'My Requests & Bookings'}
        description={
          language === 'hi'
            ? 'झारखंड के स्थानीय सेवा प्रदाताओं (होटल, होमस्टे, टूर गाइड, कैब ऑपरेटर एवं कारीगरों) को भेजे गए अनुरोधों की स्थिति देखें।'
            : 'Track real-time requests and reservations sent to verified Jharkhand accommodations, guides, transports, and artisans.'
        }
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={loadBookings}
            className="text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t('common.retry', 'Refresh')}</span>
          </Button>
        }
      />

      {actionNotice && (
        <div className="rounded-2xl border border-ink-200 bg-sand/60 px-4 py-3 text-xs font-semibold text-ink-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ink-200 pb-3">
        {[
          { id: 'all' as FilterTab, label: language === 'hi' ? 'सभी अनुरोध' : 'All Requests', count: bookings.length },
          { id: 'pending' as FilterTab, label: language === 'hi' ? 'लंबित' : 'Pending', count: bookings.filter((b) => b.status === 'pending').length },
          { id: 'accepted' as FilterTab, label: language === 'hi' ? 'स्वीकृत' : 'Accepted', count: bookings.filter((b) => b.status === 'accepted').length },
          { id: 'completed' as FilterTab, label: language === 'hi' ? 'पूर्ण' : 'Completed', count: bookings.filter((b) => b.status === 'completed').length },
          { id: 'rejected' as FilterTab, label: language === 'hi' ? 'अस्वीकृत' : 'Rejected', count: bookings.filter((b) => b.status === 'rejected').length },
          { id: 'cancelled' as FilterTab, label: language === 'hi' ? 'रद्द' : 'Cancelled', count: bookings.filter((b) => b.status === 'cancelled').length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-forest-900 text-white shadow-xs'
                : 'bg-white text-ink-700 hover:bg-sand border border-ink-200/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === tab.id ? 'bg-forest-700 text-white' : 'bg-sand text-ink-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState
          title={language === 'hi' ? 'अनुरोध लोड करने में असमर्थ' : 'Unable to load requests'}
          message={error}
        />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title={language === 'hi' ? 'कोई अनुरोध नहीं मिला' : 'No booking requests found'}
          message={
            language === 'hi'
              ? 'जब आप आवास, टूर या परिवहन लिस्टिंग से बुकिंग अनुरोध भेजेंगे, तो वे यहाँ दिखाई देंगे।'
              : 'When you enquire or request bookings for stays, tours, experiences, or transport, they will appear here.'
          }
          actionLabel={language === 'hi' ? 'पर्यटन सेवाएं खोजें' : 'Explore Stays & Travel'}
          actionHref="/accommodations"
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((req) => {
            const curatedId = (req.details as Record<string, unknown> | undefined)?.curated_offering_id as string | undefined;
            const offeringDetails = req.offering || ALL_CURATED.find((c) => c.id === req.offering_id || c.id === curatedId || c.slug === curatedId);
            const offeringTitle = offeringDetails?.name || `${(req.offering_kind || req.request_type).toUpperCase()} Booking`;

            return (
              <Card
                key={req.id}
                className="bg-[#FFFDF9] border border-ink-200/90 shadow-sm hover:border-clay-300 transition-all p-5 sm:p-6 space-y-4"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-ink-200/60 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-sand p-2 flex items-center justify-center shrink-0 shadow-2xs">
                      {getKindIcon(req.offering_kind || (offeringDetails?.kind as ProviderOfferingKind))}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-clay-700">
                          {req.offering_kind || req.request_type}
                        </span>
                        {getStatusBadge(req.status)}
                      </div>
                      <h3 className="font-display font-bold text-base text-ink-950 mt-0.5">
                        {offeringTitle}
                      </h3>
                      <p className="text-xs text-ink-600 flex items-center gap-1.5 mt-0.5">
                        <User className="h-3.5 w-3.5 text-forest-700" />
                        <span>
                          <strong>Provider:</strong> {req.provider?.business_name || req.provider?.full_name || 'Verified Provider'}
                        </span>
                        {req.provider?.district && (
                          <span>• {req.provider.district} District</span>
                        )}
                      </p>
                    </div>
                  </div>

                {req.estimated_amount && (
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200 px-3.5 py-1.5 text-right self-start sm:self-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                      {language === 'hi' ? 'अनुमानित राशि' : 'Estimated Total'}
                    </span>
                    <span className="font-bold text-sm text-ink-950">
                      {formatIndianCurrency(req.estimated_amount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Schedule & Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-sand/40 p-3 border border-ink-200/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{language === 'hi' ? 'अनुरोधित दिनांक / अवधि' : 'Requested Dates'}</span>
                  </span>
                  <p className="font-bold text-ink-900">
                    {req.start_date || req.preferred_date ? (
                      req.end_date
                        ? `${new Date(req.start_date || req.preferred_date!).toLocaleDateString('en-IN')} – ${new Date(req.end_date).toLocaleDateString('en-IN')}`
                        : new Date(req.start_date || req.preferred_date!).toLocaleDateString('en-IN')
                    ) : (
                      'Flexible'
                    )}
                    {req.duration ? ` (${req.duration})` : ''}
                  </p>
                </div>

                <div className="rounded-xl bg-sand/40 p-3 border border-ink-200/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{language === 'hi' ? 'यात्री / मात्रा' : 'Guests / Quantity'}</span>
                  </span>
                  <p className="font-bold text-ink-900">
                    {req.number_of_people || req.participants || 1} {language === 'hi' ? 'लोग / इकाई' : 'people / units'}
                  </p>
                </div>

                <div className="rounded-xl bg-sand/40 p-3 border border-ink-200/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{language === 'hi' ? 'अनुरोध की तिथि' : 'Submitted On'}</span>
                  </span>
                  <p className="font-bold text-ink-900">
                    {new Date(req.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Tourist Message */}
              {req.message && (
                <div className="text-xs bg-white p-3.5 rounded-2xl border border-ink-200/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-clay-600" />
                    <span>{language === 'hi' ? 'आपका संदेश / आवश्यकताएं:' : 'Your Message / Inquiry Notes:'}</span>
                  </span>
                  <p className="text-ink-700 leading-relaxed">{req.message}</p>
                </div>
              )}

              {/* Provider Response Feedback */}
              {req.provider_response && (
                <div className="text-xs bg-amber-50/70 p-3.5 rounded-2xl border border-amber-300 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>{language === 'hi' ? 'सेवा प्रदाता की प्रतिक्रिया:' : 'Provider Response & Instructions:'}</span>
                  </span>
                  <p className="text-ink-900 font-medium leading-relaxed">{req.provider_response}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ink-200/60">
                {req.offering && (
                  <Button asChild size="sm" variant="secondary" className="text-xs font-bold">
                    <Link
                      to={
                        req.offering.kind === 'stay'
                          ? `/stays/${req.offering.id}`
                          : req.offering.kind === 'product'
                            ? `/products/${req.offering.id}`
                            : req.offering.kind === 'tour'
                              ? `/tours/${req.offering.id}`
                              : req.offering.kind === 'transport'
                                ? `/transport/${req.offering.id}`
                                : `/experiences/${req.offering.id}`
                      }
                    >
                      {language === 'hi' ? 'सेवा लिस्टिंग देखें' : 'View Service Listing'}
                    </Link>
                  </Button>
                )}

                {req.status === 'pending' && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={cancellingId === req.id}
                    onClick={() => handleCancelBooking(req.id)}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>
                      {cancellingId === req.id
                        ? (language === 'hi' ? 'रद्द हो रहा है...' : 'Cancelling...')
                        : (language === 'hi' ? 'अनुरोध रद्द करें' : 'Cancel Request')}
                    </span>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
