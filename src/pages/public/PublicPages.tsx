import { Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import {
  NotFoundState,
  UnauthorizedState,
} from '../../components/common/StateBlocks';

// Home Modular Sections
import { HeroCarousel } from '../../components/home/HeroCarousel';
import { HomeDiscoverSection } from '../../components/home/HomeDiscoverSection';
import { HomeGallerySection } from '../../components/home/HomeGallerySection';
import { HomePlacesSection } from '../../components/home/HomePlacesSection';
import { HomeMapSection } from '../../components/home/HomeMapSection';
import { HomeCuisineSection } from '../../components/home/HomeCuisineSection';
import { HomeAdventureSection } from '../../components/home/HomeAdventureSection';
import { HomeArtCraftsSection } from '../../components/home/HomeArtCraftsSection';
import { HomeCultureSection } from '../../components/home/HomeCultureSection';
import { HomeWildlifeSection } from '../../components/home/HomeWildlifeSection';
import { HomeHeritageFestivalsSection } from '../../components/home/HomeHeritageFestivalsSection';
import { HomeExperiencesSection } from '../../components/home/HomeExperiencesSection';
import { HomeAccommodationsSection } from '../../components/home/HomeAccommodationsSection';
import { HomeMarketplaceSection } from '../../components/home/HomeMarketplaceSection';
import { HomePlannerSection } from '../../components/home/HomePlannerSection';
import { HomeStoriesEventsSection } from '../../components/home/HomeStoriesEventsSection';
import { HomeTravellerFeedbackSection } from '../../components/home/HomeTravellerFeedbackSection';
import { HomeResponsiblePartnerSection } from '../../components/home/HomeResponsiblePartnerSection';

export function HomePage() {
  return (
    <div className="w-full bg-white overflow-x-hidden selection:bg-amber-400 selection:text-ink-950">
      {/* 1. Hero Section */}
      <HeroCarousel />

      {/* 2. Discover The Many Faces of Jharkhand */}
      <HomeDiscoverSection />

      {/* 3. Photo Gallery Preview */}
      <HomeGallerySection />

      {/* 4. Places That Stay With You (Destinations) */}
      <HomePlacesSection />

      {/* 5. Map Preview */}
      <HomeMapSection />

      {/* 6. Taste Jharkhand (Cuisine) */}
      <HomeCuisineSection />

      {/* 7. Adventure Awaits */}
      <HomeAdventureSection />

      {/* 8. Stories Made by Hand (Art & Crafts) */}
      <HomeArtCraftsSection />

      {/* 9. Experience The Culture */}
      <HomeCultureSection />

      {/* 10. Into The Wild (Wildlife) */}
      <HomeWildlifeSection />

      {/* 11. Heritage & Festivals */}
      <HomeHeritageFestivalsSection />

      {/* 12. Experiences That Connect You */}
      <HomeExperiencesSection />

      {/* 13. Stay Your Way (Accommodations) */}
      <HomeAccommodationsSection />

      {/* 14. Discover Local Marketplace */}
      <HomeMarketplaceSection />

      {/* 15. Your Journey. Your Way. (AI Trip Planner Preview) */}
      <HomePlannerSection />

      {/* 16 & 17. Stories & Events Highlights */}
      <HomeStoriesEventsSection />

      {/* 18 & 19. Traveller Stories & Feedback */}
      <HomeTravellerFeedbackSection />

      {/* 20 & 21. Responsible Tourism & Partner Portal Access */}
      <HomeResponsiblePartnerSection />
    </div>
  );
}

export function DestinationsPage() {
  return <Navigate to="/explore" replace />;
}

export function VendorsPage() {
  return <Navigate to="/marketplace" replace />;
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">About Jharkhand Tourism</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink-900">
          Land of Forests, Cascades &amp; Living Tribal Heritage
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-ink-600">
          Jharkhand, literally translated as the "Land of Forests", is home to breathtaking waterfalls,
          sacred heritage shrines, sprawling wildlife sanctuaries, and rich indigenous art traditions across all 24 districts.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-clay-200 bg-white/90 p-6 text-center space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-clay-700">Waterfalls &amp; Nature</p>
          <h3 className="font-display text-xl font-bold text-ink-900">Pristine Wilderness</h3>
          <p className="text-xs leading-relaxed text-ink-600">
            From Hundru and Dassam to Jonha, Lodh and Hirni Falls, experience roaring cascades amid ancient Precambrian hills.
          </p>
        </Card>

        <Card className="border-clay-200 bg-white/90 p-6 text-center space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-clay-700">Heritage &amp; Spirituality</p>
          <h3 className="font-display text-xl font-bold text-ink-900">Sacred Sanctuaries</h3>
          <p className="text-xs leading-relaxed text-ink-600">
            Baidyanath Dham, Rajrappa Maa Chhinnamasta, and the 17th-century Jagannath Temple represent timeless devotion.
          </p>
        </Card>

        <Card className="border-clay-200 bg-white/90 p-6 text-center space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-clay-700">Art &amp; Community</p>
          <h3 className="font-display text-xl font-bold text-ink-900">GI-Tagged Traditions</h3>
          <p className="text-xs leading-relaxed text-ink-600">
            Celebrate indigenous Sohrai and Khovar mural traditions, Dokra bell metal casting, and community-led sustainable tourism.
          </p>
        </Card>
      </div>

      <div className="text-center pt-4">
        <Button asChild size="lg">
          <Link to="/explore" className="inline-flex items-center gap-2">
            <span>Explore All 24 Districts</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function SignInPage() {
  return <Navigate to="/login" replace />;
}

export function SignUpPage() {
  return <Navigate to="/register" replace />;
}

export function UnauthorizedPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-3xl place-items-center px-4 py-16 sm:px-6 lg:px-8">
      <UnauthorizedState />
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-3xl place-items-center px-4 py-16 sm:px-6 lg:px-8">
      <NotFoundState />
    </div>
  );
}
