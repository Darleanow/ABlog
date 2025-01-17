"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Bookmark, Share2 } from "lucide-react";
import { Image } from "@nextui-org/image";
import { Card } from "@nextui-org/card";

import { useAuth } from "@/contexts/auth-context";
import { useFavorites } from "@/hooks/useFavorites";
import { BentoCardProps, Size, Variant } from "@/lib/models/bento-props";

const sizeClasses: Readonly<Record<Size, string>> = {
  large: "md:text-2xl",
  default: "md:text-lg",
  tall: "md:text-xl",
  wide: "md:text-xl",
} as const;

const variantStyles: Readonly<Record<Variant, string>> = {
  default: "from-black/20 to-black/10 hover:from-black/30 hover:to-black/20",
  minimal: "from-black/10 to-transparent hover:from-black/20 hover:to-black/10",
  featured:
    "from-orange-400/70 to-orange-200/70 hover:from-orange-500/80 hover:to-orange-300/80",
} as const;

export function BentoCard({
  article,
  size = "default",
  variant = "default",
  onUnfavorite,
}: Readonly<BentoCardProps>) {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const { isFavorited, isLoading, error, toggleFavorite } = useFavorites(
    article.id,
  );

  const formattedDate = new Date(article.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      await toggleFavorite();
      if (onUnfavorite && isFavorited) {
        onUnfavorite();
      }
    }
  };

  return (
    <Link className="block h-full group" href={`/blog/${article.slug}`}>
      <Card
        className={`h-full overflow-hidden bg-gradient-to-br ${variantStyles[variant]}
        transition-all duration-500 backdrop-blur-sm`}
      >
        <div
          className={`absolute inset-0 z-10 ${
            variant === "featured"
              ? "bg-gradient-to-b from-orange-400/20 to-transparent"
              : "bg-gradient-to-b from-black/60 via-black/40 to-transparent"
          } opacity-80 group-hover:opacity-100 transition-opacity duration-500`}
        />
        <div className="absolute inset-0">
          <Image
            removeWrapper
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-110
                     transition-transform duration-500 ease-out"
            src={article.featured_image_url ?? undefined}
          />
        </div>

        <div className="relative z-20 h-full p-6 flex flex-col justify-between">
          <div>
            {article.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.categories.map((category) => (
                  <span
                    key={category.id}
                    className={`px-3 py-1 text-xs rounded-full shadow-lg
                    transform hover:scale-105 transition-all duration-300
                    ${
                      variant === "featured"
                        ? "bg-white text-orange-500"
                        : "bg-orange-400 text-white"
                    }`}
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            <h3
              className={`font-bold text-white mb-3 line-clamp-2 ${sizeClasses[size]} 
              transform group-hover:-translate-y-1 transition-all duration-300
              ${variant === "featured" ? "drop-shadow-lg" : ""}`}
            >
              {article.title}
            </h3>

            {(size === "large" || size === "wide") && article.excerpt && (
              <p
                className="text-white/80 line-clamp-2 text-sm mb-4 
                transform group-hover:-translate-y-1 transition-all duration-300 delay-75"
              >
                {article.excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Clock className="group-hover:animate-pulse" size={14} />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <button
                  className="opacity-0 group-hover:opacity-100 transform scale-90
                    group-hover:scale-100 transition-all duration-300 relative"
                  disabled={isLoading}
                  onClick={handleFavorite}
                >
                  <Bookmark
                    className={`
                      ${isFavorited ? "text-orange-500 fill-current" : "text-white/80 hover:text-white"}
                      ${isLoading ? "animate-pulse" : ""}
                    `}
                    size={18}
                  />
                  {error && (
                    <span
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                      px-2 py-1 text-xs text-white bg-red-500 rounded whitespace-nowrap"
                    >
                      {error}
                    </span>
                  )}
                </button>
              )}

              <button
                className="opacity-0 group-hover:opacity-100 transform scale-90
                  group-hover:scale-100 transition-all duration-300 delay-75 relative"
                disabled={isSharing}
                onClick={handleShare}
              >
                <Share2
                  className={`text-white/80 hover:text-white ${isSharing ? "animate-pulse" : ""}`}
                  size={18}
                />
                {shareError && (
                  <span
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                    px-2 py-1 text-xs text-white bg-red-500 rounded whitespace-nowrap"
                  >
                    {shareError}
                  </span>
                )}
              </button>

              <div
                className="opacity-0 group-hover:opacity-100 transform translate-x-4
                  group-hover:translate-x-0 transition-all duration-300 delay-150"
              >
                <ArrowRight className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
