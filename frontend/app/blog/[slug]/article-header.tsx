"use client";

import { useState } from "react";
import { Avatar } from "@nextui-org/avatar";
import { Clock, Share2, Bookmark, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Chip } from "@nextui-org/chip";
import Link from "next/link";

import { useAuth } from "@/contexts/auth-context";
import { useFavorites } from "@/hooks/useFavorites";
import { Article } from "@/lib/models/article";
import { Category } from "@/lib/models/category";

interface ArticleHeaderProps {
  readonly article: Article;
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const {
    isFavorited,
    isLoading,
    error: favoriteError,
    toggleFavorite,
  } = useFavorites(article.id);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      setShareError(null);
      const shareUrl = `${window.location.origin}/blog/${article.slug}`;

      await navigator.clipboard.writeText(shareUrl);
    } catch {
      setShareError("Failed to copy link");
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareError(null), 3000);
    }
  };

  const handleFavorite = async () => {
    if (user) {
      await toggleFavorite();
    }
  };

  return (
    <>
      <Link
        className="group inline-flex items-center gap-3 px-4 py-2 mb-8 rounded-l transition-all text-orange-600/90 dark:text-orange-300/90 hover:text-orange-400 hover:dark:text-orange-400 shadow-sm"
        href="/blog"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Articles</span>
      </Link>

      {article.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.categories.map((category: Category) => (
            <Chip
              key={category.id}
              className="text-xs hover:scale-105 transition-transform bg-gradient-to-r from-orange-50 to-rose-50 text-orange-700 border-orange-100/50 hover:from-orange-100 hover:to-rose-100
              dark:from-orange-950/30 dark:to-rose-950/30 dark:text-orange-300 dark:border-orange-800/30"
              size="sm"
              variant="flat"
            >
              {category.name}
            </Chip>
          ))}
        </div>
      )}

      <h1 className="text-5xl font-bold mb-8 leading-tight bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
        {article.title}
      </h1>

      <div className="flex items-center justify-between py-6 border-t border-b border-orange-100/50 dark:border-orange-800/30 mb-12">
        <div className="flex items-center gap-4">
          <Avatar
            className="h-12 w-12 ring-2 ring-orange-200 dark:ring-orange-800/50 ring-offset-2 ring-offset-background"
            name={article.author.full_name}
            src={article.author.avatar_url ?? undefined}
          />
          <div>
            <p className="font-semibold text-lg">{article.author.full_name}</p>
            <div className="flex items-center gap-2 text-orange-600/80 dark:text-orange-400/80 text-sm">
              <Clock size={16} />
              <time>
                {formatDistanceToNow(new Date(article.created_at))} ago
              </time>
            </div>
          </div>
        </div>

        <div className="flex gap-4 relative">
          <button
            className={`p-2 rounded-full hover:bg-gradient-to-r from-orange-50 to-rose-50 
              dark:hover:from-orange-950/30 dark:hover:to-rose-950/30 transition-colors 
              text-orange-600/80 dark:text-orange-400/80 relative
              ${isSharing ? "animate-pulse" : ""}`}
            disabled={isSharing}
            onClick={handleShare}
          >
            <Share2 size={20} />
            {shareError && (
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-red-500 rounded whitespace-nowrap">
                {shareError}
              </span>
            )}
          </button>

          {user && (
            <button
              className={`p-2 rounded-full hover:bg-gradient-to-r from-orange-50 to-rose-50 
                dark:hover:from-orange-950/30 dark:hover:to-rose-950/30 transition-colors relative
                ${isFavorited ? "text-orange-500 dark:text-orange-400" : "text-orange-600/80 dark:text-orange-400/80"}
                ${isLoading ? "animate-pulse" : ""}`}
              disabled={isLoading}
              onClick={handleFavorite}
            >
              <Bookmark
                className={isFavorited ? "fill-current" : ""}
                size={20}
              />
              {favoriteError && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-red-500 rounded whitespace-nowrap">
                  {favoriteError}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
