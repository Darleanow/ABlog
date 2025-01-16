"use client";

import React from "react";
import { Tab, Tabs } from "@nextui-org/tabs";

import BentoGrid from "./bento-grid";

import { useArticles } from "@/hooks/useArticles";

const BlogPage = () => {
  const { articles } = useArticles();
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const categories = React.useMemo(() => {
    if (!articles) return [];

    const categoryMap = new Map();

    articles.forEach((article) => {
      article.categories.forEach((category) => {
        if (!categoryMap.has(category.slug)) {
          categoryMap.set(category.slug, category);
        }
      });
    });

    return Array.from(categoryMap.values());
  }, [articles]);

  const displayedArticles = React.useMemo(() => {
    if (!articles) return [];
    if (selectedCategory === "all") return articles;

    return articles.filter((article) =>
      article.categories.some((category) => category.slug === selectedCategory),
    );
  }, [articles, selectedCategory]);

  return (
    <main className="max-w-7xl">
      <div>
        <Tabs
          aria-label="Tabs variants"
          variant={"underlined"}
          onSelectionChange={(key) => setSelectedCategory(key as string)}
        >
          <Tab key={"all"} title={"All"} value={"all"} />
          {categories.map((category) => (
            <Tab
              key={category.slug}
              title={category.name}
              value={category.slug}
            />
          ))}
        </Tabs>
      </div>
      <BentoGrid articles={displayedArticles} />
    </main>
  );
};

export default BlogPage;
