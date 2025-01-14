import { Article } from "../models/article";

export interface IArticleRepository {
  getArticles(): Promise<Article[]>;
  getArticlesByCategory(categorySlug: string): Promise<Article[]>;
}
