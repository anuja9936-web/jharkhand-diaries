/**
 * Centralized Image Registry for Jharkhand Diaries
 *
 * Ensures all visual assets are strictly mapped to their relevant domain
 * (e.g. Cuisine has food photos, Art has real craft photos, Stays has lodging).
 */

export interface ContentImage {
  src: string;
  alt: string;
  category: string;
  title: string;
  location?: string;
  caption?: string;
}

export const DESTINATION_IMAGES = {
  PATRATU_VALLEY: '/images/destinations/patratu-valley.jpg',
  DASSAM_FALLS: '/images/destinations/dassam-falls.jpg',
  NETARHAT: '/images/destinations/netarhat.jpg',
  HUNDRU_FALLS: '/images/destinations/hundru-falls.jpg',
  BETLA_NATIONAL_PARK: '/images/destinations/betla-national-park.jpg',
  DEOGHAR_BAIDYANATH: '/images/destinations/deoghar-baidyanath.jpg',
  DALMA_HILLS: '/images/destinations/dalma-hills.jpg',
  JONHA_FALLS: '/images/destinations/jonha-falls.jpg',
  JAGANNATH_TEMPLE: '/images/destinations/jagannath-temple.jpg',
  RAJRAPPA: '/images/destinations/rajrappa.jpg',
} as const;

export const CUISINE_IMAGES = {
  DHUSKA: '/images/cuisine/dhuska.jpg',
  CHILKA_ROTI: '/images/cuisine/chilka-roti.jpg',
  RUGRA_CURRY: '/images/cuisine/rugra.jpg',
  THEKUA: '/images/cuisine/thekua.jpg',
  ARSA: '/images/cuisine/arsa.jpg',
  KARIL_BAMBOO: '/images/cuisine/karil.jpg',
} as const;

export const ART_CRAFT_IMAGES = {
  SOHRAI_MURAL: '/images/art/sohrai-painting.jpg',
  KHOVAR_ART: '/images/art/khovar-art.jpg',
  DOKRA_CASTING: '/images/art/dokra-craft.jpg',
  BAMBOO_CRAFT: '/images/art/bamboo-craft.jpg',
  TUSSAR_SILK: '/images/art/tussar-silk.jpg',
  TRIBAL_JEWELLERY: '/images/art/tribal-jewellery.jpg',
} as const;

export const STAY_IMAGES = {
  PINE_ECO_LODGE: '/images/stays/pine-eco-lodge.jpg',
  LAKE_RESORT: '/images/stays/lake-resort.jpg',
  HERITAGE_HOMESTAY: '/images/stays/heritage-homestay.jpg',
  SAFARI_TENT: '/images/stays/safari-tent.jpg',
} as const;

export const EXPERIENCE_IMAGES = {
  SOHRAI_WORKSHOP: '/images/experiences/sohrai-workshop.jpg',
  STARGAZING_CAMP: '/images/experiences/stargazing-camp.jpg',
  LAKE_KAYAKING: '/images/experiences/lake-kayaking.jpg',
  TRIBAL_COOKING: '/images/experiences/tribal-cooking.jpg',
} as const;

export const PRODUCT_IMAGES = {
  SOHRAI_CANVAS: '/images/products/sohrai-canvas.jpg',
  DOKRA_FIGURINE: '/images/products/dokra-figurine.jpg',
  BAMBOO_LAMP: '/images/products/bamboo-lamp.jpg',
  WILD_HONEY: '/images/products/wild-honey.jpg',
  TUSSAR_STOLE: '/images/products/tussar-stole.jpg',
} as const;

export const CULTURE_IMAGES = {
  CHHAU_DANCE: '/images/culture/chhau-dance.jpg',
  MANDAR_DRUMS: '/images/culture/mandar-drums.jpg',
  SARNA_WORSHIP: '/images/culture/sarna-worship.jpg',
} as const;

export const ADVENTURE_IMAGES = {
  PARASNATH_TREK: '/images/adventure/parasnath-trek.jpg',
  LAKE_CAMPING: '/images/adventure/lake-camping.jpg',
  GORGE_HIKING: '/images/adventure/gorge-hiking.jpg',
} as const;
