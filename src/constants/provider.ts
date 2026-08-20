export const PROVIDER_CATEGORY_OPTIONS = [
  { value: 'destination', label: 'Destination owner / manager' },
  { value: 'guide', label: 'Local guide' },
  { value: 'artisan', label: 'Artisan / craft seller' },
  { value: 'handicraft', label: 'Handicraft seller' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'restaurant', label: 'Restaurant / food provider' },
  { value: 'experience', label: 'Cultural experience provider' },
  { value: 'transport', label: 'Transport provider' },
  { value: 'local_business', label: 'Local tourism business' },
  { value: 'other', label: 'Other' },
] as const;

export const PROVIDER_OFFERING_KIND_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'experience', label: 'Experience' },
  { value: 'stay', label: 'Stay' },
] as const;

export function getProviderCategoryLabel(value: string) {
  return PROVIDER_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getProviderOfferingKindLabel(value: string) {
  return PROVIDER_OFFERING_KIND_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
