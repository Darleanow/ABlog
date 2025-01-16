"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Bookmark, HeartCrack } from "lucide-react";
import { motion } from "framer-motion";

import { ArticlesApi } from "@/lib/api/articles-api";
import { Article } from "@/lib/models/article";
import { HttpError } from "@/lib/api/types/http-error";
import { useAuth } from "@/contexts/auth-context";
import BentoGrid from "@/components/bento-grid";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!user) {
    redirect("/auth");
  }

  useEffect(() => {
    let isMounted = true;
    const articlesApi = new ArticlesApi();

    const fetchFavorites = async () => {
      try {
        const articles = await articlesApi.getFavoriteArticles();

        if (isMounted) {
          setFavorites(articles);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof HttpError
              ? err.message
              : "An error occurred while fetching your favorites";

          setError(errorMessage);
          setFavorites(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-r-2 border-orange-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col items-center justify-center min-h-[600px] text-center px-4"
      >
        <HeartCrack className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-red-500">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
      </motion.div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col items-center justify-center min-h-[600px] text-center px-4"
      >
        <Bookmark className="w-20 h-20 text-orange-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
          No favorites yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg">
          Start building your collection by bookmarking articles you love. Click
          the bookmark icon on any article to add it to your favorites.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-12"
    >
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
          Your Favorite Articles
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Your personal collection of inspiring articles
        </p>
      </div>
      <BentoGrid articles={favorites} />
    </motion.div>
  );
}
