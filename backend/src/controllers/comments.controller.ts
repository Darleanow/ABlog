import { Response } from "express";
import { supabase } from "../config/database";
import { AuthenticatedRequest, Comment } from "../models";
import { CreateCommentBody } from "../models/comment";

export class CommentsController {
    async getCommentsByArticleId(req: AuthenticatedRequest, res: Response) {
        try {
            const { articleId } = req.params;
            const articleIdNum = parseInt(articleId, 10);

            if (isNaN(articleIdNum)) {
                return res.status(400).json({ error: "Invalid article ID" });
            }

            const { data: article, error: articleError } = await supabase
                .from("articles")
                .select("id")
                .eq("id", articleIdNum)
                .single();

            if (articleError || !article) {
                return res.status(404).json({ error: "Article not found" });
            }

            const { data: comments, error } = await supabase
                .from("comments")
                .select(`
                    *,
                    user:users (
                        id,
                        username,
                        avatar_url
                    )
                `)
                .eq("article_id", articleId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return res.json(comments);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getCommentById(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            const { data: comment, error } = await supabase
                .from("comments")
                .select(`
                    *,
                    user:users (
                        id,
                        username,
                        avatar_url
                    )
                `)
                .eq("id", id)
                .single();

            if (error) throw error;
            if (!comment) return res.status(404).json({ error: "Comment not found" });

            return res.json(comment);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getRepliesByCommentId(req: AuthenticatedRequest, res: Response) {
        try {
            const { commentId } = req.params;

            const { data: parentComment, error: parentError } = await supabase
                .from("comments")
                .select("id")
                .eq("id", commentId)
                .single();

            if (parentError || !parentComment) {
                return res.status(404).json({ error: "Parent comment not found" });
            }

            const { data: replies, error } = await supabase
                .from("comments")
                .select(`
                    *,
                    user:users (
                        id,
                        username,
                        avatar_url
                    )
                `)
                .eq("parent_comment_id", commentId)
                .order("created_at", { ascending: true });

            if (error) throw error;

            return res.json(replies);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createComment(req: AuthenticatedRequest, res: Response) {
        try {
            const { articleId } = req.params;
            const { content, parent_comment_id } = req.body as CreateCommentBody;

            if (!content) {
                return res.status(400).json({ error: "Comment content is required" });
            }

            const { data: article, error: articleError } = await supabase
                .from("articles")
                .select("id")
                .eq("id", articleId)
                .single();

            if (articleError || !article) {
                return res.status(404).json({ error: "Article not found" });
            }

            if (parent_comment_id) {
                const { data: parentComment, error: parentError } = await supabase
                    .from("comments")
                    .select("id")
                    .eq("id", parent_comment_id)
                    .single();

                if (parentError || !parentComment) {
                    return res.status(404).json({ error: "Parent comment not found" });
                }
            }

            const { data: comment, error: insertError } = await supabase
                .from("comments")
                .insert({
                    content,
                    user_id: req.user.id,
                    article_id: parseInt(articleId, 10),
                    parent_comment_id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } satisfies Partial<Comment>)
                .select(`
                    *,
                    user:users (
                        id,
                        username,
                        avatar_url
                    )
                `)
                .single();

            if (insertError) throw insertError;

            return res.status(201).json(comment);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async updateComment(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { content } = req.body as CreateCommentBody;

            if (!content) {
                return res.status(400).json({ error: "Comment content is required" });
            }

            // Vérifier si le commentaire existe et appartient à l'utilisateur
            const { data: existingComment, error: fetchError } = await supabase
                .from("comments")
                .select("user_id")
                .eq("id", id)
                .single();

            if (fetchError || !existingComment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            if (existingComment.user_id !== req.user.id) {
                return res.status(403).json({ error: "You can only update your own comments" });
            }

            const { data: updatedComment, error: updateError } = await supabase
                .from("comments")
                .update({
                    content,
                    updated_at: new Date().toISOString()
                })
                .eq("id", id)
                .select(`
                    *,
                    user:users (
                        id,
                        username,
                        avatar_url
                    )
                `)
                .single();

            if (updateError) throw updateError;

            return res.json(updatedComment);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async deleteComment(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            // Vérifier si le commentaire existe
            const { data: existingComment, error: fetchError } = await supabase
                .from("comments")
                .select("user_id")
                .eq("id", id)
                .single();

            if (fetchError || !existingComment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            const { data: user } = await supabase
                .from("users")
                .select("is_admin")
                .eq("id", req.user.id)
                .single();

            if (existingComment.user_id !== req.user.id && !user?.is_admin) {
                return res.status(403).json({ error: "You can only delete your own comments" });
            }

            const { error: deleteError } = await supabase
                .from("comments")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}