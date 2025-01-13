export interface Author {
  username: string;
  full_name: string;
  avatar_url: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  description: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

interface ArticleCategory {
  categories: Category;
}

interface ArticleTag {
  tags: Tag;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: string;
  featured_image_url: string | null;
  author_id: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  likes_count: number;
  favorites_count: number;
  author: Author;
  article_categories: ArticleCategory[];
  article_tags: ArticleTag[];
  categories: Category[];
  tags: Tag[];
}

export type ArticleResponse = Article[];
