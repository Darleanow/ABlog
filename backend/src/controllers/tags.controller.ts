import { Response } from "express";
import { supabase } from "../config/database";
import slugify from "slugify";
import { AuthenticatedRequest, Tag } from "../models";

interface CreateTagBody {
  name: string;
}

interface UpdateTagBody {
  name: string;
}

export class TagsController {
  async getTagsByArticleId(req: AuthenticatedRequest, res: Response) {
    try {
      const { articleId } = req.params;

      const { data: article, error: articleError } = await supabase
        .from("articles")
        .select("id")
        .eq("id", articleId)
        .single();

      if (articleError || !article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const { data: tags, error } = (await supabase
        .from("article_tags")
        .select(
          `
                    tags (
                        id,
                        name,
                        slug,
                        created_at
                    )
                `
        )
        .eq("article_id", articleId)) as {
        data: { tags: Tag }[] | null;
        error: any;
      };

      if (error) throw error;

      const transformedTags = tags?.map((item) => item.tags) || [];

      return res.json(transformedTags);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAllTags(_req: AuthenticatedRequest, res: Response) {
    try {
      const { data, error } = (await supabase
        .from("tags")
        .select("*")
        .order("name")) as { data: Tag[] | null; error: any };

      if (error) throw error;

      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getTagBySlug(req: AuthenticatedRequest, res: Response) {
    try {
      const { slug } = req.params;

      const { data, error } = (await supabase
        .from("tags")
        .select("*")
        .eq("slug", slug)
        .single()) as { data: Tag | null; error: any };

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Tag not found" });

      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createTag(req: AuthenticatedRequest, res: Response) {
    try {
      const { name } = req.body as CreateTagBody;

      if (!name) {
        return res.status(400).json({ error: "Tag name is required" });
      }

      const { data: user } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", req.user.id)
        .single();

      if (!user?.is_admin) {
        return res.status(403).json({ error: "Only admins can create tags" });
      }

      const slug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      });

      const { data: existingTag } = (await supabase
        .from("tags")
        .select("slug")
        .eq("slug", slug)
        .single()) as { data: Tag | null; error: any };

      if (existingTag) {
        return res
          .status(400)
          .json({ error: "Tag with this name already exists" });
      }

      const { data: tag, error: insertError } = (await supabase
        .from("tags")
        .insert({
          name,
          slug,
          created_at: new Date().toISOString(),
        } satisfies Partial<Tag>)
        .select()
        .single()) as { data: Tag | null; error: any };

      if (insertError) throw insertError;

      return res.status(201).json(tag);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateTag(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body as UpdateTagBody;

      if (!name) {
        return res.status(400).json({ error: "Tag name is required" });
      }

      const { data: user } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", req.user.id)
        .single();

      if (!user?.is_admin) {
        return res.status(403).json({ error: "Only admins can update tags" });
      }

      const slug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      });

      const { data: slugExists } = await supabase
        .from("tags")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (slugExists) {
        return res
          .status(400)
          .json({ error: "Tag with this name already exists" });
      }

      const { data: updatedTag, error: updateError } = (await supabase
        .from("tags")
        .update({ name, slug })
        .eq("id", id)
        .select()
        .single()) as { data: Tag | null; error: any };

      if (updateError) throw updateError;
      if (!updatedTag) return res.status(404).json({ error: "Tag not found" });

      return res.json(updatedTag);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteTag(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const { data: user } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", req.user.id)
        .single();

      if (!user?.is_admin) {
        return res.status(403).json({ error: "Only admins can delete tags" });
      }

      const { data: existingTag, error: fetchError } = (await supabase
        .from("tags")
        .select("*")
        .eq("id", id)
        .single()) as { data: Tag | null; error: any };

      if (fetchError || !existingTag) {
        return res.status(404).json({ error: "Tag not found" });
      }

      const { error: deleteError } = await supabase
        .from("tags")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
