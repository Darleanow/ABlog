import { Author } from "./author";
import { Category } from "./category";
import { Tag } from "./tag";

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
  categories: Category[];
  tags: Tag[];
}

export type ArticleResponse = Article[];
