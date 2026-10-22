'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { useAuth } from '@/features/auth/useAuth';
import { useToggleCommentLike } from '@/features/likes/useLike';
import { CommentForm } from './CommentForm';
import type { Comment } from '@/types/comment';
import styles from './CommentSection.module.css';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReply: (commentId: string, content: string) => Promise<unknown>;
  onUpdate: (commentId: string, content: string) => Promise<unknown>;
  onDelete: (commentId: string) => Promise<unknown>;
  level?: number;
}

export function CommentItem({
  comment,
  postId,
  onReply,
  onUpdate,
  onDelete,
  level = 0,
}: CommentItemProps) {
  const { user, isAuthenticated } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);

  // Local optimistic like state
  const [liked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);

  useEffect(() => {
    setLiked(comment.isLiked);
    setLikeCount(comment.likeCount);
  }, [comment.isLiked, comment.likeCount]);

  const toggleLike = useToggleCommentLike(comment.id);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      await toggleLike.mutateAsync();
    } catch {
      // Revert on failure
      setLiked(!nextLiked);
      setLikeCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || isUpdating) return;
    try {
      setIsUpdating(true);
      await onUpdate(comment.id, trimmed);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const isOwner = user?.id === comment.author.id;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const canManage = isOwner || isAdmin;

  const formattedDate = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : '';

  const isEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  const dropdownItems = [
    ...(isOwner
      ? [
          {
            label: 'Edit',
            onClick: () => setIsEditing(true),
            icon: <Edit2 size={14} />,
          },
        ]
      : []),
    ...(canManage
      ? [
          {
            label: 'Delete',
            onClick: () => {
              if (window.confirm('Delete this comment and all its replies?')) {
                onDelete(comment.id);
              }
            },
            icon: <Trash2 size={14} />,
            variant: 'danger' as const,
          },
        ]
      : []),
  ];

  return (
    <div className={styles.itemWrapper}>
      <div className={styles.itemCard}>
        <div className={styles.itemHeader}>
          <div className={styles.authorMeta}>
            <Avatar
              src={comment.author.image || undefined}
              fallback={(comment.author.name || 'U').charAt(0).toUpperCase()}
              size="sm"
            />
            <div>
              <Link
                href={`/users/${comment.author.name}`}
                className={styles.authorName}
              >
                {comment.author.name}
              </Link>
              <div className="flex items-center gap-1.5">
                <span className={styles.commentDate}>{formattedDate}</span>
                {isEdited && (
                  <span className={styles.editedBadge}>(edited)</span>
                )}
              </div>
            </div>
          </div>

          {canManage && dropdownItems.length > 0 && (
            <Dropdown
              trigger={
                <button
                  type="button"
                  className={styles.actionBtn}
                  aria-label="Comment options"
                >
                  <MoreHorizontal size={16} />
                </button>
              }
              items={dropdownItems}
              align="right"
            />
          )}
        </div>

        {isEditing ? (
          <div className={styles.editForm}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={styles.editInput}
              rows={3}
              maxLength={2000}
            />
            <div className={styles.editActions}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditContent(comment.content);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || isUpdating}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.itemContent}>{comment.content}</div>
        )}

        <div className={styles.itemActions}>
          <button
            type="button"
            onClick={handleLike}
            className={`${styles.actionBtn} ${liked ? styles.actionBtnActive : ''}`}
            title={isAuthenticated ? 'Like comment' : 'Sign in to like'}
          >
            <Heart size={14} />
            <span>{likeCount}</span>
          </button>

          {level < 4 && (
            <button
              type="button"
              onClick={() => setIsReplying(!isReplying)}
              className={styles.actionBtn}
            >
              <MessageSquare size={14} />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>

      {isReplying && (
        <CommentForm
          isReply
          placeholder={`Reply to @${comment.author.name}...`}
          submitLabel="Reply"
          onCancel={() => setIsReplying(false)}
          onSubmit={async (text) => {
            await onReply(comment.id, text);
            setIsReplying(false);
          }}
        />
      )}

      {/* Recursive replies rendering */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
