/**
 * Jharkhand Festival Discovery Content
 *
 * Evergreen cultural festival data — no invented dates.
 * Season information is used instead of specific event dates.
 * If a live event calendar is later added to Supabase, swap this for a service call.
 */

export interface FestivalItem {
  id: string;
  name: string;
  description: string;
  season: string;
  month: string; // approximate month(s) for planning
  culturalContext: string;
  region: string;
  community: string;
  whatToExpect: string[];
  image: string;
  category: 'tribal' | 'religious' | 'harvest' | 'nature';
}

export const JHARKHAND_FESTIVALS: FestivalItem[] = [
  {
    id: 'sarhul',
    name: 'Sarhul',
    description:
      'The most important festival of the Oraon, Munda and Ho tribes — a celebration of the Sal tree in bloom, marking the tribal new year and the arrival of spring. Priests perform sacred rituals at the Sarna grove, followed by community dancing and feasting.',
    season: 'Spring',
    month: 'March – April',
    culturalContext:
      'Sarhul means "flower of the Sal tree" and is a deeply spiritual communion with nature. The Pahan (village priest) performs rituals to seek the blessings of the Sarna deity for a good harvest. No work is done for three days.',
    region: 'Ranchi, Khunti, Gumla, Simdega',
    community: 'Oraon, Munda, Ho tribes',
    whatToExpect: [
      'Ritual worship at village Sarna (sacred grove)',
      'Traditional Jhumar and Karma dances with Mandar drums',
      'Communal feasting on Arsa and Dhuska',
      'Floral processions through village streets',
      'Traditional tribal attire — beads, feathers and hand-woven cloth',
    ],
    image: '/images/culture/sarna-worship.jpg',
    category: 'nature',
  },
  {
    id: 'karma',
    name: 'Karma Puja',
    description:
      'A festival honouring the Karma tree — worshipped for prosperity, good health and a bountiful harvest. Young women fast and perform rituals around freshly cut Karma branches planted in the village courtyard, then immerse them in a river.',
    season: 'Late Monsoon',
    month: 'August – September',
    culturalContext:
      'Karma is the deity of fate, fortune and good karma. The festival is led by unmarried women who pray for their family\'s health and prosperity. Communities dance through the night to Mandar and Nagara drums.',
    region: 'Across Jharkhand, especially Hazaribagh, Ramgarh',
    community: 'Oraon, Munda, Santali tribes',
    whatToExpect: [
      'Karma branch worship ceremony at the village centre',
      'All-night dancing and singing',
      'Women in traditional attire carrying Karma branches to the river',
      'Community feasting and folk music',
    ],
    image: '/images/culture/chhau-dance.jpg',
    category: 'harvest',
  },
  {
    id: 'sohrai',
    name: 'Sohrai',
    description:
      'The harvest festival of joy — celebrated after the Kharif harvest when Santali and other communities decorate their homes with elaborate Sohrai and Khovar wall paintings, worship cattle for their role in farming, and celebrate community prosperity.',
    season: 'Post-Monsoon / Winter onset',
    month: 'October – November',
    culturalContext:
      'Sohrai marks the end of agricultural labour. Homes are freshly whitewashed and then hand-painted with natural pigments in intricate geometric and animal motifs — the art form is now GI-tagged as Sohrai art of Jharkhand.',
    region: 'Hazaribagh, Godda, Dumka, Deoghar (Santhal Pargana)',
    community: 'Santali community, also Oraon',
    whatToExpect: [
      'Live Sohrai painting demonstrations on freshly plastered walls',
      'Cattle worship and processions',
      'Traditional music and dance performances',
      'Markets selling handcrafted Sohrai-motif pottery and art',
      'Village homestay experiences during festival period',
    ],
    image: '/images/art/sohrai-painting.jpg',
    category: 'harvest',
  },
  {
    id: 'tusu-parab',
    name: 'Tusu Parab',
    description:
      'A women-centric harvest festival celebrated on Makar Sankranti by Kurmi and tribal communities. Beautifully decorated floats called "Choudal" are paraded through the village and then immersed in rivers at sunrise to the sound of song and drums.',
    season: 'Winter',
    month: 'January (Makar Sankranti)',
    culturalContext:
      'Tusu is worshipped as a goddess of harvest and young women. Girls observe a monthlong devotion, singing Tusu songs at dusk each evening. The festival is notable for its elaborate bamboo-and-paper floats, which are considered folk art.',
    region: 'Purulia, Dhanbad, Bokaro, Giridih, West Singhbhum',
    community: 'Kurmi, Mahato, tribal communities',
    whatToExpect: [
      'Sunrise river immersion ceremony',
      'Competitive float (Choudal) displays',
      'Traditional Tusu folk songs sung by women',
      'Village fairs with local crafts and food',
    ],
    image: '/images/destinations/patratu-valley.jpg',
    category: 'tribal',
  },
  {
    id: 'chhath-puja',
    name: 'Chhath Puja',
    description:
      'An ancient solar festival dedicated to Surya (the Sun God) and Chhathi Maiya. Devotees fast for three to four days, observing strict rituals at riverbanks during sunset and sunrise. One of the most spiritually intense festivals in Jharkhand.',
    season: 'Autumn',
    month: 'October – November (6 days after Diwali)',
    culturalContext:
      'Chhath is a festival of gratitude for the life-giving energy of the Sun. The fasting is observed primarily by women and is considered one of the most demanding religious observances — no food or water for 36 hours.',
    region: 'Across Jharkhand, Dhanbad, Bokaro, Ranchi rivers',
    community: 'Hindu communities, especially Bihari origin',
    whatToExpect: [
      'Mass gatherings at riverbanks — thousands of devotees in traditional attire',
      'Sunset and sunrise arghya (offering) ceremonies',
      'Thekua and fruit offerings arranged on bamboo baskets',
      'Devotional songs (Chhath geet) filling the air',
      'A deeply moving visual spectacle at dawn',
    ],
    image: '/images/destinations/rajrappa.jpg',
    category: 'religious',
  },
  {
    id: 'fagua-holi',
    name: 'Fagua (Tribal Holi)',
    description:
      'The Jharkhand version of Holi — known as Fagua — has a distinctly tribal character. Communities in the Santhal Pargana and Kolhan regions celebrate with traditional dance, folk songs and colour, alongside rituals not seen elsewhere.',
    season: 'Spring',
    month: 'March (Phalgun full moon)',
    culturalContext:
      'Fagua celebrates the end of winter and the return of fertility to the land. Tribal communities perform the Jhumar dance around a bonfire the night before, burning effigies of Holika in a ceremony tied to agricultural cycles.',
    region: 'Santhal Pargana, Singhbhum, Ranchi',
    community: 'Santali, Oraon, Munda communities',
    whatToExpect: [
      'Colourful processions through village lanes',
      'Traditional Jhumar dance performances',
      'Holika bonfire ceremony at dusk',
      'Natural colours made from flowers and herbs',
    ],
    image: '/images/culture/mandar-drums.jpg',
    category: 'tribal',
  },
];
