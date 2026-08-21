import { getUserTrips } from '../trips/tripService';
import { getUserFavourites } from '../favourites/favouriteService';
import { getMyTouristBookings } from './touristBookingService';

export interface EcoActivity {
  id: string;
  title: string;
  category: 'stay' | 'transport' | 'trek' | 'artisan' | 'community' | 'trip';
  points: number;
  date: string;
  status: 'verified' | 'pending';
  description: string;
  badgeEligible?: string;
}

export interface EcoBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  pointsRequirement: number;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

export interface EcoTier {
  name: string;
  hindiName: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  badge: string;
  perks: string[];
}

export const ECO_TIERS: EcoTier[] = [
  {
    name: 'Nature Friend',
    hindiName: 'Prakriti Mitr (प्रकृति मित्र)',
    minPoints: 0,
    maxPoints: 150,
    color: 'forest-600',
    badge: '🌱',
    perks: ['Digital Eco-Passport', 'Access to Verified Eco-Stays', 'Johar AI Eco-Routes'],
  },
  {
    name: 'Forest Guardian',
    hindiName: 'Van Rakshak (वन रक्षक)',
    minPoints: 151,
    maxPoints: 400,
    color: 'emerald-600',
    badge: '🌿',
    perks: ['Priority Homestay Booking', 'Local Artisan Guild Invites', 'Special Cultural Trail Badges'],
  },
  {
    name: 'Chotanagpur Trailblazer',
    hindiName: 'Path Pradarshak (पथ प्रदर्शक)',
    minPoints: 401,
    maxPoints: 800,
    color: 'teal-600',
    badge: '🌲',
    perks: ['Exclusive Forest Ranger Treks', 'Master Artisan Masterclass Discounts', 'Featured Community Contributor'],
  },
  {
    name: 'Sohrai Heritage Guardian',
    hindiName: 'Dharohar Sanrakshak (धरोहर संरक्षक)',
    minPoints: 801,
    maxPoints: 2000,
    color: 'amber-600',
    badge: '👑',
    perks: ['VIP Tribal Festival Pass', 'Government Heritage Recognition', 'Direct Community Host Meetups'],
  },
];

export const ALL_ECO_BADGES: EcoBadge[] = [
  {
    id: 'eco-pioneer',
    title: 'Eco Pioneer',
    description: 'Began your sustainable journey across Jharkhand',
    icon: '🌱',
    pointsRequirement: 50,
    unlocked: true,
    unlockedAt: '2026-08-01',
    category: 'Onboarding',
  },
  {
    id: 'waterfall-wanderer',
    title: 'Waterfall Wanderer',
    description: 'Explored Hundru, Jonha, or Dassam falls with leave-no-trace ethics',
    icon: '🌊',
    pointsRequirement: 120,
    unlocked: true,
    unlockedAt: '2026-08-10',
    category: 'Nature',
  },
  {
    id: 'artisan-patron',
    title: 'Artisan Patron',
    description: 'Supported indigenous GI-tagged Sohrai or Dokra craftspeople',
    icon: '🎨',
    pointsRequirement: 250,
    unlocked: false,
    category: 'Culture',
  },
  {
    id: 'eco-homestay',
    title: 'Forest Dweller',
    description: 'Stayed at a solar-powered tribal homestay or certified eco-resort',
    icon: '🏡',
    pointsRequirement: 350,
    unlocked: false,
    category: 'Stays',
  },
  {
    id: 'trailblazer',
    title: 'Netarhat Trailblazer',
    description: 'Trek through the Latehar pine forests and Magnolia sunset point',
    icon: '⛰️',
    pointsRequirement: 500,
    unlocked: false,
    category: 'Adventure',
  },
  {
    id: 'sacred-groves',
    title: 'Sarna Sthal Guardian',
    description: 'Visited sacred tribal groves with community elders and respected nature rituals',
    icon: '🌳',
    pointsRequirement: 700,
    unlocked: false,
    category: 'Heritage',
  },
];

export interface EcoPointsSummary {
  totalPoints: number;
  currentTier: EcoTier;
  nextTier: EcoTier | null;
  progressPercent: number;
  pointsToNextTier: number;
  activities: EcoActivity[];
  badges: EcoBadge[];
}

/**
 * Calculates real live Eco Points based on user's Supabase activity
 */
export async function getTouristEcoSummary(): Promise<EcoPointsSummary> {
  let basePoints = 120; // Default welcome eco bonus

  const activities: EcoActivity[] = [
    {
      id: 'act-welcome',
      title: 'Joined Sustainable Jharkhand Tourism',
      category: 'community',
      points: 50,
      date: '2026-08-01',
      status: 'verified',
      description: 'Pledged to follow responsible Leave-No-Trace tourism principles across all 24 districts.',
      badgeEligible: 'Eco Pioneer',
    },
    {
      id: 'act-green-quiz',
      title: 'Completed Jharkhand Eco-Heritage Primer',
      category: 'community',
      points: 70,
      date: '2026-08-05',
      status: 'verified',
      description: 'Learned about Sarna sacred groves, Sohrai mud murals, and tribal conservation lore.',
      badgeEligible: 'Waterfall Wanderer',
    },
  ];

  try {
    // 1. Check saved trips (+40 pts each)
    const trips = await getUserTrips();
    if (trips && trips.length > 0) {
      trips.forEach((trip, idx) => {
        const pts = 40;
        basePoints += pts;
        activities.unshift({
          id: `act-trip-${trip.id || idx}`,
          title: `Planned Eco-Itinerary: ${trip.title}`,
          category: 'trip',
          points: pts,
          date: trip.created_at ? trip.created_at.split('T')[0] : '2026-08-15',
          status: 'verified',
          description: `Constructed a personalized itinerary with ${trip.trip_destinations?.length || 1} sustainable stops.`,
        });
      });
    }
  } catch (err) {
    console.warn('[ecoPointsService] Trips fetch notice:', err);
  }

  try {
    // 2. Check saved favourites (+10 pts each)
    const favourites = await getUserFavourites();
    if (favourites && favourites.length > 0) {
      const favPts = Math.min(favourites.length * 10, 80);
      basePoints += favPts;
      activities.unshift({
        id: 'act-favs',
        title: `Curated ${favourites.length} Green Destinations`,
        category: 'community',
        points: favPts,
        date: new Date().toISOString().split('T')[0],
        status: 'verified',
        description: 'Bookmarked eco-conscious wildlife sanctuaries and serene hill trails.',
      });
    }
  } catch (err) {
    console.warn('[ecoPointsService] Favourites fetch notice:', err);
  }

  try {
    // 3. Check bookings / requests (+50 pts each)
    const bookings = await getMyTouristBookings();
    if (bookings && bookings.length > 0) {
      bookings.forEach((booking, idx) => {
        const pts = 50;
        basePoints += pts;
        activities.unshift({
          id: `act-booking-${booking.id || idx}`,
          title: `Local Provider Request: ${booking.offering?.name || 'Jharkhand Service'}`,
          category: booking.offering?.kind === 'stay' ? 'stay' : 'transport',
          points: pts,
          date: booking.created_at ? booking.created_at.split('T')[0] : '2026-08-18',
          status: 'verified',
          description: 'Supported local district tourism ecosystem and homestay providers directly.',
        });
      });
    }
  } catch (err) {
    console.warn('[ecoPointsService] Bookings fetch notice:', err);
  }

  // Determine current tier
  let currentTier = ECO_TIERS[0];
  let nextTier: EcoTier | null = ECO_TIERS[1];

  for (let i = 0; i < ECO_TIERS.length; i++) {
    if (basePoints >= ECO_TIERS[i].minPoints && basePoints <= ECO_TIERS[i].maxPoints) {
      currentTier = ECO_TIERS[i];
      nextTier = ECO_TIERS[i + 1] || null;
      break;
    } else if (i === ECO_TIERS.length - 1 && basePoints > ECO_TIERS[i].maxPoints) {
      currentTier = ECO_TIERS[i];
      nextTier = null;
    }
  }

  const tierSpan = nextTier ? nextTier.minPoints - currentTier.minPoints : 500;
  const earnedInTier = basePoints - currentTier.minPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInTier / tierSpan) * 100)));
  const pointsToNextTier = nextTier ? Math.max(0, nextTier.minPoints - basePoints) : 0;

  // Calculate unlocked badges based on total points
  const dynamicBadges = ALL_ECO_BADGES.map((b) => ({
    ...b,
    unlocked: basePoints >= b.pointsRequirement,
    unlockedAt: basePoints >= b.pointsRequirement ? b.unlockedAt || '2026-08-15' : undefined,
  }));

  return {
    totalPoints: basePoints,
    currentTier,
    nextTier,
    progressPercent,
    pointsToNextTier,
    activities,
    badges: dynamicBadges,
  };
}
