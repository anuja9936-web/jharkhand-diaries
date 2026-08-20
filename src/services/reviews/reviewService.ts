import { supabase } from '../../lib/supabase';
import type { Destination } from '../../types/destination';
import type { ReviewRecord, ReviewWithAuthor } from '../../types/tourist';

function getClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

async function getCurrentUserId() {
  const client = getClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Please sign in to write a review.');
  }

  return data.user.id;
}

export interface ReviewInput {
  destinationId: string;
  rating: number;
  reviewText: string;
}

export interface DestinationReviewSummary {
  reviews: ReviewWithAuthor[];
  averageRating: number | null;
  myReview: ReviewRecord | null;
}

export async function getDestinationReviewSummary(destinationId: string): Promise<DestinationReviewSummary> {
  const client = getClient();
  const { data: reviews, error } = await client
    .from('reviews')
    .select('*')
    .eq('destination_id', destinationId)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const reviewRows = (reviews ?? []) as ReviewRecord[];
  const userIds = [...new Set(reviewRows.map((review) => review.user_id))];

  let profilesById = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>();

  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await client.rpc('get_public_profile_summary', {
      p_ids: userIds,
    });

    if (profileError) {
      throw profileError;
    }

    profilesById = new Map(
      ((profiles ?? []) as Array<{ id: string; full_name: string | null; avatar_url: string | null }>).map((profile) => [profile.id, profile])
    );
  }

  const mergedReviews: ReviewWithAuthor[] = reviewRows.map((review) => {
    const profile = profilesById.get(review.user_id);
    return {
      ...review,
      reviewer_name: profile?.full_name ?? 'Traveller',
      reviewer_email: null,
      reviewer_avatar_url: profile?.avatar_url ?? null,
    };
  });

  const averageRating =
    reviewRows.length > 0
      ? Number((reviewRows.reduce((sum, review) => sum + review.rating, 0) / reviewRows.length).toFixed(1))
      : null;

  const userId = await getCurrentUserId().catch(() => null);
  const myReview = userId ? reviewRows.find((review) => review.user_id === userId) ?? null : null;

  return {
    reviews: mergedReviews,
    averageRating,
    myReview,
  };
}

export async function saveDestinationReview(input: ReviewInput): Promise<ReviewRecord> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const trimmedReview = input.reviewText.trim();
  const { data: existingReview, error: existingReviewError } = await client
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('destination_id', input.destinationId)
    .maybeSingle();

  if (existingReviewError) {
    throw existingReviewError;
  }

  const mutation = existingReview
    ? client
        .from('reviews')
        .update({
          rating: input.rating,
          review_text: trimmedReview,
        })
        .eq('id', existingReview.id)
        .select('*')
        .single()
    : client
        .from('reviews')
        .insert({
          user_id: userId,
          destination_id: input.destinationId,
          rating: input.rating,
          review_text: trimmedReview,
        })
        .select('*')
        .single();

  const { data, error } = await mutation;

  if (error) {
    throw error;
  }

  return data as ReviewRecord;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { error } = await client.from('reviews').delete().eq('id', reviewId).eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export interface UserReviewWithDestination extends ReviewRecord {
  destination: Destination | null;
}

export async function getUserReviews(): Promise<UserReviewWithDestination[]> {
  const client = getClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('reviews')
    .select('id, user_id, destination_id, rating, review_text, created_at, updated_at, destination:destinations(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as UserReviewWithDestination[];
}

export interface ReviewWithDestination extends ReviewWithAuthor {
  destination: Destination | null;
}

export async function getReviewsForDestinationIds(destinationIds: string[]): Promise<ReviewWithDestination[]> {
  const client = getClient();

  if (destinationIds.length === 0) {
    return [];
  }

  const { data: reviews, error } = await client
    .from('reviews')
    .select('id, user_id, destination_id, rating, review_text, created_at, updated_at, destination:destinations(*)')
    .in('destination_id', destinationIds)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const reviewRows = (reviews ?? []) as unknown as ReviewWithDestination[];
  const userIds = [...new Set(reviewRows.map((review) => review.user_id))];

  let profilesById = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>();

  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await client.rpc('get_public_profile_summary', {
      p_ids: userIds,
    });

    if (profileError) {
      throw profileError;
    }

    profilesById = new Map(
      ((profiles ?? []) as Array<{ id: string; full_name: string | null; avatar_url: string | null }>).map((profile) => [profile.id, profile])
    );
  }

  return reviewRows.map((review) => {
    const profile = profilesById.get(review.user_id);
    return {
      ...review,
      reviewer_name: profile?.full_name ?? 'Traveller',
      reviewer_email: null,
      reviewer_avatar_url: profile?.avatar_url ?? null,
    };
  });
}
