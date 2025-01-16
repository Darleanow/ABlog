import { Article } from "../models/article";
import { API_CONFIG } from "../config/api.config";
import { CreateArticleDto } from "../models/article-dto";
import {
  ArticleClassifier,
  ArticleClassifierFactory,
  Category,
  Tag,
  ClassificationResult,
} from "../repositories/article-classifier";

import { BaseApi } from "./base-api";
import { HttpError } from "./types/http-error";

export class ArticlesApi extends BaseApi {
  private classifier: ArticleClassifier | undefined;

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  private async ensureClassifier(): Promise<ArticleClassifier> {
    if (!this.classifier) {
      const [categories, tags] = await Promise.all([
        this.getCategories(),
        this.getTags(),
      ]);

      this.classifier = ArticleClassifierFactory.create(categories, tags);
    }

    return this.classifier;
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
    // Get category and tag suggestions if none provided
    if (!data.categoryIds?.length || !data.tagIds?.length) {
      const classifier = await this.ensureClassifier();
      const result = classifier.classify(data.content, data.title);

      // Extract basic classification results
      const { categoryId, tagIds } = this.extractBasicClassification(result);

      // Get the names instead of IDs for new suggestions
      const suggestedCategories = categoryId
        ? [this.getCategoryName(categoryId)]
        : [];
      const suggestedTags = tagIds.map((id) => this.getTagName(id));

      return this.fetchApi(API_CONFIG.endpoints.articles, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          suggestedCategories,
          suggestedTags,
        }),
        headers: this.getAuthHeaders(),
      });
    }

    return this.fetchApi(API_CONFIG.endpoints.articles, {
      method: "POST",
      body: JSON.stringify(data),
      headers: this.getAuthHeaders(),
    });
  }

  private extractBasicClassification(result: ClassificationResult) {
    return {
      categoryId: result.categoryId,
      tagIds: result.tagIds,
    };
  }

  async getCategories(): Promise<Category[]> {
    return this.fetchApi<Category[]>(API_CONFIG.endpoints.categories);
  }

  async getTags(): Promise<Tag[]> {
    return this.fetchApi<Tag[]>(API_CONFIG.endpoints.tags);
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.endpoints.images.upload}`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  private getCategoryName(id: number): string {
    return this.classifier?.categories.find((c) => c.id === id)?.name ?? "";
  }

  private getTagName(id: number): string {
    return this.classifier?.tags.find((t) => t.id === id)?.name ?? "";
  }

  async getFavoriteArticles(): Promise<Article[]> {
    try {
      const data = await this.fetchApi<Article[]>(
        `${API_CONFIG.endpoints.articles}/favorites`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      return data || [];
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async addToFavorites(
    articleId: number,
  ): Promise<{ favorites_count: number }> {
    try {
      return await this.fetchApi<{ favorites_count: number }>(
        `${API_CONFIG.endpoints.articles}/${articleId}/favorite`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
        },
      );
    } catch (error) {
      // If the article is already favorited, return the current count
      if (error instanceof HttpError && error.status === 400) {
        const status = await this.getFavoriteCount(articleId);

        return { favorites_count: status };
      }
      throw error;
    }
  }

  async removeFromFavorites(
    articleId: number,
  ): Promise<{ favorites_count: number }> {
    try {
      return await this.fetchApi<{ favorites_count: number }>(
        `${API_CONFIG.endpoints.articles}/${articleId}/favorite`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        },
      );
    } catch (error) {
      // If the article was not favorited, return the current count
      if (error instanceof HttpError && error.status === 404) {
        const status = await this.getFavoriteCount(articleId);

        return { favorites_count: status };
      }
      throw error;
    }
  }

  async isArticleFavorited(articleId: number): Promise<boolean> {
    try {
      const { is_favorited } = await this.fetchApi<{ is_favorited: boolean }>(
        `${API_CONFIG.endpoints.articles}/${articleId}/favorite/status`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      return is_favorited;
    } catch (error) {
      // If we get a 404 or any other error, assume the article is not favorited
      if (error instanceof HttpError) {
        return false;
      }
      throw error;
    }
  }

  private async getFavoriteCount(articleId: number): Promise<number> {
    try {
      const { favorites_count } = await this.fetchApi<{
        favorites_count: number;
      }>(`${API_CONFIG.endpoints.articles}/${articleId}/favorite/count`, {
        headers: this.getAuthHeaders(),
      });

      return favorites_count;
    } catch (error) {
      return 0;
    }
  }
}
