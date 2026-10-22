'use client';

import Link from 'next/link';
import { MessageSquare, MessagesSquare } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import {
  useThreadedComments,
  useCreateComment,
  useCreateReply,
  useUpdateComment,
  useDeleteComment,
  countTotalComments,
} from '@/features/comments/useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { Comment } from '@/types/comment';
import styles from './CommentSection.module.css';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { isAuthenticated } = useAuth();
  const { data: comments = [], isLoading } = useThreadedComments(postId);

  const createComment = useCreateComment(postId);
  const createReply = useCreateReply(postId);
  const updateComment = useUpdateComment(postId);
  const deleteComment = useDeleteComment(postId);

  const totalCount = countTotalComments(comments);

  const handleRootSubmit = async (content: string) => {
    await createComment.mutateAsync(content);
  };

  const handleReplySubmit = async (commentId: string, content: string) => {
    await createReply.mutateAsync({ commentId, content });
  };

  const handleUpdate = async (commentId: string, content: string) => {
    await updateComment.mutateAsync({ commentId, content });
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment.mutateAsync(commentId);
  };

  return (
    <section
      className={styles.commentSection}
      id="comments"
      aria-label="Responses"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>
          <MessageSquare size={22} className="text-indigo-400" />
          <span>Responses</span>
          {totalCount > 0 && (
            <span className={styles.countBadge}>{totalCount}</span>
          )}
        </h2>
      </div>

      {isAuthenticated ? (
        <CommentForm
          onSubmit={handleRootSubmit}
          placeholder="Share your perspectives on this story..."
          submitLabel="Respond"
        />
      ) : (
        <div className={styles.unauthPrompt}>
          <p>
            Join the discussion to share your thoughts and reply to authors.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login">
              <Button size="sm">Sign In to Respond</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" variant="outline">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="md" />
        </div>
      ) : comments.length === 0 ? (
        <div className={styles.emptyState}>
          <MessagesSquare size={36} className={styles.emptyIcon} />
          <p>No responses yet. Be the first to start the conversation!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={handleReplySubmit}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
