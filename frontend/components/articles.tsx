import React, { useMemo } from "react";
import { CircularProgress } from "@nextui-org/progress";

import { useArticles } from "@/hooks/useArticles";
import { title } from "@/components/primitives";

interface ArticlesListProps {
  selectedCategory: string;
}

const ArticlesList: React.FC<ArticlesListProps> = ({ selectedCategory }) => {
  const { articles, loading, error } = useArticles();

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (selectedCategory === "all") return articles;

    return articles.filter((article) =>
      article.categories.some((category) => category.slug === selectedCategory),
    );
  }, [articles, selectedCategory]);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <CircularProgress color="warning" label="Loading..." />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="grid gap-6">
      {filteredArticles.map((article) => (
        <div
          key={article.id}
          className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className={title()}>{article.title}</h2>
          <p className="mt-2 text-gray-600">{article.excerpt}</p>
          <div className="mt-4 space-y-2">
            <p className="text-sm">By: {article.author.full_name}</p>
            <p className="text-sm">
              Categories:{" "}
              {article.categories.map((category) => category.name).join(", ")}
            </p>
            <p className="text-sm">
              Tags: {article.tags.map((tag) => tag.name).join(", ")}
            </p>
            <div className="flex gap-4 text-sm text-gray-500">
              <p>Views: {article.view_count}</p>
              <p>Likes: {article.likes_count}</p>
              <p>Favorites: {article.favorites_count}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticlesList;
