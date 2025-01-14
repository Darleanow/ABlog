import { useState, useEffect } from "react";

import { Article } from "@/lib/models/article";
import { ArticlesApi } from "@/lib/api/articles-api";
import { HttpError } from "@/lib/api/types/http-error";

interface UseArticlesResult {
  articles: Article[] | null;
  loading: boolean;
  error: string | null;
}

export const useArticles = (categorySlug?: string): UseArticlesResult => {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const articlesApi = new ArticlesApi();

    const fetchArticles = async () => {
      try {
        const fetchedArticles = categorySlug
          ? await articlesApi.getArticlesByCategory(categorySlug)
          : await articlesApi.getArticles();

        if (isMounted) {
          setArticles(fetchedArticles);
          setError(null);
        }
      } catch (error: any) {
        if (isMounted) {
          const errorMessage =
            error instanceof HttpError
              ? error.message
              : "Une erreur est survenue lors de la récupération des articles";

          setError(errorMessage);
          setArticles(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  return { articles, loading, error };
};
