'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Wand2,
  Type,
  Tags,
  FileText,
  Bot,
  X,
  ImagePlus,
  Keyboard,
  Clock,
  BookOpen,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import EditorLayout from '@/components/layout/EditorLayout';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { usePost, useUpdatePost } from '@/hooks/usePosts';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboard } from '@/hooks/useKeyboard';
import { aiService } from '@/services/ai';
import { cn, calculateReadingTime } from '@/lib/utils';
import type { PostFormData } from '@/types';
import styles from './page.module.css';

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedSlug(p.slug));
  }, [params]);

  const { data: post, isLoading, isError, refetch } = usePost(resolvedSlug || '');
  const updatePost = useUpdatePost(post?.id || '');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const debouncedContent = useDebounce(content, 30000);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = calculateReadingTime(content);

  useEffect(() => {
    if (post && !initialized) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setStatus(post.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
      setVisibility(post.visibility || 'PUBLIC');
      setTags(post.tags?.map((t) => t.name) || []);
      setExcerpt(post.excerpt || '');
      setInitialized(true);
    }
  }, [post, initialized]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        const trimmed = tagInput.trim().toLowerCase();
        if (!tags.includes(trimmed)) {
          setTags((prev) => [...prev, trimmed]);
        }
        setTagInput('');
      }
    },
    [tagInput, tags],
  );

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleCoverUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!post?.id) return;
    setIsSaving(true);
    setSaveState('saving');
    try {
      const data: Partial<PostFormData> = {
        title: title || 'Untitled',
        content,
        excerpt: excerpt || undefined,
        status,
        visibility,
        tags,
      };
      await updatePost.mutateAsync(data);
      setSaveState('saved');
      toast.success('Draft saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [post?.id, title, content, excerpt, status, visibility, tags, updatePost]);

  const handlePublish = useCallback(async () => {
    if (!post?.id) return;
    setIsSaving(true);
    setSaveState('saving');
    try {
      const data: Partial<PostFormData> = {
        title: title || 'Untitled',
        content,
        excerpt: excerpt || undefined,
        status: 'PUBLISHED',
        visibility,
        tags,
      };
      const updated = await updatePost.mutateAsync(data);
      setSaveState('saved');
      toast.success('Post published!');
      const slug = (updated as unknown as { slug?: string })?.slug;
      if (slug) {
        router.push(`/posts/${slug}`);
      }
    } catch {
      setSaveState('error');
      toast.error('Failed to publish post');
    } finally {
      setIsSaving(false);
    }
  }, [post?.id, title, content, excerpt, visibility, tags, updatePost, router]);

  const handleAiAction = useCallback(
    async (action: string) => {
      setAiLoading(action);
      setAiResult(null);
      try {
        let result;
        switch (action) {
          case 'generate':
            result = await aiService.generatePost({
              topic: title || 'blog post',
              targetAudience: 'general',
              tone: 'professional',
              approximateLength: 'medium',
            });
            if (result.content) handleContentChange(result.content);
            break;
          case 'improve':
            result = await aiService.improveWriting(content);
            if (result.improvedContent) {
              handleContentChange(result.improvedContent);
              setAiResult('Content improved');
            }
            break;
          case 'title':
            result = await aiService.generateTitles(content);
            if (result.title) {
              handleTitleChange(result.title);
              setAiResult(`Title generated: ${result.title}`);
            }
            break;
          case 'tags':
            result = await aiService.generateTags(content);
            if (result.tags) {
              setTags(result.tags);
              setAiResult(`Tags generated: ${result.tags.join(', ')}`);
            }
            break;
          case 'excerpt':
            result = await aiService.generateExcerpt(content);
            if (result.excerpt) {
              setExcerpt(result.excerpt);
              setAiResult('Excerpt generated');
            }
            break;
          default:
            break;
        }
      } catch {
        toast.error(`AI ${action} failed`);
      } finally {
        setAiLoading(null);
      }
    },
    [title, content, handleContentChange, handleTitleChange],
  );

  useKeyboard([
    {
      key: 'k',
      modifiers: ['meta'],
      handler: () => setShowShortcuts((prev) => !prev),
    },
    {
      key: 'k',
      modifiers: ['ctrl'],
      handler: () => setShowShortcuts((prev) => !prev),
    },
    {
      key: 's',
      modifiers: ['meta'],
      handler: (e) => {
        e.preventDefault();
        handleSave();
      },
    },
    {
      key: 's',
      modifiers: ['ctrl'],
      handler: (e) => {
        e.preventDefault();
        handleSave();
      },
    },
    {
      key: 'a',
      modifiers: ['meta'],
      handler: (e) => { e.preventDefault(); setShowAiPanel((prev) => !prev); },
    },
    {
      key: 'a',
      modifiers: ['ctrl'],
      handler: (e) => { e.preventDefault(); setShowAiPanel((prev) => !prev); },
    },
    {
      key: ',',
      modifiers: ['meta'],
      handler: (e) => { e.preventDefault(); setShowSettings((prev) => !prev); },
    },
    {
      key: ',',
      modifiers: ['ctrl'],
      handler: (e) => { e.preventDefault(); setShowSettings((prev) => !prev); },
    },
  ]);

  const aiActions = [
    { id: 'generate', label: 'Generate with AI', icon: Sparkles },
    { id: 'improve', label: 'Improve Writing', icon: Wand2 },
    { id: 'title', label: 'Generate Title', icon: Type },
    { id: 'tags', label: 'Generate Tags', icon: Tags },
    { id: 'excerpt', label: 'Generate Excerpt', icon: FileText },
  ] as const;

  if (!post?.id || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingState message="Loading post..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <ErrorState message="Failed to load post" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <EditorLayout
      title={title}
      onTitleChange={handleTitleChange}
      onSave={handleSave}
      onPublish={handlePublish}
      isSaving={isSaving}
      isPublishing={updatePost.isPending && status === 'PUBLISHED'}
    >
      <div className={cn(styles.container, !showAiPanel && styles.aiCollapsed)}>
        <div className={styles.editorArea}>
          <input
            type="text"
            className={styles.titleInput}
            placeholder="Untitled Post"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            aria-label="Post title"
          />

          <div className={styles.editorWrapper}>
            <div className={styles.editor}>
              <div
                contentEditable
                role="textbox"
                aria-label="Post content"
                style={{ minHeight: 400, outline: 'none' }}
                onInput={(e) => handleContentChange((e.target as HTMLElement).textContent || '')}
              />
            </div>
          </div>
        </div>

        <aside className={cn(styles.rightRail, showAiPanel && styles.open)}>
          <div className={styles.aiPanel}>
            <div className={styles.aiPanelHeader}>
              <span className={styles.aiPanelTitle}>
                <Bot size={16} />
                AI Assistant
              </span>
              <button
                type="button"
                className={styles.aiPanelToggle}
                onClick={() => setShowAiPanel((prev) => !prev)}
                aria-label={showAiPanel ? 'Hide AI Assistant' : 'Show AI Assistant'}
              >
                <ChevronRight size={16} className={showAiPanel ? styles.rotated : ''} />
              </button>
            </div>
            <div className={styles.aiPanelBody}>
              <div className={styles.aiButtonGroup}>
                {aiActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={styles.aiButton}
                    onClick={() => handleAiAction(action.id)}
                    disabled={aiLoading !== null}
                  >
                    <span className={styles.aiButtonIcon}>
                      <action.icon size={16} />
                    </span>
                    {aiLoading === action.id ? 'Working...' : action.label}
                  </button>
                ))}
              </div>
              {aiResult && <div className={styles.aiResult}>{aiResult}</div>}
            </div>
          </div>

          <div className={cn(styles.settingsDrawer, showSettings && styles.open)}>
            <div className={styles.settingsDrawerHeader}>
              <span className={styles.settingsDrawerTitle}>
                <Settings size={16} />
                Post Settings
              </span>
              <button
                type="button"
                className={styles.settingsDrawerClose}
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.settingsDrawerBody}>
              <div className={styles.sidebarSection}>
                <p className={styles.sidebarLabel}>Status</p>
                <select
                  className={styles.selectField}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div className={styles.sidebarSection}>
                <p className={styles.sidebarLabel}>Visibility</p>
                <select
                  className={styles.selectField}
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div className={styles.sidebarSection}>
                <p className={styles.sidebarLabel}>Tags</p>
                <input
                  type="text"
                  className={styles.tagsInput}
                  placeholder="Add tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
                {tags.length > 0 && (
                  <div className={styles.tagsList}>
                    {tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                        <button
                          type="button"
                          className={styles.tagRemove}
                          onClick={() => handleRemoveTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.sidebarSection}>
                <p className={styles.sidebarLabel}>Excerpt</p>
                <textarea
                  className={styles.excerptTextarea}
                  placeholder="Write a brief excerpt..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={300}
                />
              </div>

              <div className={styles.sidebarSection}>
                <p className={styles.sidebarLabel}>Cover Image</p>
                <label className={styles.coverUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    style={{ display: 'none' }}
                  />
                  {coverImage ? (
                    <>
                      <img src={coverImage} alt="Cover" className={styles.coverPreview} />
                      <div className={styles.coverOverlay}>
                        <span style={{ color: 'white', fontSize: 'var(--fs-sm)' }}>Change image</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.coverPlaceholder}>
                      <ImagePlus size={24} />
                      <span>Add cover image</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </aside>

        {showShortcuts && (
          <div className={styles.shortcutModal} onClick={() => setShowShortcuts(false)}>
            <div className={styles.shortcutContent} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.shortcutTitle}>Keyboard Shortcuts</h2>
              <div className={styles.shortcutGrid}>
                <div className={styles.shortcutRow}>
                  <span className={styles.shortcutLabel}>Save draft</span>
                  <div className={styles.shortcutKeys}>
                    <span className={styles.shortcutKey}>⌘</span>
                    <span className={styles.shortcutKey}>S</span>
                  </div>
                </div>
                <div className={styles.shortcutRow}>
                  <span className={styles.shortcutLabel}>Toggle AI panel</span>
                  <div className={styles.shortcutKeys}>
                    <span className={styles.shortcutKey}>⌘</span>
                    <span className={styles.shortcutKey}>A</span>
                  </div>
                </div>
                <div className={styles.shortcutRow}>
                  <span className={styles.shortcutLabel}>Toggle settings</span>
                  <div className={styles.shortcutKeys}>
                    <span className={styles.shortcutKey}>⌘</span>
                    <span className={styles.shortcutKey}>⇧</span>
                    <span className={styles.shortcutKey}>S</span>
                  </div>
                </div>
                <div className={styles.shortcutRow}>
                  <span className={styles.shortcutLabel}>Bold</span>
                  <div className={styles.shortcutKeys}>
                    <span className={styles.shortcutKey}>⌘</span>
                    <span className={styles.shortcutKey}>B</span>
                  </div>
                </div>
                <div className={styles.shortcutRow}>
                  <span className={styles.shortcutLabel}>Italic</span>
                  <div className={styles.shortcutKeys}>
                    <span className={styles.shortcutKey}>⌘</span>
                    <span className={styles.shortcutKey}>I</span>
                  </div>
                </div>
                <div className={styles.shortcutRow}>
                  <span className={styles.shortcutLabel}>Keyboard shortcuts</span>
                  <div className={styles.shortcutKeys}>
                    <span className={styles.shortcutKey}>⌘</span>
                    <span className={styles.shortcutKey}>K</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={styles.shortcutCloseBtn}
                onClick={() => setShowShortcuts(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomBarLeft}>
          <span className={styles.saveIndicator}>
            <span
              className={cn(
                styles.saveDot,
                saveState === 'saving' && styles.saving,
                saveState === 'saved' && styles.saved,
                saveState === 'error' && styles.error,
              )}
            />
            {saveState === 'idle' && 'Not saved'}
            {saveState === 'saving' && 'Saving...'}
            {saveState === 'saved' && 'Saved'}
            {saveState === 'error' && 'Save failed'}
          </span>
        </div>
        <div className={styles.bottomBarRight}>
          <button
            type="button"
            className={cn(styles.settingsToggleBtn, showSettings && styles.active)}
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Toggle Settings"
            aria-expanded={showSettings}
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            type="button"
            className={cn(styles.aiToggleBtn, showAiPanel && styles.aiToggleBtnActive)}
            onClick={() => setShowAiPanel(!showAiPanel)}
            aria-label="Toggle AI Assistant"
            aria-expanded={showAiPanel}
          >
            <Bot size={14} />
            AI
          </button>
          <button
            type="button"
            className={styles.shortcutsHint}
            onClick={() => setShowShortcuts(true)}
          >
            <Keyboard size={14} />
            Shortcuts
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={14} />
            {readingTime} min read
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} />
            {wordCount} words
          </span>
        </div>
      </div>
    </EditorLayout>
  );
}
