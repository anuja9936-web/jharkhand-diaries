import { Badge, Card } from '../../components/ui';
import { PageHeader, PlaceholderPage, StatCard } from '../../components/common/StateBlocks';
import { Activity, AlertTriangle, Map, Store, Users, Waves } from 'lucide-react';

const adminBullets = {
  vendors: ['Vendor review, moderation, and trust controls will be added later.', 'This route is reserved for platform and government review workflows.'],
  destinations: ['Destination curation and oversight tools belong here in the future.', 'The route exists so we can add managed content later without restructuring.'],
  alerts: ['Emergency and tourism alerts are intentionally out of scope for now.', 'The future module will connect to verified backend and notification logic.'],
  analytics: ['This will eventually surface tourism metrics and economic indicators.', 'For now it remains a structure-only dashboard area.'],
};

const adminStats = [
  { label: 'Total Tourists', value: '1.2k', detail: 'Demo metric only', icon: Users },
  { label: 'Verified Vendors', value: '84', detail: 'Preview count', icon: Store },
  { label: 'Destinations', value: '32', detail: 'Structured placeholders', icon: Map },
  { label: 'Local Economic Activity', value: 'Healthy', detail: 'Illustrative status', icon: Activity },
  { label: 'Eco-Points', value: '18.4k', detail: 'Mock engagement signal', icon: Waves },
  { label: 'Active Alerts', value: '2', detail: 'Demo alert count', icon: AlertTriangle },
];

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Operations dashboard"
        description="A placeholder control surface for platform governance, verified ecosystems, and tourism intelligence."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card className="space-y-4">
        <Badge variant="warning">Mock data only</Badge>
        <p className="text-sm leading-6 text-ink-600">
          The metrics shown here are not real-world statistics. They are isolated mock values to validate the layout
          until backend data and governance logic are implemented.
        </p>
      </Card>
    </div>
  );
}

export function AdminVendorsPage() {
  return (
    <PlaceholderPage
      eyebrow="Admin vendors"
      title="Vendor oversight"
      description="This will later support moderation, verification review, and vendor lifecycle management."
      bullets={adminBullets.vendors}
    />
  );
}

export function AdminDestinationsPage() {
  return (
    <PlaceholderPage
      eyebrow="Admin destinations"
      title="Destination management"
      description="A future content and oversight workspace for verified destinations and related metadata."
      bullets={adminBullets.destinations}
    />
  );
}

export function AdminAlertsPage() {
  return (
    <PlaceholderPage
      eyebrow="Admin alerts"
      title="Alerts and notifications"
      description="Reserved for emergency notices, service alerts, and tourism operations signals later."
      bullets={adminBullets.alerts}
    />
  );
}

export function AdminAnalyticsPage() {
  return (
    <PlaceholderPage
      eyebrow="Admin analytics"
      title="Platform analytics"
      description="Future charts and reporting for tourism impact, vendor growth, and verified activity."
      bullets={adminBullets.analytics}
    />
  );
}

