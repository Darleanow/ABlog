import { Request } from "express";

// Base Models
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: "draft" | "published" | "archived";
  featured_image_url?: string;
  author_id: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  article_id: number;
  parent_comment_id?: number;
  created_at: string;
  updated_at: string;
}

// Relationship Models
export interface ArticleCategory {
  article_id: number;
  category_id: number;
  created_at: string;
}

export interface ArticleTag {
  article_id: number;
  tag_id: number;
  created_at: string;
}

export interface ArticleLike {
  user_id: number;
  article_id: number;
  created_at: string;
}

export interface Favorite {
  user_id: number;
  article_id: number;
  created_at: string;
}

export interface UserFollower {
  follower_id: number;
  following_id: number;
  created_at: string;
}

// Extended Models with Relations
export interface ArticleWithRelations extends Article {
  author: Pick<User, "username" | "full_name" | "avatar_url">;
  categories: Category[];
  tags: Tag[];
  comments?: Comment[];
  likes_count?: number;
  favorites_count?: number;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

// Request Body Types
export interface CreateArticleBody {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  categoryIds: number[];
  tagIds: number[];
}

export interface UpdateArticleBody extends Partial<CreateArticleBody> {
  status?: "draft" | "published" | "archived";
}

export interface CreateCommentBody {
  content: string;
  parent_comment_id?: number;
}

export interface UpdateUserBody {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface ArticleCategoryInsert {
  article_id: number;
  category_id: number;
}

export interface ArticleTagInsert {
  article_id: number;
  tag_id: number;
}

export interface SupabaseUser {
    id: string;
    email?: string;
    phone?: string;
    app_metadata: {
      provider?: string;
      [key: string]: any;
    };
    user_metadata: {
      [key: string]: any;
    };
    aud: string;
    created_at: string;
  }