"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { motion } from "framer-motion";

import { CommentsApi } from "@/lib/api/comments-api";
import { UserComment } from "@/lib/models/article-comment";
import { useAuth } from "@/contexts/auth-context";

interface CommentsSectionProps {
  readonly articleId: number;
}

export function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      const commentsApi = new CommentsApi();

      try {
        const fetchedComments =
          await commentsApi.getCommentsByArticleId(articleId);

        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [articleId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    const commentsApi = new CommentsApi();

    setIsSubmitting(true);

    try {
      const createdComment = await commentsApi.createComment(
        articleId,
        newComment.trim(),
      );

      setComments([createdComment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <>
      {user && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Comments</h2>

          {/* Comment Form */}
          <form className="mb-6" onSubmit={handleCommentSubmit}>
            <div className="flex items-start gap-4">
              <Avatar
                className="h-10 w-10 ring-2 ring-orange-300 dark:ring-orange-800/30 ring-offset-2 ring-offset-background"
                name={user.full_name}
              />
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800/30 
                focus:outline-none focus:ring-2 focus:ring-orange-500/50
                bg-gradient-to-br from-orange-50/50 to-rose-50/50 hover:from-orange-100/50 hover:to-rose-100/50
                dark:from-orange-500/5 dark:to-rose-500/5 dark:hover:from-orange-500/10 dark:hover:to-rose-500/10
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                transition-all duration-300 resize-y min-h-[120px]"
                disabled={isSubmitting}
                placeholder="Write your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="bg-gradient-to-r from-orange-600 to-rose-600 text-white hover:opacity-90 dark:from-orange-500 dark:to-rose-500"
                  disabled={isSubmitting || !newComment.trim()}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </motion.div>
            </div>
          </form>

          {/* Comment List */}
          {comments.length === 0 ? (
            <p className="text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <ul>
              {comments.map((comment) => (
                <li key={comment.id} className="mb-4 border-b pb-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar
                      className="h-12 w-12 ring-2 ring-orange-300 dark:ring-orange-800/50 ring-offset-2 ring-offset-background"
                      name={comment.user.username}
                      src={comment.user.avatar_url ?? undefined}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {comment.user.username}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1">{comment.content}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
