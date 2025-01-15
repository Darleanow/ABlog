export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  categoryIds?: number[];
  tagIds?: number[];
}
