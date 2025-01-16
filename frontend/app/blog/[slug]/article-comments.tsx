"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@nextui-org/avatar";

import { CommentsApi } from "@/lib/api/comments-api";
import { UserComment } from "@/lib/models/article-comment";

interface CommentsSectionProps {
  readonly articleId: number;
}

export function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id} className="mb-4 border-b pb-2">
              <div className="flex items-center space-x-3 mb-2">
                <Avatar
                  className="h-12 w-12 ring-2 ring-orange-200 dark:ring-orange-800/50 ring-offset-2 ring-offset-background"
                  name={comment.user.username}
                  src={comment.user.avatar_url ?? undefined}
                />
                <span className="font-bold">{comment.user.username}</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p>{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
