import { UserComment } from "../models/article-comment";
import { API_CONFIG } from "../config/api.config";

import { BaseApi } from "./base-api";

export class CommentsApi extends BaseApi {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getCommentsByArticleId(articleId: number): Promise<UserComment[]> {
    return this.fetchApi<UserComment[]>(
      `${API_CONFIG.endpoints.comments}/${articleId}`,
    );
  }

  async createComment(
    articleId: number,
    content: string,
  ): Promise<UserComment> {
    return this.fetchApi<UserComment>(
      `${API_CONFIG.endpoints.comments}/${articleId}`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: this.getAuthHeaders(),
      },
    );
  }
}
