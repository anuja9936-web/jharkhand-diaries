/**
 * Jharkhand Art & Craft Discovery Content
 *
 * Traditional craft heritage of Jharkhand's indigenous artisans.
 * Connects directly to the Marketplace and Provider Cultural Workshops.
 */

export interface ArtCraftItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  culturalContext: string;
  region: string;
  materials: string;
  giTagged: boolean;
  image: string;
  tags: string[];
  marketplaceCategory?: string;
}

export const JHARKHAND_ART_CRAFTS: ArtCraftItem[] = [
  {
    id: 'sohrai-art',
    name: 'Sohrai Mural Painting',
    subtitle: 'GI-Tagged Indigenous Mud Wall Art',
    description:
      'Ancient ritualistic wall murals painted by tribal women during the post-harvest Sohrai festival. Created using chewed twigs, cloth swabs, and natural red, black, yellow, and white earth pigments depicting wildlife, sacred cows, and nature motifs.',
    culturalContext:
      'Practiced primarily by Santali, Oraon, and Prajapati women in Hazaribagh. The art celebrates harvest bounty, ancestral protection, and harmonious coexistence with forest animals.',
    region: 'Hazaribagh, Dumka, Godda',
    materials: 'Dhudhi (white clay), Lalmati (red oxide), Charak (black clay), natural earth pigments',
    giTagged: true,
    image: '/images/art/sohrai-painting.jpg',
    tags: ['mural', 'painting', 'GI-tag', 'tribal art', 'natural pigments', 'hazaribagh'],
    marketplaceCategory: 'art',
  },
  {
    id: 'khovar-art',
    name: 'Khovar Bridal Art',
    subtitle: 'GI-Tagged Comb-Cut Cave Tradition',
    description:
      'Monochrome bridal art practiced in wedding chambers. A layer of black manganese-rich clay is coated over mud walls, followed by wet white kaolin clay, which is then incised with broken comb teeth or bamboo scrapers to reveal bold animal and fertility symbols.',
    culturalContext:
      'Created by maternal relatives to bless newlywed couples with fertility, resilience, and prosperity during the marriage season from January to June.',
    region: 'Hazaribagh, Chatra, Koderma',
    materials: 'Black manganese clay, White kaolin clay, combs, bamboo slivers',
    giTagged: true,
    image: '/images/art/khovar-art.jpg',
    tags: ['bridal', 'comb-cut', 'GI-tag', 'wedding', 'monochrome', 'tribal'],
    marketplaceCategory: 'art',
  },
  {
    id: 'dokra-craft',
    name: 'Dokra Bell Metal Casting',
    subtitle: '4,000-Year-Old Lost-Wax Bronze Craft',
    description:
      'One of the world’s oldest metallurgical crafts, dating back to the Indus Valley Dancing Girl. Non-ferrous metal is cast using beeswax cords over clay moulds, producing rustic figurines of musicians, elephants, deities, and oil lamps.',
    culturalContext:
      'Handcrafted by the Malhor and Karmakar metal-smithing communities. Each piece is unique because the clay mould must be broken open to retrieve the cooled bronze casting.',
    region: 'Khunti, East Singhbhum, Ranchi',
    materials: 'Brass, bell metal, beeswax, river clay, charcoal furnace',
    giTagged: false,
    image: '/images/art/dokra-craft.jpg',
    tags: ['metalwork', 'lost-wax', 'bronze', 'figurines', 'ancient', 'handicraft'],
    marketplaceCategory: 'handicrafts',
  },
  {
    id: 'bamboo-craft',
    name: 'Tribal Bamboo & Cane Weaving',
    subtitle: 'Sustainable Forest Craftsmanship',
    description:
      'Intricately woven bamboo baskets, winnowing fans (Soop), fishing traps (Kumni), lampshades, and modern home decor made from flexible Sal and forest bamboo poles harvested by indigenous craftsmen.',
    culturalContext:
      'The Mahli tribe specializes in traditional bamboo weaving, transforming renewable forest reeds into durable everyday utility and artistic homeware.',
    region: 'Simdega, Gumla, West Singhbhum',
    materials: 'Mature green bamboo, natural cane, herbal dyes',
    giTagged: false,
    image: '/images/art/bamboo-craft.jpg',
    tags: ['bamboo', 'weaving', 'sustainable', 'eco-craft', 'home decor', 'mahli'],
    marketplaceCategory: 'handicrafts',
  },
  {
    id: 'tussar-silk',
    name: 'Kuchai Tussar Silk',
    subtitle: 'Organic Wild Forest Silk',
    description:
      'Rich golden-hued silk cultivated from wild silkworms (Antheraea paphia) feeding on forest Asan and Arjun trees. Hand-reeled and handloom-woven into luxurious sarees, dupattas, and stoles with natural breathable textures.',
    culturalContext:
      'Jharkhand is India’s largest producer of wild Tussar silk. Tribal rearers in Saraikela and Kharsawan practice organic cocoon harvesting with zero chemical pesticides.',
    region: 'Saraikela Kharsawan, Chaibasa, Godda',
    materials: 'Wild silkworm cocoons, handloom pit looms, organic vegetable dyes',
    giTagged: true,
    image: '/images/art/tussar-silk.jpg',
    tags: ['textiles', 'silk', 'tussar', 'handloom', 'organic', 'weavers'],
    marketplaceCategory: 'textiles',
  },
  {
    id: 'tribal-jewellery',
    name: 'Jharkhand Tribal Silver & Brass Jewellery',
    subtitle: 'Traditional Hasli, Tarpat & Bangle Ornaments',
    description:
      'Heirloom jewellery crafted from white metal, bell brass, and oxidized silver. Features solid torque neckpieces (Hasli), ear cuffs (Tarpat), anklets (Pairi), and geometric coin necklaces worn during community dances.',
    culturalContext:
      'Worn by Munda, Oraon, and Ho women for festive occasions and ritual dances. Heavy ornaments symbolize family heritage and dignity within village assemblies.',
    region: 'Ranchi, Khunti, Gumla, Dumka',
    materials: 'Oxidized silver, bell metal, brass coins, cotton threading',
    giTagged: false,
    image: '/images/art/tribal-jewellery.jpg',
    tags: ['jewellery', 'silver', 'brass', 'hasli', 'traditional ornaments', 'tribal'],
    marketplaceCategory: 'accessories',
  },
];
