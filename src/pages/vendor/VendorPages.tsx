import { Badge, Button, Card } from '../../components/ui';
import { PageHeader, PlaceholderPage, StatCard } from '../../components/common/StateBlocks';
import { Link } from 'react-router-dom';
import { CreditCard, IndianRupee, ListChecks, ShieldCheck, UserCircle2 } from 'lucide-react';

const providerBullets = {
  profile: ['Business profiles and service details will be stored in Supabase later.', 'This route is ready for public identity and contact management.'],
  verification: ['Vendor KYC and document review are intentionally deferred.', 'The future workflow will live behind backend-side validation.'],
  listings: ['Listings for crafts, homestays, transport, and guides will appear here.', 'This skeleton keeps the route structure ready for those modules.'],
  payments: ['UPI and payout flows will be added in a later phase.', 'No payment logic is implemented at this stage.'],
  analytics: ['Earnings and engagement analytics will be introduced later.', 'This route will remain ready for charting and summary cards.'],
};

const vendorStats = [
  { label: 'Verification Status', value: 'Pending', detail: 'Demo placeholder only', icon: ShieldCheck },
  { label: 'Listings', value: '07', detail: 'Draft service cards', icon: ListChecks },
  { label: 'Earnings', value: '₹12,400', detail: 'Preview value only', icon: IndianRupee },
  { label: 'UPI', value: 'Connected', detail: 'Placeholder payment setup', icon: CreditCard },
  { label: 'Profile Completion', value: '68%', detail: 'Improve trust readiness', icon: UserCircle2 },
];

export function VendorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service provider"
        title="Service provider dashboard"
        description="A clean foundation for local providers to manage trust, discoverability, and future commerce tools."
        actions={
          <Button asChild>
            <Link to="/vendor/profile">Complete profile</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {vendorStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card className="space-y-4">
        <Badge variant="accent">Demo preview</Badge>
        <p className="text-sm leading-6 text-ink-600">
          These values are mock placeholders, not production data. The backend profile and verification workflow will
          be added in later phases.
        </p>
      </Card>
    </div>
  );
}

export function VendorProfilePage() {
  return (
    <PlaceholderPage
      eyebrow="Service provider profile"
      title="Service provider profile management"
      description="A future profile area for business identity, contact details, and service presentation."
      bullets={providerBullets.profile}
    />
  );
}

export function VendorVerificationPage() {
  return (
    <PlaceholderPage
      eyebrow="Service provider verification"
      title="Verification status and documents"
      description="Document uploads, checks, and approval workflows will live here once we add backend support."
      bullets={providerBullets.verification}
    />
  );
}

export function VendorListingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Service provider listings"
      title="Listings and services"
      description="This route is reserved for artisan products, homestays, transport services, and guided experiences."
      bullets={providerBullets.listings}
    />
  );
}

export function VendorPaymentsPage() {
  return (
    <PlaceholderPage
      eyebrow="Service provider payments"
      title="Payments and settlements"
      description="A future view for earnings, UPI, payouts, and transaction history."
      bullets={providerBullets.payments}
    />
  );
}

export function VendorAnalyticsPage() {
  return (
    <PlaceholderPage
      eyebrow="Service provider analytics"
      title="Service provider analytics"
      description="A future analytics surface for engagement, earnings, and service performance."
      bullets={providerBullets.analytics}
    />
  );
}
