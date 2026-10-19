'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import {
  ArrowLeft,
  Save,
  Send,
  X,
  Plus,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { postsService } from '@/services/posts.service';
import type { PostListItem, ContentBlock } from '@/types/post';
import styles from './PostEditor.module.css';

interface PostEditorProps {
  initialData?: PostListItem;
  isEditing?: boolean;
}

const DRAFT_KEY = 'pixelthread_new_post_draft';

function normalizeInitialContent(
  content: unknown
): Record<string, unknown> | string {
  if (!content) return '<p></p>';
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        if (parsed.type === 'doc') return parsed;
        if (Array.isArray(parsed)) return { type: 'doc', content: parsed };
      }
    } catch {
      return `<p>${content}</p>`;
    }
  }
  if (Array.isArray(content)) {
    return { type: 'doc', content };
  }
  if (
    typeof content === 'object' &&
    (content as { type?: string }).type === 'doc'
  ) {
    return content as Record<string, unknown>;
  }
  return '<p></p>';
}

export function PostEditor({
  initialData,
  isEditing = false,
}: PostEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(
    initialData?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
  );
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>(
    initialData?.visibility === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC'
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(() => {
    if (!initialData?.tags) return [];
    return initialData.tags
      .map((t) => {
        if (typeof t === 'string') return t;
        if (t.tag?.name) return t.tag.name;
        return (t as { name?: string }).name ?? '';
      })
      .filter(Boolean);
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
    ],
    content: normalizeInitialContent(initialData?.content),
    editorProps: {
      attributes: {
        class: styles.editorArea,
      },
    },
    immediatelyRender: false,
  });

  // Restore draft from localStorage when creating new post
  useEffect(() => {
    if (isEditing) return;
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title && !title) setTitle(parsed.title);
        if (parsed.excerpt && !excerpt) setExcerpt(parsed.excerpt);
        if (parsed.tags && tags.length === 0) setTags(parsed.tags);
        if (parsed.content && editor && editor.isEmpty) {
          editor.commands.setContent(parsed.content);
        }
      }
    } catch {
      // Ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, editor]);

  // Autosave draft every 15 seconds
  useEffect(() => {
    if (isEditing || !editor) return;

    const interval = setInterval(() => {
      const jsonContent = editor.getJSON();
      if (title.trim() || !editor.isEmpty) {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            title,
            excerpt,
            tags,
            content: jsonContent,
            savedAt: new Date().toISOString(),
          })
        );
        const now = new Date();
        setLastSaved(
          `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
        );
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isEditing, editor, title, excerpt, tags]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        if (tags.length >= 8) {
          toast({
            title: 'Tag limit reached',
            message: 'You can add up to 8 tags.',
            type: 'info',
          });
          return;
        }
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (submitStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim() || title.trim().length < 3) {
      toast({
        title: 'Title required',
        message: 'Post title must be at least 3 characters long.',
        type: 'error',
      });
      return;
    }

    if (!editor || editor.isEmpty) {
      toast({
        title: 'Content required',
        message: 'Please write some content for your post.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const editorJson = editor.getJSON();
      const contentBlocks: ContentBlock[] = Array.isArray(editorJson.content)
        ? (editorJson.content as ContentBlock[])
        : [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: editor.getText() }],
            },
          ];

      if (isEditing && initialData?.id) {
        const res = await postsService.updatePost(initialData.id, {
          title: title.trim(),
          content: contentBlocks,
          excerpt: excerpt.trim() || undefined,
          status: submitStatus,
          visibility,
          tags,
        });

        toast({
          title: 'Post updated',
          message: 'Your story has been updated successfully.',
          type: 'success',
        });

        router.push(`/posts/${res.post.slug}`);
      } else {
        const res = await postsService.createPost({
          title: title.trim(),
          content: contentBlocks,
          excerpt: excerpt.trim() || undefined,
          status: submitStatus,
          visibility,
          tags,
        });

        localStorage.removeItem(DRAFT_KEY);

        toast({
          title:
            submitStatus === 'PUBLISHED' ? 'Post published!' : 'Draft saved!',
          message:
            submitStatus === 'PUBLISHED'
              ? 'Your story is now live.'
              : 'Your draft has been saved successfully.',
          type: 'success',
        });

        if (submitStatus === 'PUBLISHED') {
          router.push(`/posts/${res.post.slug}`);
        } else {
          router.push('/posts/my-posts');
        }
      }
    } catch (err) {
      toast({
        title: 'Error saving post',
        message:
          err instanceof Error ? err.message : 'An unexpected error occurred.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <Link
            href={isEditing ? `/posts/${initialData?.slug}` : '/posts'}
            className={styles.backLink}
          >
            <ArrowLeft size={16} />
            <span>Cancel</span>
          </Link>
          <h1 className={styles.pageHeading}>
            {isEditing ? 'Edit Story' : 'New Story'}
          </h1>
        </div>

        {lastSaved && (
          <div className={styles.statusIndicator}>
            <CheckCircle size={14} style={{ color: '#10b981' }} />
            <span>Autosaved at {lastSaved}</span>
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your story..."
          className={styles.titleInput}
          maxLength={200}
        />

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Add a short subtitle or excerpt (optional)..."
          className={styles.excerptInput}
          rows={2}
          maxLength={300}
        />

        <div className={styles.editorWrapper}>
          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>

        <div className={styles.metaSection}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tags</label>
            <div className={styles.tagInputWrapper}>
              {tags.length > 0 && (
                <div className={styles.tagChips}>
                  {tags.map((t) => (
                    <span key={t} className={styles.tagChip}>
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className={styles.removeTagBtn}
                        aria-label={`Remove tag ${t}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter (e.g. webdev, react)"
                className={styles.tagInput}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Visibility</label>
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')
              }
              className={styles.select}
            >
              <option value="PUBLIC">Public (everyone can read)</option>
              <option value="PRIVATE">Private (only you can read)</option>
            </select>
          </div>
        </div>

        <div className={styles.actionBar}>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleSubmit('DRAFT')}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>Save as Draft</span>
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('PUBLISHED')}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span>{isEditing ? 'Save Changes' : 'Publish Story'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
