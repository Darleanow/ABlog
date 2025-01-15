import { Article } from "../models/article";
import { API_CONFIG } from "../config/api.config";
import { CreateArticleDto } from "../models/article-dto";

import { BaseApi } from "./base-api";

export class ArticlesApi extends BaseApi {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getArticles(): Promise<Article[]> {
    return this.fetchApi<Article[]>(API_CONFIG.endpoints.articles);
  }

  async getArticlesByCategory(categorySlug: string): Promise<Article[]> {
    return this.fetchApi<Article[]>(
      `${API_CONFIG.endpoints.articles}?category=${categorySlug}`,
    );
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    return this.fetchApi<Article>(`${API_CONFIG.endpoints.articles}/${slug}`);
  }

  async createArticle(data: CreateArticleDto) {
    return this.fetchApi(API_CONFIG.endpoints.articles, {
      method: "POST",
      body: JSON.stringify(data),
      headers: this.getAuthHeaders(),
    });
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();

    formData.append("image", file);

    const token = localStorage.getItem("token");
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.endpoints.images.upload}`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(`Upload error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    return data.url;
  }
}
