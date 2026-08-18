import { Compass, Leaf, MapPin, Sparkles, Star } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { PageHeader, PlaceholderPage, StatCard } from '../../components/common/StateBlocks';
import { Link } from 'react-router-dom';

const touristBullets = {
  explore: ['Curated discovery tools will highlight places, routes, and cultural moments.', 'This page will later connect to destinations and recommendations.'],
  itinerary: ['AI trip planning will arrive in a later phase.', 'This scaffold is ready for saved plans, scheduling, and route output.'],
  audioGuide: ['Cultural narration and context-aware stories will be added later.', 'This route will support location-aware audio in a future phase.'],
  ecoPassport: ['Eco-points and sustainability actions will be tracked here later.', 'This page will eventually reflect responsible travel progress.'],
  ar: ['WebAR craft preview is intentionally deferred to a later milestone.', 'The route and layout are already reserved for that experience.'],
};

const touristStats = [
  { label: 'My Trips', value: '03', detail: 'Saved itineraries and trip ideas', icon: MapPin },
  { label: 'Eco-Points', value: '120', detail: 'Demo-only progress indicator', icon: Leaf },
  { label: 'Saved Places', value: '14', detail: 'Future favorites and bookmarks', icon: Star },
  { label: 'Nearby Experiences', value: '08', detail: 'Local activities and vendors', icon: Compass },
];

export function TouristDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tourist"
        title="Your travel companion"
        description="This dashboard placeholder will eventually become a personalized travel hub for planning, discovery, and eco-tracking."
        actions={
          <Button asChild>
            <Link to="/tourist/explore">Explore nearby experiences</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {touristStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-clay-700" />
          <h2 className="text-xl font-semibold text-ink-900">Demo-only preview</h2>
        </div>
        <p className="text-sm leading-6 text-ink-600">
          The numbers shown here are mock placeholders, not live database statistics. We will wire real profile and
          trip data in Phase 1 and Phase 2.
        </p>
      </Card>
    </div>
  );
}

export function TouristExplorePage() {
  return (
    <PlaceholderPage
      eyebrow="Tourist explore"
      title="Explore routes, attractions, and cultural stops"
      description="A future discovery surface for tourist-friendly planning, recommendations, and contextual tourism cues."
      bullets={touristBullets.explore}
    />
  );
}

export function TouristItineraryPage() {
  return (
    <PlaceholderPage
      eyebrow="Tourist itinerary"
      title="AI itinerary planning"
      description="This route is reserved for personalized trip generation and day-by-day planning in a later phase."
      bullets={touristBullets.itinerary}
    />
  );
}

export function TouristAudioGuidePage() {
  return (
    <PlaceholderPage
      eyebrow="Tourist audio guide"
      title="Cultural audio guide"
      description="A future guide experience for stories, local context, and immersive narration around destinations."
      bullets={touristBullets.audioGuide}
    />
  );
}

export function TouristEcoPassportPage() {
  return (
    <PlaceholderPage
      eyebrow="Tourist eco passport"
      title="Eco passport and points"
      description="A future sustainability profile for responsible travel actions, rewards, and eco engagement."
      bullets={touristBullets.ecoPassport}
    />
  );
}

export function TouristARPage() {
  return (
    <PlaceholderPage
      eyebrow="Tourist AR"
      title="AR craft experience"
      description="A reserved route for WebAR-based craft previews and immersive cultural interaction."
      bullets={touristBullets.ar}
    />
  );
}
