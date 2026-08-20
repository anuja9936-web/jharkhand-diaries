/**
 * Jharkhand Adventure Discovery Content
 *
 * Trekking trails, cliff walks, camping retreats, and lake water sports.
 */

export interface AdventureItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  activityType: 'trekking' | 'camping' | 'water_sports' | 'climbing' | 'nature_trail';
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  bestSeason: string;
  district: string;
  image: string;
  highlights: string[];
}

export const JHARKHAND_ADVENTURES: AdventureItem[] = [
  {
    id: 'parasnath-trek',
    name: 'Shikharji / Parasnath Summit Trek',
    subtitle: 'Highest Peak in Jharkhand (1,365m)',
    description:
      'A rewarding 27-kilometer pilgrimage and trekking trail winding through dense deciduous forests of the Parasnath range. Climbers encounter cool mountain breezes, ancient Jain shrines, and panoramic sunrises over Giridih plains.',
    activityType: 'trekking',
    difficulty: 'Challenging',
    bestSeason: 'October to March',
    district: 'Giridih',
    image: '/images/adventure/parasnath-trek.jpg',
    highlights: ['Highest peak in Jharkhand', 'Panoramic hilltop vistas', 'Dense Sal forest canopy', 'Sacred peak shrines'],
  },
  {
    id: 'patratu-valley-drive-camp',
    name: 'Patratu Valley Hairpin Trail & Lake Camping',
    subtitle: 'Winding Ghat Road & Water Reservoir',
    description:
      'Experience 30 hairpin turns descending down the lush Patratu Valley into the shimmering Patratu Lake reservoir. Ideal for sunset valley photography, lakeside night stargazing, and speedboating.',
    activityType: 'camping',
    difficulty: 'Easy',
    bestSeason: 'September to March',
    district: 'Ramgarh',
    image: '/images/destinations/patratu-valley.jpg',
    highlights: ['Scenic winding serpentine ghat', 'Lakeside tent camping', 'Boating & jet skiing', 'Sunset cliff viewpoint'],
  },
  {
    id: 'netarhat-pine-forest-trail',
    name: 'Netarhat Pine Forest & Magnolia Point Sunset Trek',
    subtitle: 'Queen of Chotanagpur Nature Trail',
    description:
      'Hike through fragrant alpine-like pine forests and quiet eucalyptus groves perched 1,070 meters above sea level. Magnolia Point offers one of eastern India’s most dramatic cliffside sunset viewpoints.',
    activityType: 'nature_trail',
    difficulty: 'Easy',
    bestSeason: 'October to April',
    district: 'Latehar',
    image: '/images/destinations/netarhat.jpg',
    highlights: ['Alpine-style pine woods', 'Magnolia Point cliff sunset', 'Koel viewpoint sunrise', 'Cool plateau climate'],
  },
  {
    id: 'dalma-wildlife-canopy-trek',
    name: 'Dalma Hills Wilderness & Elephant Corridor Trek',
    subtitle: 'Subarnarekha River Valley Overlook',
    description:
      'Trek through 195 square kilometres of dry deciduous forests and bamboo brakes home to wild Asian elephants, barking deer, and over 150 species of birds. The trail ascends up to Dalma Peak temple.',
    activityType: 'nature_trail',
    difficulty: 'Moderate',
    bestSeason: 'November to March',
    district: 'East Singhbhum',
    image: '/images/destinations/dalma-hills.jpg',
    highlights: ['Elephant sanctuary habitat', 'Dalma peak viewpoint', 'Subarnarekha river views', 'Forest watchtower birding'],
  },
  {
    id: 'dimna-lake-kayaking',
    name: 'Dimna Lake Kayaking & Lakeside Trail',
    subtitle: 'Water Adventure at the Foothills of Dalma',
    description:
      'A serene water reservoir nestled beneath the Dalma mountain range offering quiet kayaking, paddle boating, and lakeside cycling trails along forested shores.',
    activityType: 'water_sports',
    difficulty: 'Easy',
    bestSeason: 'October to February',
    district: 'East Singhbhum',
    image: '/images/experiences/lake-kayaking.jpg',
    highlights: ['Lake kayaking & boating', 'Foothills trail running', 'Migratory winter bird spotting', 'Picnic shores'],
  },
];
