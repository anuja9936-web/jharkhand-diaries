import { supabase } from '../../lib/supabase';
import type { ProviderOfferingKind } from '../../types/provider';

export const TOURISM_STORAGE_BUCKET = 'tourism-images';

export type TourismFolder =
  | 'destinations'
  | 'stays'
  | 'crafts'
  | 'heritage'
  | 'tours'
  | 'experiences'
  | 'transport';

export interface MediaEntity {
  id: string;
  name: string;
  slug: string;
  district?: string;
  category?: string;
  kind?: 'destination' | ProviderOfferingKind;
  cover_image: string;
  gallery: string[];
}

export interface UploadPhotoResult {
  publicUrl: string;
  path: string;
}

function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Please check environment variables.');
  }
  return supabase;
}

/**
 * Upload a real photograph to Supabase Storage in the specified folder.
 */
export async function uploadTourismPhoto(
  file: File,
  folder: TourismFolder,
  prefix?: string
): Promise<UploadPhotoResult> {
  const client = getSupabase();
  const sanitizedPrefix = (prefix || 'photo')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const filePath = `${folder}/${sanitizedPrefix}-${timestamp}-${randomSuffix}.${ext}`;

  const { error: uploadError } = await client.storage
    .from(TOURISM_STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Failed to upload image to Supabase Storage:', uploadError);
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = client.storage
    .from(TOURISM_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    path: filePath,
  };
}

/**
 * Delete a photo from Supabase Storage by its file path or public URL.
 */
export async function deleteTourismPhoto(filePathOrUrl: string): Promise<boolean> {
  const client = getSupabase();
  let relativePath = filePathOrUrl;
  
  // If a full Supabase storage URL was passed, extract the relative path
  if (filePathOrUrl.includes(TOURISM_STORAGE_BUCKET)) {
    const parts = filePathOrUrl.split(`${TOURISM_STORAGE_BUCKET}/`);
    if (parts.length > 1) {
      relativePath = parts[1].split('?')[0];
    }
  }

  // Do not attempt to delete local static assets from Supabase Storage
  if (relativePath.startsWith('/images/')) {
    return true;
  }

  const { error } = await client.storage
    .from(TOURISM_STORAGE_BUCKET)
    .remove([relativePath]);

  if (error) {
    console.warn('Supabase storage delete warning:', error.message);
    return false;
  }

  return true;
}

/**
 * Save updated cover image and gallery array to a Destination in Supabase.
 */
export async function updateDestinationMedia(
  destinationId: string,
  coverImage: string,
  gallery: string[]
): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from('destinations')
    .update({
      cover_image: coverImage,
      gallery: gallery,
      updated_at: new Date().toISOString(),
    })
    .eq('id', destinationId);

  if (error) {
    throw new Error(`Failed to update destination media: ${error.message}`);
  }
}

/**
 * Save updated cover image and gallery array to a Provider Offering in Supabase.
 */
export async function updateOfferingMedia(
  offeringId: string,
  coverImage: string,
  gallery: string[]
): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from('provider_offerings')
    .update({
      cover_image: coverImage,
      gallery: gallery,
      updated_at: new Date().toISOString(),
    })
    .eq('id', offeringId);

  if (error) {
    throw new Error(`Failed to update offering media: ${error.message}`);
  }
}

/**
 * Fetch all media items in a given category from the database for admin management.
 */
export async function fetchCategoryEntities(
  categoryType: 'destinations' | 'stays' | 'crafts' | 'tours' | 'experiences' | 'transport'
): Promise<MediaEntity[]> {
  const client = getSupabase();

  if (categoryType === 'destinations') {
    const { data, error } = await client
      .from('destinations')
      .select('id, name, slug, district, category, cover_image, gallery')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Error fetching destinations for media manager:', error.message);
      return [];
    }

    return (data || []).map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      district: d.district,
      category: d.category,
      kind: 'destination',
      cover_image: d.cover_image || '',
      gallery: Array.isArray(d.gallery) ? d.gallery : [],
    }));
  }

  // Offering kinds
  const kindMap: Record<string, ProviderOfferingKind> = {
    stays: 'stay',
    crafts: 'product',
    tours: 'tour',
    experiences: 'experience',
    transport: 'transport',
  };

  const offeringKind = kindMap[categoryType];

  const { data, error } = await client
    .from('provider_offerings')
    .select('id, name, slug, district, category, kind, cover_image, gallery')
    .eq('kind', offeringKind)
    .order('name', { ascending: true });

  if (error) {
    console.warn(`Error fetching ${offeringKind} offerings for media manager:`, error.message);
    return [];
  }

  return (data || []).map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    district: o.district,
    category: o.category,
    kind: o.kind,
    cover_image: o.cover_image || '',
    gallery: Array.isArray(o.gallery) ? o.gallery : [],
  }));
}
