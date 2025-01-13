import { TimestampedModel, ArticleRelation, UserRelation } from "./base";
import { Category } from "./taxonomy";
import { Comment } from "./comment";
import { AuthorInfo } from "./user";

interface ArticleBase extends TimestampedModel {
  title: string;
  slug: string;
  content: string;
  author_id: number;
}

interface ArticleMeta {
  excerpt?: string;
  featured_image_url?: string;
  status: "draft" | "published" | "archived";
  view_count: number;
}

export interface Article extends ArticleBase, ArticleMeta {}

export interface ArticleCategory extends ArticleRelation {
  category_id: number;
}

export interface ArticleTag extends ArticleRelation {
  tag_id: number;
}

export interface ArticleLike extends ArticleRelation, UserRelation {}

export interface Favorite extends ArticleRelation, UserRelation {}

interface ArticleStats {
  likes_count?: number;
  favorites_count?: number;
}

interface ArticleRelations {
  author: AuthorInfo;
  categories: Category[];
  tags: Category[];
  comments?: Comment[];
}

export interface ArticleWithRelations
  extends Article,
    ArticleStats,
    ArticleRelations {}

interface ArticleContentBody {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
}

interface ArticleRelationsBody {
  categoryIds: number[];
  tagIds: number[];
}

export interface CreateArticleBody
  extends ArticleContentBody,
    ArticleRelationsBody {}

export interface UpdateArticleBody extends Partial<CreateArticleBody> {
  status?: "draft" | "published" | "archived";
}

export interface ArticleCategoryInsert
  extends Pick<ArticleCategory, "article_id" | "category_id"> {}
export interface ArticleTagInsert
  extends Pick<ArticleTag, "article_id" | "tag_id"> {}
