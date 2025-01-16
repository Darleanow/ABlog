import React from "react";
import Link from "next/link";
import { Clock, ArrowRight, Bookmark, Share2 } from "lucide-react";
import { Image } from "@nextui-org/image";
import { Card } from "@nextui-org/card";
import { motion } from "framer-motion";

import { Article } from "@/lib/models/article";

type Size = "large" | "default" | "tall" | "wide";
type Variant = "default" | "minimal" | "featured";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const BentoCard = ({
  article,
  size = "default",
  variant = "default",
}: {
  article: Article;
  size?: Size;
  variant?: Variant;
}) => {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sizeClasses = {
    large: "md:text-2xl",
    default: "md:text-lg",
    tall: "md:text-xl",
    wide: "md:text-xl",
  };

  const variantStyles = {
    default: "from-black/20 to-black/10 hover:from-black/30 hover:to-black/20",
    minimal:
      "from-black/10 to-transparent hover:from-black/20 hover:to-black/10",
    featured:
      "from-orange-400/70 to-orange-200/70 hover:from-orange-500/80 hover:to-orange-300/80",
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
              <button
                className="opacity-0 group-hover:opacity-100 transform scale-90
                group-hover:scale-100 transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  // Add bookmark functionality
                }}
              >
                <Bookmark
                  className="text-white/80 hover:text-white"
                  size={18}
                />
              </button>

              <button
                className="opacity-0 group-hover:opacity-100 transform scale-90
                group-hover:scale-100 transition-all duration-300 delay-75"
                onClick={(e) => {
                  e.preventDefault();
                  // Add share functionality
                }}
              >
                <Share2 className="text-white/80 hover:text-white" size={18} />
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
};

const BentoGrid = ({ articles }: { articles: Article[] }) => {
  if (!articles?.length) return null;

  const getCardConfig = (
    index: number,
  ): {
    className: string;
    size: Size;
    variant: Variant;
  } => {
    const configs: Record<
      number,
      {
        className: string;
        size: Size;
        variant: Variant;
      }
    > = {
      0: {
        className: "md:col-span-2 md:row-span-2",
        size: "large",
        variant: "featured",
      },
      1: {
        className: "md:col-span-1 md:row-span-1",
        size: "default",
        variant: "minimal",
      },
      2: {
        className: "md:col-span-1 md:row-span-1",
        size: "default",
        variant: "default",
      },
      3: {
        className: "md:col-span-2 md:row-span-1",
        size: "wide",
        variant: "minimal",
      },
      4: {
        className: "md:col-span-1 md:row-span-2",
        size: "tall",
        variant: "default",
      },
      5: {
        className: "md:col-span-1 md:row-span-1",
        size: "default",
        variant: "minimal",
      },
    };

    const indexMod = index % 6;

    return configs[indexMod];
  };

  return (
    <div className="p-6">
      <div
        className="
          grid
          grid-flow-row-dense
          grid-cols-1
          md:grid-cols-4
          gap-4
          max-w-8xl
          mx-auto
        "
      >
        {articles.map((article, index) => {
          const config = getCardConfig(index);

          return (
            <motion.div
              key={article.id}
              className={`${config.className} transform hover:-translate-y-1
              transition-transform duration-300 ease-out`}
              initial="hidden"
              variants={fadeInUp}
              viewport={{ once: true }}
              whileInView="visible"
            >
              <BentoCard
                article={article}
                size={config.size}
                variant={config.variant}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BentoGrid;
