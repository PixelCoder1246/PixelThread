'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Send, Loader2 } from 'lucide-react';
import styles from './CommentSection.module.css';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<unknown>;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
  isReply?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder = 'What are your thoughts?',
  submitLabel = 'Respond',
  onCancel,
  isReply = false,
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(trimmed);
      setContent('');
      if (onCancel) onCancel();
    } catch {
      // Handled by mutation / toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={isReply ? styles.replyFormBox : styles.formContainer}
    >
      {!isReply && user && (
        <div className={styles.formAuthorRow}>
          <Avatar
            src={user.image || undefined}
            fallback={(user.name || user.username || 'U')
              .charAt(0)
              .toUpperCase()}
            size="sm"
          />
          <span className={styles.formAuthorName}>
            {user.name || user.username}
          </span>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className={styles.textarea}
        rows={isReply ? 2 : 3}
        maxLength={2000}
        required
      />

      <div className={styles.formFooter}>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          <span>{submitLabel}</span>
        </Button>
      </div>
    </form>
  );
}
