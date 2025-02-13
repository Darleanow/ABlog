import { Response } from "express";
import { supabase } from "../config/database";
import slugify from "slugify";
import {
  AuthenticatedRequest,
  Article,
  ArticleWithRelations,
  CreateArticleBody,
  UpdateArticleBody,
  Category,
  AuthorInfo,
  Comment,
} from "../models";
import { TaxonomyService } from "../services/auto-taxonomy.service";

interface ExtendedCreateArticleBody extends CreateArticleBody {
  suggestedCategories?: string[];
  suggestedTags?: string[];
}
interface CategoryJoinResult {
  categories: Category;
}

interface TagJoinResult {
  tags: Category;
}

interface SupabaseArticleResult extends Article {
  author: AuthorInfo;
  article_categories: CategoryJoinResult[];
  article_tags: TagJoinResult[];
  article_likes: { count: number | null };
  favorites: { count: number | null };
  comments?: Comment[];
}

export class ArticlesController {
  private readonly taxonomyService: TaxonomyService;

  constructor() {
    this.taxonomyService = new TaxonomyService();
  }

  async getAllArticles(_req: AuthenticatedRequest, res: Response) {
    try {
      const { data, error } = (await supabase.from("articles").select(`
          *,
          author:users!articles_author_id_fkey(username, full_name, avatar_url),
          article_categories!inner(
            categories(*)
          ),
          article_tags!inner(
            tags(*)
          ),
          article_likes(count),
          favorites(count)
        `)) as { data: SupabaseArticleResult[] | null; error: any };

      if (error) throw error;

      const transformedData = data?.map((article) => {
        const transformed: ArticleWithRelations = {
          ...article,
          author: article.author,
          categories: article.article_categories.map(
            (ac: CategoryJoinResult) => ac.categories
          ),
          tags: article.article_tags.map((at: TagJoinResult) => at.tags),
          likes_count: article.article_likes?.count ?? 0,
          favorites_count: article.favorites?.count ?? 0,
        };
        return transformed;
      });

      return res.json(transformedData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getArticleBySlug(req: AuthenticatedRequest, res: Response) {
    try {
      const { slug } = req.params;
      const { data, error } = (await supabase
        .from("articles")
        .select(
          `
          *,
          author:users!articles_author_id_fkey(username, full_name, avatar_url),
          article_categories!inner(
            categories(*)
          ),
          article_tags!inner(
            tags(*)
          ),
          comments(
            *,
            user:users!comments_user_id_fkey(username, full_name, avatar_url)
          ),
          article_likes(count),
          favorites(count)
        `
        )
        .eq("slug", slug)
        .single()) as { data: SupabaseArticleResult | null; error: any };

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Article not found" });

      const transformedData: ArticleWithRelations = {
        ...data,
        author: data.author,
        categories: data.article_categories.map(
          (ac: CategoryJoinResult) => ac.categories
        ),
        tags: data.article_tags.map((at: TagJoinResult) => at.tags),
        likes_count: data.article_likes?.count ?? 0,
        favorites_count: data.favorites?.count ?? 0,
      };

      await supabase
        .from("articles")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", data.id);

      return res.json(transformedData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createArticle(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        title,
        content,
        excerpt,
        featured_image_url,
        categoryIds,
        tagIds,
        suggestedCategories,
        suggestedTags,
      } = req.body as ExtendedCreateArticleBody;

      // Create the base article
      const { data: article, error: articleError } = await supabase
        .from("articles")
        .insert({
          title,
          slug: slugify(title, { lower: true }),
          content,
          excerpt,
          featured_image_url,
          author_id: req.user.id,
          status: "draft",
          view_count: 0,
        } satisfies Partial<Article>)
        .select()
        .single();

      if (articleError) throw articleError;

      // Handle categories
      if (categoryIds?.length || suggestedCategories?.length) {
        const categoriesToProcess = categoryIds?.length
          ? await this.getExistingCategoryNames(categoryIds)
          : suggestedCategories || [];

        if (categoriesToProcess.length) {
          const results = await this.taxonomyService.ensureCategories(
            categoriesToProcess
          );
          await this.taxonomyService.createArticleCategories(
            article.id,
            results.map((r) => r.id)
          );
        }
      }

      // Handle tags
      if (tagIds?.length || suggestedTags?.length) {
        const tagsToProcess = tagIds?.length
          ? await this.getExistingTagNames(tagIds)
          : suggestedTags || [];

        if (tagsToProcess.length) {
          const results = await this.taxonomyService.ensureTags(tagsToProcess);
          await this.taxonomyService.createArticleTags(
            article.id,
            results.map((r) => r.id)
          );
        }
      }

      // Get complete article with relations
      const articleWithRelations = await this.getArticleWithRelations(
        article.id
      );

      return res.status(201).json(articleWithRelations);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateArticle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        excerpt,
        featured_image_url,
        categoryIds,
        tagIds,
        status,
      } = req.body as UpdateArticleBody;

      // Check ownership
      const { data: article, error: fetchError } = await supabase
        .from("articles")
        .select("author_id")
        .eq("id", id)
        .single();

      if (fetchError || !article) {
        return res.status(404).json({ error: "Article not found" });
      }

      if (article.author_id !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Update article
      const updateData: Partial<Article> = {};
      if (title) {
        updateData.title = title;
        updateData.slug = slugify(title, { lower: true });
      }
      if (content) updateData.content = content;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (featured_image_url !== undefined)
        updateData.featured_image_url = featured_image_url;
      if (status) updateData.status = status;

      const { error: updateError } = await supabase
        .from("articles")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;

      // Update categories if provided
      if (categoryIds !== undefined) {
        await supabase.from("article_categories").delete().eq("article_id", id);

        if (categoryIds.length) {
          await this.taxonomyService.createArticleCategories(
            parseInt(id),
            categoryIds
          );
        }
      }

      // Update tags if provided
      if (tagIds !== undefined) {
        await supabase.from("article_tags").delete().eq("article_id", id);

        if (tagIds.length) {
          await this.taxonomyService.createArticleTags(parseInt(id), tagIds);
        }
      }

      // Get updated article with relations
      const articleWithRelations = await this.getArticleWithRelations(
        parseInt(id)
      );
      return res.json(articleWithRelations);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteArticle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const { data: article, error: fetchError } = await supabase
        .from("articles")
        .select("author_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!article) return res.status(404).json({ error: "Article not found" });

      const { data: user } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", req.user.id)
        .single();

      if (article.author_id !== req.user.id && !user?.is_admin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { error: deleteError } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async likeArticle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { data: article, error: articleError } = await supabase
        .from("articles")
        .select("id")
        .eq("id", id)
        .single();

      if (articleError || !article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const { data: existingLike, error: likeError } = await supabase
        .from("article_likes")
        .select("*")
        .eq("article_id", id)
        .eq("user_id", userId)
        .single();

      if (likeError && likeError.code !== "PGRST116") {
        throw likeError;
      }

      if (existingLike) {
        return res.status(400).json({ error: "Article already liked" });
      }

      const { error: insertError } = await supabase
        .from("article_likes")
        .insert({
          article_id: parseInt(id),
          user_id: userId,
        });

      if (insertError) throw insertError;

      const { data: likeCount, error: countError } = await supabase
        .from("article_likes")
        .select("count", { count: "exact" })
        .eq("article_id", id);

      if (countError) throw countError;

      return res.json({ likes_count: likeCount });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async unlikeArticle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { error: deleteError } = await supabase
        .from("article_likes")
        .delete()
        .eq("article_id", id)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      const { data: likeCount, error: countError } = await supabase
        .from("article_likes")
        .select("count", { count: "exact" })
        .eq("article_id", id);

      if (countError) throw countError;

      return res.json({ likes_count: likeCount });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async favoriteArticle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { data: article, error: articleError } = await supabase
        .from("articles")
        .select("id")
        .eq("id", id)
        .single();

      if (articleError || !article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const { data: existingFavorite, error: favoriteError } = await supabase
        .from("favorites")
        .select("*")
        .eq("article_id", id)
        .eq("user_id", userId)
        .single();

      if (favoriteError && favoriteError.code !== "PGRST116") {
        throw favoriteError;
      }

      if (existingFavorite) {
        return res.status(400).json({ error: "Article already in favorites" });
      }

      const { error: insertError } = await supabase.from("favorites").insert({
        article_id: parseInt(id),
        user_id: userId,
      });

      if (insertError) throw insertError;

      const { data: favoriteCount, error: countError } = await supabase
        .from("favorites")
        .select("count", { count: "exact" })
        .eq("article_id", id);

      if (countError) throw countError;

      return res.json({ favorites_count: favoriteCount });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async unfavoriteArticle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("article_id", id)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      const { data: favoriteCount, error: countError } = await supabase
        .from("favorites")
        .select("count", { count: "exact" })
        .eq("article_id", id);

      if (countError) throw countError;

      return res.json({ favorites_count: favoriteCount });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getFavoriteArticles(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.id;
  
      // First, get the article IDs from favorites
      const { data: favoriteIds, error: favoritesError } = await supabase
        .from('favorites')
        .select('article_id')
        .eq('user_id', userId);
  
      if (favoritesError) throw favoritesError;
      
      if (!favoriteIds?.length) {
        return res.json([]);
      }
  
      // Then get the articles with these IDs
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          author:users!articles_author_id_fkey(username, full_name, avatar_url),
          article_categories(
            categories(*)
          ),
          article_tags(
            tags(*)
          ),
          article_likes(count),
          favorites(count)
        `)
        .in('id', favoriteIds.map(f => f.article_id));
  
      if (error) throw error;
  
      const transformedData = data?.map((article) => {
        const transformed: ArticleWithRelations = {
          ...article,
          author: article.author,
          categories: (article.article_categories || []).map(
            (ac: CategoryJoinResult) => ac.categories
          ),
          tags: (article.article_tags || []).map((at: TagJoinResult) => at.tags),
          likes_count: article.article_likes?.count ?? 0,
          favorites_count: article.favorites?.count ?? 0,
        };
        return transformed;
      });
  
      return res.json(transformedData || []);
    } catch (error) {
      console.error('Error in getFavoriteArticles:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  async getFavoriteStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
  
      const { count, error } = await supabase
        .from("favorites")
        .select("*", { count: 'exact', head: true })
        .eq("article_id", id)
        .eq("user_id", userId);
  
      if (error) throw error;
  
      return res.json({ is_favorited: count ? count > 0 : false });
    } catch (error) {
      console.error('Error in getFavoriteStatus:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  private async getExistingTagNames(ids: number[]): Promise<string[]> {
    const { data } = await supabase.from("tags").select("name").in("id", ids);

    return (data || []).map((tag) => tag.name);
  }

  private async getExistingCategoryNames(ids: number[]): Promise<string[]> {
    const { data } = await supabase
      .from("categories")
      .select("name")
      .in("id", ids);

    return (data || []).map((cat) => cat.name);
  }

  private async getArticleWithRelations(
    id: number
  ): Promise<ArticleWithRelations> {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:users!articles_author_id_fkey(username, full_name, avatar_url),
        article_categories(
          categories(*)
        ),
        article_tags(
          tags(*)
        ),
        article_likes(count),
        favorites(count),
        comments(
          *,
          user:users!comments_user_id_fkey(username, full_name, avatar_url)
        )
      `
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}
