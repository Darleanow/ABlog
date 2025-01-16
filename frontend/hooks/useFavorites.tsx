import { useState, useCallback, useEffect } from "react";

import { ArticlesApi } from "@/lib/api/articles-api";
import { HttpError } from "@/lib/api/types/http-error";

interface UseFavoritesResult {
  isFavorited: boolean;
  isLoading: boolean;
  error: string | null;
  toggleFavorite: () => Promise<void>;
}

export function useFavorites(articleId: number): UseFavoritesResult {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const articlesApi = new ArticlesApi();

  useEffect(() => {
    let isMounted = true;

    const checkFavoriteStatus = async () => {
      try {
        const status = await articlesApi.isArticleFavorited(articleId);

        if (isMounted) {
          setIsFavorited(status);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof HttpError
              ? err.message
              : "Une erreur est survenue lors de la vérification des favoris";

          setError(errorMessage);
        }
      }
    };

    checkFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  const toggleFavorite = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isFavorited) {
        await articlesApi.removeFromFavorites(articleId);
      } else {
        await articlesApi.addToFavorites(articleId);
      }

      setIsFavorited(!isFavorited);
    } catch (err) {
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : "Une erreur est survenue lors de la mise à jour des favoris";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [articleId, isFavorited]);

  return { isFavorited, isLoading, error, toggleFavorite };
}
