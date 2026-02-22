import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ensureSession,
  getSavedMovieIds,
  saveMovie,
  unsaveMovie,
} from "@/services/appwrite";
import type { Movie } from "@/types";

interface FavouritesContextType {
  savedMovieIds: Set<number>;
  isLoading: boolean;
  toggleSave: (movie: Movie) => Promise<void>;
  refetch: () => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextType | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [savedMovieIds, setSavedMovieIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const ids = await getSavedMovieIds();
      setSavedMovieIds(new Set(ids));
    } catch {
      setSavedMovieIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await ensureSession();
      if (!cancelled) await refetch();
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  const toggleSave = useCallback(async (movie: Movie) => {
    const isSaved = savedMovieIds.has(movie.id);
    const nextIds = new Set(savedMovieIds);
    if (isSaved) {
      nextIds.delete(movie.id);
    } else {
      nextIds.add(movie.id);
    }
    setSavedMovieIds(nextIds);

    try {
      if (isSaved) {
        await unsaveMovie(movie.id);
      } else {
        await saveMovie(movie);
      }
    } catch {
      setSavedMovieIds((current) => {
        const reverted = new Set(current);
        if (isSaved) reverted.add(movie.id);
        else reverted.delete(movie.id);
        return reverted;
      });
    }
  }, [savedMovieIds]);

  return (
    <FavouritesContext.Provider
      value={{ savedMovieIds, isLoading, toggleSave, refetch }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) {
    throw new Error("useFavourites must be used within FavouritesProvider");
  }
  return ctx;
}
