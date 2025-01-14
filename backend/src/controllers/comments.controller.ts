import {Response} from "express";
import {supabase} from "../config/database";
import {AuthenticatedRequest} from "../models/auth";
import {Comment, CreateCommentBody} from "../models/comment";

export class CommentsController {
    async getCommentsByArticleId(req: AuthenticatedRequest, res: Response) {
        try {
            const { article_id } = req.params;
            const { data, error }: { data: Comment[] | null; error: any } = await supabase
                .from("comments")
                .select(`
                *,
                user:users!comments_user_id_fkey(username, full_name, avatar_url),
                replies:comments!comments_parent_comment_id_fkey(*, user:users!comments_user_id_fkey(username, full_name, avatar_url))
                `)
                .eq("article_id", article_id);

            if (error) throw error;

            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createComment(req: AuthenticatedRequest, res: Response) {
        try {
            const { content, parent_comment_id } = req.body as CreateCommentBody;
            const { article_id } = req.params;
            const { data: newComment, error: insertError } = await supabase
                .from("comments")
                .insert({
                    content,
                    user_id: req.user.id,
                    article_id: article_id,
                    parent_comment_id: parent_comment_id || null,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            const { data: fullComment, error: fetchError } = await supabase
                .from("comments")
                .select(`
                *,
                user:users!comments_user_id_fkey(username, full_name, avatar_url)
                `)
                .eq("id", newComment.id)
                .single();

            if (fetchError) throw fetchError;

            return res.status(201).json(fullComment);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async deleteComment(req: AuthenticatedRequest, res: Response) {
        try {
            const {id} = req.params;

            const {data: comment, error: fetchError} = await supabase
                .from("comments")
                .select("user_id")
                .eq("id", id)
                .single();

            if (fetchError) throw fetchError;
            if (!comment) return res.status(404).json({error: "Comment not found"});

            if (comment.user_id !== req.user.id) {
                return res.status(403).json({error: "Unauthorized"});
            }

            const {error} = await supabase.from("comments").delete().eq("id", id);
            if (error) throw error;

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({error: error.message});
        }
    }

    async updateComment(req: AuthenticatedRequest, res: Response) {
        try {
            const {id} = req.params;
            const {content} = req.body;

            if (!content) {
                return res.status(400).json({error: "Content is required"});
            }

            const {data: comment, error: fetchError} = await supabase
                .from("comments")
                .select("user_id")
                .eq("id", id)
                .single();

            if (fetchError) throw fetchError;
            if (!comment) return res.status(404).json({error: "Comment not found"});

            if (comment.user_id !== req.user.id) {
                return res.status(403).json({error: "Unauthorized"});
            }

            const {data, error} = await supabase
                .from("comments")
                .update({content})
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            return res.json(data);
        } catch (error) {
            return res.status(500).json({error: error.message});
        }
    }
}
