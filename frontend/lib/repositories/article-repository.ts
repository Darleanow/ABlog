import { Article } from "../models/article";

import { IArticleRepository } from "./article-repository.interface";

export class ArticleRepository implements IArticleRepository {
  async getArticles(): Promise<Article[]> {
    const response = await fetch("/api/articles");

    return response.json();
  }

  async getArticlesByCategory(categorySlug: string): Promise<Article[]> {
    const response = await fetch(`/api/articles?category=${categorySlug}`);

    return response.json();
  }
}
