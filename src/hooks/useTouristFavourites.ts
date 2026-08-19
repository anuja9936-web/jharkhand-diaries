import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import {
  addFavourite,
  getUserFavourites,
  removeFavourite,
  toggleFavourite,
} from '../services/favourites/favouriteService';
import type { FavouriteRecord } from '../types/tourist';

export function useTouristFavourites() {
  const { user, role, loading: authLoading } = useAuth();
  const [favourites, setFavourites] = useState<FavouriteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDestinationId, setPendingDestinationId] = useState<string | null>(null);

  const isAuthenticated = Boolean(user);
  const isTourist = role === 'tourist';

  const loadFavourites = useCallback(async () => {
    if (!user || !isTourist) {
      setFavourites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const records = await getUserFavourites();
      setFavourites(records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load saved destinations.');
    } finally {
      setLoading(false);
    }
  }, [isTourist, user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadFavourites();
  }, [authLoading, loadFavourites]);

  const favouriteIds = useMemo(() => new Set(favourites.map((favourite) => favourite.destination_id)), [favourites]);

  const isFavourite = useCallback((destinationId: string) => favouriteIds.has(destinationId), [favouriteIds]);

  const toggle = useCallback(
    async (destinationId: string) => {
      if (!user) {
        throw new Error('Please sign in to save destinations.');
      }

      if (!isTourist) {
        throw new Error('Only tourist accounts can save destinations.');
      }

      setPendingDestinationId(destinationId);

      try {
        await toggleFavourite(destinationId);
        await loadFavourites();
      } finally {
        setPendingDestinationId(null);
      }
    },
    [isTourist, loadFavourites, user]
  );

  const add = useCallback(
    async (destinationId: string) => {
      if (!user) {
        throw new Error('Please sign in to save destinations.');
      }

      if (!isTourist) {
        throw new Error('Only tourist accounts can save destinations.');
      }

      setPendingDestinationId(destinationId);

      try {
        await addFavourite(destinationId);
        await loadFavourites();
      } finally {
        setPendingDestinationId(null);
      }
    },
    [isTourist, loadFavourites, user]
  );

  const remove = useCallback(
    async (destinationId: string) => {
      if (!user) {
        throw new Error('Please sign in to save destinations.');
      }

      if (!isTourist) {
        throw new Error('Only tourist accounts can save destinations.');
      }

      setPendingDestinationId(destinationId);

      try {
        await removeFavourite(destinationId);
        await loadFavourites();
      } finally {
        setPendingDestinationId(null);
      }
    },
    [isTourist, loadFavourites, user]
  );

  return {
    favourites,
    favouriteIds,
    loading,
    error,
    pendingDestinationId,
    isAuthenticated,
    isTourist,
    isFavourite,
    refresh: loadFavourites,
    toggleFavourite: toggle,
    addFavourite: add,
    removeFavourite: remove,
  };
}

