import { UserComment } from "../models/article-comment";

import { BaseApi } from "./base-api";

export class CommentsApi extends BaseApi {
  async getCommentsByArticleId(articleId: number): Promise<UserComment[]> {
    return this.fetchApi<UserComment[]>(`/comments/article/${articleId}`);
  }
}
