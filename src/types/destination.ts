import type {
  DestinationCategory,
  DestinationStatus,
} from '../constants/destinations';

export type { DestinationCategory, DestinationStatus } from '../constants/destinations';

export interface Destination {
  id: string;
  provider_id?: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  district: string;
  category: DestinationCategory;
  latitude: number | null;
  longitude: number | null;
  cover_image: string | null;
  gallery: string[] | null;
  eco_zone: boolean;
  best_time: string | null;
  entry_fee: number | null;
  status: DestinationStatus;
  created_at: string;
  updated_at: string;
}
