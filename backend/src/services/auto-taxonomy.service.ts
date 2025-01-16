import { supabase } from "../config/database";
import { ArticleCategoryInsert, ArticleTagInsert } from "../models/article";
import { Category } from "../models/taxonomy";

interface TaxonomyResult {
  id: number;
  name: string;
}

export class TaxonomyService {
  async ensureCategories(names: string[]): Promise<TaxonomyResult[]> {
    const results: TaxonomyResult[] = [];

    for (const name of names) {
      const normalizedName = this.normalizeName(name);
      const slug = this.generateSlug(normalizedName);

      // Try to find existing category
      const { data: existing } = await supabase
        .from("categories")
        .select("id, name")
        .ilike("name", normalizedName)
        .single();

      if (existing) {
        results.push({
          id: existing.id,
          name: existing.name
        });
        continue;
      }

      // Create new category
      const { data: newCategory, error } = await supabase
        .from("categories")
        .insert({
          name: normalizedName,
          slug,
          created_at: new Date().toISOString()
        } satisfies Partial<Category>)
        .select()
        .single();

      if (error) {
        console.error(`Failed to create category ${normalizedName}:`, error);
        continue;
      }

      results.push({
        id: newCategory.id,
        name: newCategory.name
      });
    }

    return results;
  }

  async createArticleCategories(articleId: number, categoryIds: number[]): Promise<void> {
    const inserts: ArticleCategoryInsert[] = categoryIds.map(categoryId => ({
      article_id: articleId,
      category_id: categoryId
    }));

    const { error } = await supabase
      .from("article_categories")
      .insert(inserts);

    if (error) throw error;
  }

  async ensureTags(names: string[]): Promise<TaxonomyResult[]> {
    const results: TaxonomyResult[] = [];

    for (const name of names) {
      const normalizedName = this.normalizeName(name);
      const slug = this.generateSlug(normalizedName);

      // Try to find existing tag
      const { data: existing } = await supabase
        .from("tags")
        .select("id, name")
        .ilike("name", normalizedName)
        .single();

      if (existing) {
        results.push({
          id: existing.id,
          name: existing.name
        });
        continue;
      }

      // Create new tag
      const { data: newTag, error } = await supabase
        .from("tags")
        .insert({
          name: normalizedName,
          slug,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`Failed to create tag ${normalizedName}:`, error);
        continue;
      }

      results.push({
        id: newTag.id,
        name: newTag.name
      });
    }

    return results;
  }

  async createArticleTags(articleId: number, tagIds: number[]): Promise<void> {
    const inserts: ArticleTagInsert[] = tagIds.map(tagId => ({
      article_id: articleId,
      tag_id: tagId
    }));

    const { error } = await supabase
      .from("article_tags")
      .insert(inserts);

    if (error) throw error;
  }

  private normalizeName(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}