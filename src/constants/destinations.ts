export const DESTINATION_CATEGORY_VALUES = [
  'waterfall',
  'heritage',
  'tribal_culture',
  'eco',
  'craft',
  'adventure',
  'religious',
  'wildlife',
] as const;

export const DESTINATION_STATUS_VALUES = ['draft', 'published'] as const;

export type DestinationCategory = (typeof DESTINATION_CATEGORY_VALUES)[number];
export type DestinationStatus = (typeof DESTINATION_STATUS_VALUES)[number];
export type DestinationFilterCategory = DestinationCategory | 'all';

export const DESTINATION_CATEGORY_LABELS: Record<DestinationCategory, string> = {
  waterfall: 'Waterfalls',
  heritage: 'Heritage',
  tribal_culture: 'Tribal Culture',
  eco: 'Eco',
  craft: 'Craft',
  adventure: 'Adventure',
  religious: 'Religious',
  wildlife: 'Wildlife',
};

export const DESTINATION_CATEGORY_OPTIONS: Array<{
  value: DestinationFilterCategory;
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: 'waterfall', label: 'Waterfalls' },
  { value: 'heritage', label: 'Heritage' },
  { value: 'tribal_culture', label: 'Tribal Culture' },
  { value: 'eco', label: 'Eco' },
  { value: 'craft', label: 'Craft' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'religious', label: 'Religious' },
  { value: 'wildlife', label: 'Wildlife' },
];

export const DESTINATION_STATUS_LABELS: Record<DestinationStatus, string> = {
  draft: 'Draft',
  published: 'Published',
};

export const DEFAULT_DESTINATION_IMAGE =
  'https://placehold.co/1200x800/png?text=Jharkhand+Destination';

export function isDestinationCategory(value: string): value is DestinationCategory {
  return (DESTINATION_CATEGORY_VALUES as readonly string[]).includes(value);
}

export function getDestinationCategoryLabel(category: DestinationCategory): string {
  return DESTINATION_CATEGORY_LABELS[category];
}

export function getDestinationStatusLabel(status: DestinationStatus): string {
  return DESTINATION_STATUS_LABELS[status];
}
