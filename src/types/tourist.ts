import type { Destination } from './destination';

export interface FavouriteRecord {
  id: string;
  user_id: string;
  destination_id: string;
  created_at: string;
  destination?: Destination;
}

export interface TripRecord {
  id: string;
  user_id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  start_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  trip_destinations?: TripDestinationRecord[];
}

export interface TripDestinationRecord {
  id: string;
  trip_id: string;
  destination_id: string;
  visit_date: string | null;
  day_number: number;
  visit_order: number;
  notes: string | null;
  created_at: string;
  destination?: Destination;
}

export interface ReviewRecord {
  id: string;
  user_id: string;
  destination_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithAuthor extends ReviewRecord {
  reviewer_name: string;
  reviewer_email: string | null;
  reviewer_avatar_url: string | null;
}

