"use client";

import { motion } from "framer-motion";

import { BentoCard } from "./bento-card";

import { BentoGridProps, Size, Variant } from "@/lib/models/bento-props";

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

export default function BentoGrid({
  articles,
  onUnfavorite,
}: Readonly<BentoGridProps>) {
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
                onUnfavorite={onUnfavorite}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
