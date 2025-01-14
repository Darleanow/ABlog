import { Response } from "express";
import { supabase } from "../config/database";
import slugify from "slugify";
import { AuthenticatedRequest, Category } from "../models";

interface CreateCategoryBody {
    name: string;
    description?: string;
}

interface UpdateCategoryBody {
    name: string;
    description?: string;
}

export class CategoriesController {
    async getCategoriesByArticleId(req: AuthenticatedRequest, res: Response) {
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

            const { data: categories, error } = await supabase
                .from("article_categories")
                .select(`
                    categories (
                        id,
                        name,
                        slug,
                        description,
                        created_at
                    )
                `)
                .eq("article_id", articleId) as { data: { categories: Category }[] | null; error: any };

            if (error) throw error;

            const transformedCategories = categories?.map(item => item.categories) || [];

            return res.json(transformedCategories);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getAllCategories(_req: AuthenticatedRequest, res: Response) {
        try {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name") as { data: Category[] | null; error: any };

            if (error) throw error;

            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getCategoryBySlug(req: AuthenticatedRequest, res: Response) {
        try {
            const { slug } = req.params;

            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("slug", slug)
                .single() as { data: Category | null; error: any };

            if (error) throw error;
            if (!data) return res.status(404).json({ error: "Category not found" });

            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createCategory(req: AuthenticatedRequest, res: Response) {
        try {
            const { name, description } = req.body as CreateCategoryBody;

            if (!name) {
                return res.status(400).json({ error: "Category name is required" });
            }

            const { data: user } = await supabase
                .from("users")
                .select("is_admin")
                .eq("id", req.user.id)
                .single();

            if (!user?.is_admin) {
                return res.status(403).json({ error: "Only admins can create categories" });
            }

            const slug = slugify(name, {
                lower: true,
                strict: true,
                trim: true
            });

            const { data: existingCategory } = await supabase
                .from("categories")
                .select("slug")
                .eq("slug", slug)
                .single() as { data: Category | null; error: any };

            if (existingCategory) {
                return res.status(400).json({ error: "Category with this name already exists" });
            }

            const { data: category, error: insertError } = await supabase
                .from("categories")
                .insert({
                    name,
                    slug,
                    description,
                    created_at: new Date().toISOString()
                } satisfies Partial<Category>)
                .select()
                .single() as { data: Category | null; error: any };

            if (insertError) throw insertError;

            return res.status(201).json(category);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async updateCategory(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { name, description } = req.body as UpdateCategoryBody;

            if (!name) {
                return res.status(400).json({ error: "Category name is required" });
            }

            const { data: user } = await supabase
                .from("users")
                .select("is_admin")
                .eq("id", req.user.id)
                .single();

            if (!user?.is_admin) {
                return res.status(403).json({ error: "Only admins can update categories" });
            }

            const slug = slugify(name, {
                lower: true,
                strict: true,
                trim: true
            });

            const { data: slugExists } = await supabase
                .from("categories")
                .select("id")
                .eq("slug", slug)
                .neq("id", id)
                .single();

            if (slugExists) {
                return res.status(400).json({ error: "Category with this name already exists" });
            }

            const updateData: Partial<Category> = {
                name,
                slug
            };

            if (description !== undefined) {
                updateData.description = description;
            }

            const { data: updatedCategory, error: updateError } = await supabase
                .from("categories")
                .update(updateData)
                .eq("id", id)
                .select()
                .single() as { data: Category | null; error: any };

            if (updateError) throw updateError;
            if (!updatedCategory) return res.status(404).json({ error: "Category not found" });

            return res.json(updatedCategory);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async deleteCategory(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            const { data: user } = await supabase
                .from("users")
                .select("is_admin")
                .eq("id", req.user.id)
                .single();

            if (!user?.is_admin) {
                return res.status(403).json({ error: "Only admins can delete categories" });
            }

            const { data: existingCategory, error: fetchError } = await supabase
                .from("categories")
                .select("*")
                .eq("id", id)
                .single() as { data: Category | null; error: any };

            if (fetchError || !existingCategory) {
                return res.status(404).json({ error: "Category not found" });
            }

            const { error: deleteError } = await supabase
                .from("categories")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}