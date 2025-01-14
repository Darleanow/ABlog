"use client";

import { Tabs, Tab } from "@nextui-org/tabs";
import { useMemo, useState } from "react";

import { useArticles } from "@/hooks/useArticles";
import ArticlesList from "@/components/articles";
import { Category } from "@/lib/models/category";

export default function BlogPage() {
  const { articles } = useArticles();
  const [selectedCategory, setSelectedCategory] = useState<
    string | number | null
  >("all");

  const categories = useMemo(() => {
    if (!articles) return [];
    const categoryMap = new Map<string, Category>();

    articles.forEach((article) => {
      article.categories.forEach((category) => {
        if (!categoryMap.has(category.slug)) {
          categoryMap.set(category.slug, category);
        }
      });
    });

    return Array.from(categoryMap.values());
  }, [articles]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <Tabs
          selectedKey={selectedCategory}
          variant="underlined"
          onSelectionChange={setSelectedCategory}
        >
          <Tab key="all" title="All" />
          {categories.map((category) => (
            <Tab key={category.slug} title={category.name} />
          ))}
        </Tabs>
      </div>
      <ArticlesList selectedCategory={selectedCategory?.toString() ?? "all"} />
    </section>
  );
}
