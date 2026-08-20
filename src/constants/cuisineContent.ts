/**
 * Jharkhand Cuisine Discovery Content
 *
 * Served from static config because the destination DB has no cuisine rows.
 * If a cuisine DB table is added later, swap this file for a service call.
 */

export interface CuisineItem {
  id: string;
  name: string;
  description: string;
  region: string;
  culturalSignificance: string;
  whereToTry: string;
  tags: string[];
  image: string;
  type: 'main' | 'snack' | 'sweet' | 'drink';
}

export const JHARKHAND_CUISINE: CuisineItem[] = [
  {
    id: 'dhuska',
    name: 'Dhuska',
    description:
      'Deep-fried rice-and-lentil pancakes with a crisp golden shell and soft interior. A beloved street food eaten at festivals and daily markets across Jharkhand.',
    region: 'Ranchi, Hazaribagh',
    culturalSignificance:
      'A staple snack at Sarhul and Karma festivals, shared across tribal communities as a symbol of hospitality.',
    whereToTry: 'Ranchi street markets, Hazaribagh weekly bazaars',
    tags: ['street food', 'fried', 'festival', 'vegetarian'],
    image: '/images/cuisine/dhuska.jpg',
    type: 'snack',
  },
  {
    id: 'chilka-roti',
    name: 'Chilka Roti',
    description:
      'A traditional flatbread made from fermented rice batter, thin and slightly sour, cooked on an iron pan. Often served with vegetables or chutney for breakfast.',
    region: 'Across Jharkhand',
    culturalSignificance:
      'A daily staple in tribal households, representing the self-sufficiency of indigenous communities who have grown rice in these lands for centuries.',
    whereToTry: 'Tribal homestays, village morning markets',
    tags: ['bread', 'rice', 'breakfast', 'tribal', 'fermented'],
    image: '/images/cuisine/chilka-roti.jpg',
    type: 'main',
  },
  {
    id: 'rugra',
    name: 'Rugra (Wild Mushroom Curry)',
    description:
      'A rare seasonal delicacy — wild forest mushrooms harvested during monsoon and cooked in a dry spiced curry. Prized for their earthy flavour found nowhere else.',
    region: 'Singhbhum, Saranda Forest belt',
    culturalSignificance:
      'Tribal communities have harvested Rugra from Sal forests for generations. The harvest season is a community event marking the arrival of rains.',
    whereToTry: 'Singhbhum village meals during July–August, forest-side dhabas near Saranda',
    tags: ['wild', 'forest', 'mushroom', 'seasonal', 'tribal'],
    image: '/images/cuisine/rugra.jpg',
    type: 'main',
  },
  {
    id: 'thekua',
    name: 'Thekua',
    description:
      'Hard, sweet biscuits made from wheat flour, jaggery and ghee, pressed into traditional moulds to create ornate geometric patterns. Prepared with devotion.',
    region: 'Dhanbad, Giridih, Ranchi',
    culturalSignificance:
      'The sacred offering of Chhath Puja — prepared by fasting women and offered to the Sun God at riverside ghats. A symbol of faith and renewal.',
    whereToTry: 'Home kitchens during Chhath Puja season (October–November), sweet shops year-round in Dhanbad',
    tags: ['sweet', 'festival', 'chhath', 'baked', 'jaggery'],
    image: '/images/cuisine/thekua.jpg',
    type: 'sweet',
  },
  {
    id: 'arsa',
    name: 'Arsa',
    description:
      'A festive sweet made from soaked rice ground into a thick batter, sweetened with jaggery and fried into golden discs. Distinctly soft on the inside, crisp outside.',
    region: 'Ranchi, Gumla, Lohardaga',
    culturalSignificance:
      'Prepared exclusively for Sarhul and Karma festivals by Oraon and Munda communities as offerings to the Sarna deity of the Sal tree.',
    whereToTry: 'Tribal villages during Sarhul (March–April) and Karma (August–September)',
    tags: ['sweet', 'fried', 'festival', 'tribal', 'rice'],
    image: '/images/cuisine/arsa.jpg',
    type: 'sweet',
  },
  {
    id: 'karil',
    name: 'Karil (Bamboo Shoot Curry)',
    description:
      'Tender bamboo shoots harvested in early monsoon, slow-cooked with mustard oil, turmeric and local spices. A fiercely seasonal and prized forest delicacy.',
    region: 'Hazaribagh, Koderma, Bokaro forest areas',
    culturalSignificance:
      'Bamboo is sacred in Jharkhand tribal culture — used in construction, baskets and ceremonies. Karil cooking connects food to forest ecology.',
    whereToTry: 'Hazaribagh and Koderma region village meals during June–August monsoon',
    tags: ['bamboo', 'forest', 'seasonal', 'tribal', 'monsoon'],
    image: '/images/cuisine/karil.jpg',
    type: 'main',
  },
];
