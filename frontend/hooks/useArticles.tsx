import { useState, useEffect } from "react";

import { Article, ArticleResponse } from "@/components/types";

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/articles");
        const result: ArticleResponse = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch articles.");
        }

        if (isMounted) {
          const transformedArticles: Article[] = result.map((article) => ({
            ...article,
            categories: article.article_categories.map((ac) => ac.categories),
            tags: article.article_tags.map((at) => at.tags),
            likes_count: article.likes_count || 0,
            favorites_count: article.favorites_count || 0,
          }));

          setArticles(transformedArticles);
          setError(null);
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error.message || "Unknown Error");
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
  }, []);

  return { articles, loading, error };
};
