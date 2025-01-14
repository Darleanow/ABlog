import { Article } from "../models/article";
import { API_CONFIG } from "../config/api.config";

import { BaseApi } from "./base-api";

export class ArticlesApi extends BaseApi {
  async getArticles(): Promise<Article[]> {
    return this.fetchApi<Article[]>(API_CONFIG.endpoints.articles);
  }

  async getArticlesByCategory(categorySlug: string): Promise<Article[]> {
    return this.fetchApi<Article[]>(
      `${API_CONFIG.endpoints.articles}?category=${categorySlug}`,
    );
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    return this.fetchApi<Article>(`${API_CONFIG.endpoints.articles}/:${slug}`);
  }
}
