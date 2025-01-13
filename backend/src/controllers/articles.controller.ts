import { Response } from "express";
import { supabase } from "../config/database";
import slugify from "slugify";
import {
  AuthenticatedRequest,
  CreateArticleBody,
  UpdateArticleBody,
  Article,
  ArticleWithRelations,
  ArticleCategoryInsert,
  ArticleTagInsert,
} from "../models/types";

export class ArticlesController {
  async getAllArticles(_req: AuthenticatedRequest, res: Response) {
    try {
      const { data, error } = (await supabase
        .from("articles")
        .select(`
            *,
            author:users(username, full_name, avatar_url),
            categories(*),
            tags(*),
            article_likes(count),
            favorites(count)
          `)
        .eq("status", "published")
        .order("created_at", { ascending: false })) as {
        data: ArticleWithRelations[] | null;
        error: any;
      };

      if (error) throw error;

      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getArticleBySlug(req: AuthenticatedRequest, res: Response) {
    try {
      const { slug } = req.params;
      const { data, error } = (await supabase
        .from("articles")
        .select(`
            *,
            author:users(username, full_name, avatar_url),
            categories(*),
            tags(*),
            comments(
              *,
              user:users(username, full_name, avatar_url)
            ),
            article_likes(count),
            favorites(count)
          `)
        .eq("slug", slug)
        .single()) as {
        data: ArticleWithRelations | null;
        error: any;
      };

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Article not found" });

      // Increment view count
      await supabase
        .from("articles")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", data.id);

      return res.json(data);
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
      } = req.body as CreateArticleBody;

      // Create the article
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

      // Add categories if provided
      if (categoryIds?.length) {
        const { error: categoriesError } = await supabase
          .from("article_categories")
          .insert(
            categoryIds.map(
              (categoryId: number): ArticleCategoryInsert => ({
                article_id: article.id,
                category_id: categoryId,
              })
            )
          );

        if (categoriesError) throw categoriesError;
      }

      // Add tags if provided
      if (tagIds?.length) {
        const { error: tagsError } = await supabase.from("article_tags").insert(
          tagIds.map(
            (tagId: number): ArticleTagInsert => ({
              article_id: article.id,
              tag_id: tagId,
            })
          )
        );

        if (tagsError) throw tagsError;
      }

      // Fetch the complete article with relations
      const { data: articleWithRelations, error: fetchError } = (await supabase
        .from("articles")
        .select(`
            *,
            author:users(username, full_name, avatar_url),
            categories(*),
            tags(*)
          `)
        .eq("id", article.id)
        .single()) as {
        data: ArticleWithRelations | null;
        error: any;
      };

      if (fetchError) throw fetchError;

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

      // Check if user is the author or admin
      const { data: article, error: fetchError } = await supabase
        .from("articles")
        .select("author_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!article) return res.status(404).json({ error: "Article not found" });

      // Verify ownership or admin status
      const { data: user } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", req.user.id)
        .single();

      if (article.author_id !== req.user.id && !user?.is_admin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Update the article
      const updateData: Partial<Article> = {};
      if (title) {
        updateData.title = title;
        updateData.slug = slugify(title, { lower: true });
      }
      if (content) updateData.content = content;
      if (excerpt) updateData.excerpt = excerpt;
      if (featured_image_url) updateData.featured_image_url = featured_image_url;
      if (status) updateData.status = status;

      const { error: updateError } = await supabase
        .from("articles")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update categories if provided
      if (categoryIds) {
        await supabase.from("article_categories").delete().eq("article_id", id);

        if (categoryIds.length) {
          await supabase.from("article_categories").insert(
            categoryIds.map(
              (categoryId: number): ArticleCategoryInsert => ({
                article_id: parseInt(id),
                category_id: categoryId,
              })
            )
          );
        }
      }

      // Update tags if provided
      if (tagIds) {
        await supabase.from("article_tags").delete().eq("article_id", id);

        if (tagIds.length) {
          await supabase.from("article_tags").insert(
            tagIds.map(
              (tagId: number): ArticleTagInsert => ({
                article_id: parseInt(id),
                tag_id: tagId,
              })
            )
          );
        }
      }

      // Fetch the updated article with all relations
      const { data: articleWithRelations, error: finalFetchError } = (await supabase
        .from("articles")
        .select(`
            *,
            author:users(username, full_name, avatar_url),
            categories(*),
            tags(*),
            article_likes(count),
            favorites(count)
          `)
        .eq("id", id)
        .single()) as {
        data: ArticleWithRelations | null;
        error: any;
      };

      if (finalFetchError) throw finalFetchError;

      return res.json(articleWithRelations);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}