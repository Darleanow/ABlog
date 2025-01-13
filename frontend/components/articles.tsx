import React from "react";
import { CircularProgress } from "@nextui-org/progress";

import { useArticles } from "@/hooks/useArticles";
import { title } from "@/components/primitives";

const ArticlesList: React.FC = () => {
  const { articles, loading, error } = useArticles();

  if (loading) {
    return <CircularProgress color="warning" label="Loading..." />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      {articles?.map((article) => (
        <div key={article.id}>
          <h2 className={title()}>{article.title}</h2>
          <p>{article.excerpt}</p>
          <p>By: {article.author.full_name}</p>
          <p>
            Categories: {article.categories.map((category) => category.name)}
          </p>
          <p>Tags: {article.tags.map((tag) => tag.name)}</p>
          <p>Views: {article.view_count}</p>
          <p>Likes: {article.likes_count}</p>
        </div>
      ))}
    </div>
  );
};

export default ArticlesList;
