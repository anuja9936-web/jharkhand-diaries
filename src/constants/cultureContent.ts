/**
 * Jharkhand Culture Discovery Content
 *
 * Ancestral traditions, tribal performing arts, and sacred forest philosophy.
 */

export interface CultureItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  culturalContext: string;
  region: string;
  image: string;
  tags: string[];
}

export const JHARKHAND_CULTURE: CultureItem[] = [
  {
    id: 'chhau-dance',
    name: 'Seraikela Chhau Mask Dance',
    subtitle: 'UNESCO Intangible Cultural Heritage',
    description:
      'A stylized martial dance that combines graceful acrobatics, mythic heroism, and rhythmic percussion. Dancers wear exquisitely crafted terracotta and papier-mâché masks representing gods, demons, animals, and seasonal elements.',
    culturalContext:
      'Patronized historically by the royal house of Seraikela, Chhau evolved from tribal martial arts into a world-renowned performance tradition staged during Chaitra Parva in April.',
    region: 'Saraikela Kharsawan, East Singhbhum',
    image: '/images/culture/chhau-dance.jpg',
    tags: ['dance', 'UNESCO', 'mask', 'martial', 'chhau', 'seraikela'],
  },
  {
    id: 'sarna-dharam',
    name: 'Sarna: Sacred Grove Reverence',
    subtitle: 'Nature Worship & Forest Cosmology',
    description:
      'The ancestral faith of the Adivasis centred around the Jaher Sthan (sacred Sal tree grove). Community elders worship Marang Buru (Great Mountain) and Singbonga (Sun Divinity), protecting natural ecosystems as living deities.',
    culturalContext:
      'Sarna philosophy teaches that humans are stewards rather than masters of nature. Cutting trees in the sacred grove is strictly forbidden, preserving pristine biodiversity pockets across the state.',
    region: 'Ranchi, Khunti, Gumla, Simdega, Latehar',
    image: '/images/culture/sarna-worship.jpg',
    tags: ['sacred grove', 'sarna', 'nature worship', 'sal tree', 'indigenous'],
  },
  {
    id: 'mandar-nagara',
    name: 'Mandar & Nagara Percussion',
    subtitle: 'The Heartbeat of Chotanagpur Plateau',
    description:
      'Traditional double-headed earthen drums (Mandar) and large kettle drums (Nagara) crafted from baked river clay and hide. Their resonating syncopated rhythms accompany circular community dances from sunset till dawn.',
    culturalContext:
      'Every tribal village possesses a dedicated youth dormitory (Akhra) where generations learn drumming, Jhumar folk lyrics, and traditional flute melodies passed down verbally.',
    region: 'Across all 24 Districts',
    image: '/images/culture/mandar-drums.jpg',
    tags: ['music', 'drum', 'mandar', 'percussion', 'akhra', 'folk'],
  },
  {
    id: 'johar-hospitality',
    name: 'Johar Spirit & Village Community Life',
    subtitle: 'Equality, Respect & Rural Welcome',
    description:
      '"Johar" represents deep respect, equality, and reverence for all living beings. Guests entering rural Jharkhand villages are traditionally welcomed with fresh spring water in brass lotas, marua roti, and warm smiles.',
    culturalContext:
      'The traditional Parha Panchayat system governs tribal villages with consensual community leadership, shared forest resources, and equal social standing across genders.',
    region: 'Rural Jharkhand Villages',
    image: '/images/destinations/patratu-valley.jpg',
    tags: ['johar', 'hospitality', 'village', 'community', 'tradition'],
  },
];
