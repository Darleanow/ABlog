import { TimestampedModel } from "./base";

interface CommentBase extends TimestampedModel {
  content: string;
}

interface CommentRelations {
  user_id: number;
  article_id: number;
  parent_comment_id?: number;
}

export interface Comment extends CommentBase, CommentRelations {}

export interface CreateCommentBody {
  content: string;
  parent_comment_id?: number;
}