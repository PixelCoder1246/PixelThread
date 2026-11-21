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
  Search,
  Share2,
  HelpCircle,
  FastForward,
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
import type { PostFormData, AiGenerationResponse } from '@/types';
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

  const {
    data: post,
    isLoading,
    isError,
    refetch,
  } = usePost(resolvedSlug || '');
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
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
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
    [tagInput, tags]
  );

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleCoverUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCoverImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

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
      setSuggestedTitles([]);
      try {
        let result: AiGenerationResponse;
        switch (action) {
          case 'generate':
            result = await aiService.generatePost({
              topic: title.trim() || 'Modern Technology and Web Engineering',
              targetAudience: 'general',
              tone: 'professional',
              approximateLength: 'medium',
            });
            if (result.content) handleContentChange(result.content);
            if (result.title && !title) handleTitleChange(result.title);
            if (result.excerpt && !excerpt) setExcerpt(result.excerpt);
            if (Array.isArray(result.tags) && tags.length === 0)
              setTags(result.tags);
            setAiResult('✨ Full post generated and applied to editor!');
            break;
          case 'improve':
            if (!content.trim()) {
              toast.error(
                'Requirement not met: Write some content in the editor first to improve it.'
              );
              return;
            }
            result = await aiService.improveWriting(content);
            if (result.improvedContent) {
              handleContentChange(result.improvedContent);
              setAiResult('✨ Writing improved and applied to editor!');
            }
            break;
          case 'title': {
            const query =
              content.trim() || title.trim() || 'Modern Web Development';
            result = await aiService.generateTitles(query);
            const titlesList: string[] = Array.isArray(result.titles)
              ? result.titles
              : result.title
                ? [result.title]
                : [];
            setSuggestedTitles(titlesList);
            if (titlesList.length > 0) {
              setAiResult(
                `Generated ${titlesList.length} titles. Pick one to apply:`
              );
            } else {
              setAiResult('No title suggestions returned.');
            }
            break;
          }
          case 'tags':
            if (!content.trim()) {
              toast.error(
                'Requirement not met: Write some content in the editor first to generate tags.'
              );
              return;
            }
            result = await aiService.generateTags(content);
            if (result.tags?.length) {
              setTags(result.tags);
              setAiResult(
                `✨ Tags generated and applied: ${result.tags.join(', ')}`
              );
            }
            break;
          case 'excerpt':
            if (!content.trim()) {
              toast.error(
                'Requirement not met: Write some content in the editor first to generate an excerpt.'
              );
              return;
            }
            result = await aiService.generateExcerpt(content);
            if (result.excerpt) {
              setExcerpt(result.excerpt);
              setAiResult(
                `✨ Excerpt generated and saved:\n"${result.excerpt}"`
              );
            }
            break;
          case 'seo': {
            const safeTitle = title.trim() || 'PixelThread Post';
            const safeContent = content.trim() || safeTitle;
            result = await aiService.generateSeo(safeTitle, safeContent);
            const seoText = `SEO Title: ${result.metaTitle || result.seoTitle || safeTitle}\n\nMeta Description: ${result.metaDescription || result.seoDescription || ''}\n\nKeywords: ${result.keywords?.join(', ') || ''}`;
            setAiResult(seoText);
            break;
          }
          case 'faq':
            if (!content.trim()) {
              toast.error(
                'Requirement not met: Write some content in the editor first to generate FAQs.'
              );
              return;
            }
            result = await aiService.generateFaq(content);
            if (Array.isArray(result.faqs) && result.faqs.length > 0) {
              const formattedFaqs = result.faqs
                .map(
                  (f: { question: string; answer: string }) =>
                    `<h3>${f.question}</h3><p>${f.answer}</p>`
                )
                .join('');
              handleContentChange(
                content +
                  '\n\n<h2>Frequently Asked Questions</h2>\n' +
                  formattedFaqs
              );
              setAiResult(
                `✨ Added ${result.faqs.length} FAQ questions to your post!`
              );
            }
            break;
          case 'social': {
            const safeContent =
              content.trim() || title.trim() || 'PixelThread post';
            result = await aiService.generateSocialPost(safeContent);
            const mainPost =
              result.socialPost ||
              result.twitter ||
              result.linkedin ||
              'Social post generated.';
            const socialFormatted =
              typeof mainPost === 'string'
                ? mainPost
                : JSON.stringify(mainPost, null, 2);
            setAiResult(`📱 Social Media Post:\n\n${socialFormatted}`);
            break;
          }
          case 'continue':
            if (!content.trim()) {
              toast.error(
                'Requirement not met: Write an opening paragraph first for AI to continue writing.'
              );
              return;
            }
            result = await aiService.continueWriting(content);
            if (result.continuation) {
              handleContentChange(content + '\n\n' + result.continuation);
              setAiResult('✨ Content continuation appended to your post!');
            }
            break;
          default:
            break;
        }
      } catch (error: unknown) {
        console.error('AI error:', error);
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || `AI ${action} failed`);
      } finally {
        setAiLoading(null);
      }
    },
    [title, content, excerpt, tags, handleContentChange, handleTitleChange]
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
      handler: (e) => {
        e.preventDefault();
        setShowAiPanel((prev) => !prev);
      },
    },
    {
      key: 'a',
      modifiers: ['ctrl'],
      handler: (e) => {
        e.preventDefault();
        setShowAiPanel((prev) => !prev);
      },
    },
    {
      key: ',',
      modifiers: ['meta'],
      handler: (e) => {
        e.preventDefault();
        setShowSettings((prev) => !prev);
      },
    },
    {
      key: ',',
      modifiers: ['ctrl'],
      handler: (e) => {
        e.preventDefault();
        setShowSettings((prev) => !prev);
      },
    },
  ]);

  const aiActions = [
    {
      id: 'generate',
      label: 'Full Post Generator',
      icon: Sparkles,
      requirement: 'Needs Post Title or Topic',
      shortcut: 'Alt+G',
      needsContent: false,
    },
    {
      id: 'improve',
      label: 'Improve Writing & Flow',
      icon: Wand2,
      requirement: 'Needs Editor Content',
      shortcut: 'Alt+I',
      needsContent: true,
    },
    {
      id: 'title',
      label: 'Generate Catchy Titles',
      icon: Type,
      requirement: 'Uses Title or Content',
      shortcut: 'Alt+T',
      needsContent: false,
    },
    {
      id: 'tags',
      label: 'Generate Relevant Tags',
      icon: Tags,
      requirement: 'Needs Editor Content',
      shortcut: 'Alt+R',
      needsContent: true,
    },
    {
      id: 'excerpt',
      label: 'Generate Summary Excerpt',
      icon: FileText,
      requirement: 'Needs Editor Content',
      shortcut: 'Alt+E',
      needsContent: true,
    },
    {
      id: 'seo',
      label: 'Generate SEO Meta & Keywords',
      icon: Search,
      requirement: 'Uses Title & Content',
      shortcut: 'Alt+S',
      needsContent: false,
    },
    {
      id: 'faq',
      label: 'Generate FAQ Section',
      icon: HelpCircle,
      requirement: 'Needs Editor Content',
      shortcut: 'Alt+F',
      needsContent: true,
    },
    {
      id: 'social',
      label: 'Generate Social Media Post',
      icon: Share2,
      requirement: 'Uses Title or Content',
      shortcut: 'Alt+P',
      needsContent: false,
    },
    {
      id: 'continue',
      label: 'Continue Writing Next Section',
      icon: FastForward,
      requirement: 'Needs Editor Content',
      shortcut: 'Alt+C',
      needsContent: true,
    },
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
                onInput={(e) =>
                  handleContentChange(
                    (e.target as HTMLElement).textContent || ''
                  )
                }
              />
            </div>
          </div>
        </div>

        <aside
          className={cn(
            styles.rightRail,
            (showAiPanel || showSettings) && styles.open
          )}
        >
          {!showSettings && (
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
                  aria-label={
                    showAiPanel ? 'Hide AI Assistant' : 'Show AI Assistant'
                  }
                >
                  <ChevronRight
                    size={16}
                    className={showAiPanel ? styles.rotated : ''}
                  />
                </button>
              </div>
              <div className={styles.aiPanelBody}>
                {/* Requirements indicator banner */}
                <div
                  style={{
                    padding: '10px 12px',
                    marginBottom: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    fontSize: '11px',
                    lineHeight: '1.4',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    Tool Input Requirements:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{title.trim() ? '🟢' : '⚪'}</span>
                      <span
                        style={{
                          color: title.trim()
                            ? 'var(--text-primary)'
                            : 'var(--text-tertiary)',
                        }}
                      >
                        <strong>Post Title:</strong>{' '}
                        {title.trim()
                          ? 'Ready'
                          : 'Not set (used for Topic/SEO)'}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{content.trim() ? '🟢' : '🟠'}</span>
                      <span
                        style={{
                          color: content.trim()
                            ? 'var(--text-primary)'
                            : 'var(--text-tertiary)',
                        }}
                      >
                        <strong>Editor Content:</strong>{' '}
                        {content.trim()
                          ? `${wordCount} words ready`
                          : 'Empty (needed for improve/tags/faq)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.aiButtonGroup}>
                  {aiActions.map((action) => {
                    const isContentRequiredAndMissing =
                      action.needsContent && !content.trim();
                    return (
                      <button
                        key={action.id}
                        type="button"
                        className={styles.aiButton}
                        onClick={() => handleAiAction(action.id)}
                        disabled={aiLoading !== null}
                        title={action.requirement}
                      >
                        <span className={styles.aiButtonIcon}>
                          <action.icon size={16} />
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            textAlign: 'left',
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <span style={{ fontWeight: 500, fontSize: '13px' }}>
                            {aiLoading === action.id
                              ? 'Working...'
                              : action.label}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              color: isContentRequiredAndMissing
                                ? '#f59e0b'
                                : 'var(--text-tertiary)',
                            }}
                          >
                            {action.requirement}
                          </span>
                        </div>
                        <span className={styles.aiButtonShortcut}>
                          {action.shortcut}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {aiResult && (
                  <div
                    className={styles.aiResult}
                    style={{ whiteSpace: 'pre-wrap', marginTop: '12px' }}
                  >
                    {aiResult}
                  </div>
                )}

                {suggestedTitles.length > 0 && (
                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Select a Title to Apply:
                    </span>
                    {suggestedTitles.map((t, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          padding: '8px 10px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-primary)',
                          fontSize: '12px',
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            color: 'var(--text-primary)',
                            lineHeight: '1.3',
                          }}
                        >
                          {t}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleTitleChange(t);
                            toast.success('Title applied to editor!');
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            background: 'var(--primary-500)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            className={cn(styles.settingsDrawer, showSettings && styles.open)}
          >
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
                  onChange={(e) =>
                    setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')
                  }
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
                  onChange={(e) =>
                    setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')
                  }
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
                      <img
                        src={coverImage}
                        alt="Cover"
                        className={styles.coverPreview}
                      />
                      <div className={styles.coverOverlay}>
                        <span
                          style={{ color: 'white', fontSize: 'var(--fs-sm)' }}
                        >
                          Change image
                        </span>
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
          <div
            className={styles.shortcutModal}
            onClick={() => setShowShortcuts(false)}
          >
            <div
              className={styles.shortcutContent}
              onClick={(e) => e.stopPropagation()}
            >
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
                  <span className={styles.shortcutLabel}>
                    Keyboard shortcuts
                  </span>
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
                saveState === 'error' && styles.error
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
            className={cn(
              styles.settingsToggleBtn,
              showSettings && styles.active
            )}
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Toggle Settings"
            aria-expanded={showSettings}
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            type="button"
            className={cn(
              styles.aiToggleBtn,
              showAiPanel && styles.aiToggleBtnActive
            )}
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
