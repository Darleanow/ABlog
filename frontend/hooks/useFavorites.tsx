import { useState, useCallback, useEffect } from "react";

import { useAuth } from "@/contexts/auth-context";
import { ArticlesApi } from "@/lib/api/articles-api";
import { HttpError } from "@/lib/api/types/http-error";
import { UseFavoritesResult } from "@/lib/models/use-favorite-result";
export function useFavorites(articleId: number): UseFavoritesResult {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const articlesApi = new ArticlesApi();

  useEffect(() => {
    let isMounted = true;

    const checkFavoriteStatus = async () => {
      if (!user) {
        setIsFavorited(false);

        return;
      }

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
              : "An error occurred while checking favorites";

          setError(errorMessage);
        }
      }
    };

    checkFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [articleId, user]);

  const toggleFavorite = useCallback(async () => {
    if (!user) return;

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
          : "An error occurred while updating favorites";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [articleId, isFavorited, user]);

  return { isFavorited, isLoading, error, toggleFavorite };
}
