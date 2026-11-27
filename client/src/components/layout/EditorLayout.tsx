'use client';

import React from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import styles from './EditorLayout.module.css';

interface EditorLayoutProps {
  children: React.ReactNode;
  title?: string;
  onTitleChange?: (title: string) => void;
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export default function EditorLayout({
  children,
  title = '',
  onTitleChange,
  onSave,
  onPublish,
  onPreview,
  isSaving = false,
  isPublishing = false,
}: EditorLayoutProps) {
  const router = useRouter();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <input
            type="text"
            className={styles.titleInput}
            placeholder="Untitled Post"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            aria-label="Post title"
          />
        </div>
        <div className={styles.headerRight}>
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Eye size={16} />}
              onClick={onPreview}
            >
              Preview
            </Button>
          )}
          {onSave && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Save size={16} />}
              onClick={onSave}
              isLoading={isSaving}
            >
              Save
            </Button>
          )}
          {onPublish && (
            <Button
              variant="primary"
              size="sm"
              onClick={onPublish}
              isLoading={isPublishing}
            >
              Publish
            </Button>
          )}
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
