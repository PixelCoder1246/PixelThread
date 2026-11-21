'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
import { useCreatePost } from '@/hooks/usePosts';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboard } from '@/hooks/useKeyboard';
import { aiService } from '@/services/ai';
import { cn, calculateReadingTime } from '@/lib/utils';
import type { PostFormData, AiGenerationResponse } from '@/types';
import Editor, { type EditorRef } from '@/components/editor/Editor';
import styles from './page.module.css';

export default function CreatePostPage() {
  const router = useRouter();
  const createPost = useCreatePost();
  const editorRef = useRef<EditorRef | null>(null);
  const [editorReady, setEditorReady] = useState(false);

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

  const debouncedContent = useDebounce(content, 30000);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = calculateReadingTime(content);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleEditorReady = useCallback(() => {
    setEditorReady(true);
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
    setIsSaving(true);
    setSaveState('saving');
    try {
      const data: PostFormData = {
        title: title || 'Untitled',
        content,
        excerpt: excerpt || undefined,
        status,
        visibility,
        tags,
      };
      const post = await createPost.mutateAsync(data);
      setSaveState('saved');
      toast.success('Draft saved');
      setTimeout(() => setSaveState('idle'), 2000);
      router.push(`/posts/${post.id}/edit`);
    } catch {
      setSaveState('error');
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [title, content, excerpt, status, visibility, tags, createPost, router]);

  const handlePublish = useCallback(async () => {
    setIsSaving(true);
    setSaveState('saving');
    try {
      const data: PostFormData = {
        title: title || 'Untitled',
        content,
        excerpt: excerpt || undefined,
        status: 'PUBLISHED',
        visibility,
        tags,
      };
      const post = await createPost.mutateAsync(data);
      setSaveState('saved');
      toast.success('Post published!');
      router.push(`/posts/${post.slug}`);
    } catch {
      setSaveState('error');
      toast.error('Failed to publish post');
    } finally {
      setIsSaving(false);
    }
  }, [title, content, excerpt, visibility, tags, createPost, router]);

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

  // Editor formatting shortcuts - only work when editor is ready
  const toggleBold = useCallback(
    () =>
      editorReady && editorRef.current?.chain?.().focus().toggleBold().run(),
    [editorReady]
  );
  const toggleItalic = useCallback(
    () =>
      editorReady && editorRef.current?.chain?.().focus().toggleItalic().run(),
    [editorReady]
  );
  const toggleCode = useCallback(
    () =>
      editorReady && editorRef.current?.chain?.().focus().toggleCode().run(),
    [editorReady]
  );
  const toggleHeading1 = useCallback(
    () =>
      editorReady &&
      editorRef.current?.chain?.().focus().toggleHeading({ level: 1 }).run(),
    [editorReady]
  );
  const toggleHeading2 = useCallback(
    () =>
      editorReady &&
      editorRef.current?.chain?.().focus().toggleHeading({ level: 2 }).run(),
    [editorReady]
  );
  const toggleHeading3 = useCallback(
    () =>
      editorReady &&
      editorRef.current?.chain?.().focus().toggleHeading({ level: 3 }).run(),
    [editorReady]
  );
  const toggleBulletList = useCallback(
    () =>
      editorReady &&
      editorRef.current?.chain?.().focus().toggleBulletList().run(),
    [editorReady]
  );
  const toggleOrderedList = useCallback(
    () =>
      editorReady &&
      editorRef.current?.chain?.().focus().toggleOrderedList().run(),
    [editorReady]
  );
  const toggleBlockquote = useCallback(
    () =>
      editorReady &&
      editorRef.current?.chain?.().focus().toggleBlockquote().run(),
    [editorReady]
  );

  // AI shortcuts
  const toggleAiPanel = useCallback(() => setShowAiPanel((prev) => !prev), []);
  const aiImprove = useCallback(
    () => handleAiAction('improve'),
    [handleAiAction]
  );
  const aiGenerateTitle = useCallback(
    () => handleAiAction('title'),
    [handleAiAction]
  );
  const aiGenerateTags = useCallback(
    () => handleAiAction('tags'),
    [handleAiAction]
  );
  const aiGenerateExcerpt = useCallback(
    () => handleAiAction('excerpt'),
    [handleAiAction]
  );

  useKeyboard([
    // Save
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
    // Shortcuts modal
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
    // AI Panel toggle
    {
      key: 'a',
      modifiers: ['meta'],
      handler: (e) => {
        e.preventDefault();
        toggleAiPanel();
      },
    },
    {
      key: 'a',
      modifiers: ['ctrl'],
      handler: (e) => {
        e.preventDefault();
        toggleAiPanel();
      },
    },
    // Settings toggle
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
    // AI Actions (Alt + letter for AI)
    {
      key: 'i',
      modifiers: ['alt'],
      handler: (e) => {
        e.preventDefault();
        aiImprove();
      },
    },
    {
      key: 't',
      modifiers: ['alt'],
      handler: (e) => {
        e.preventDefault();
        aiGenerateTitle();
      },
    },
    {
      key: 'g',
      modifiers: ['alt'],
      handler: (e) => {
        e.preventDefault();
        aiGenerateTags();
      },
    },
    {
      key: 'e',
      modifiers: ['alt'],
      handler: (e) => {
        e.preventDefault();
        aiGenerateExcerpt();
      },
    },
    // Formatting (Cmd/Ctrl + key)
    {
      key: 'b',
      modifiers: ['meta'],
      handler: (e) => {
        e.preventDefault();
        toggleBold();
      },
    },
    {
      key: 'b',
      modifiers: ['ctrl'],
      handler: (e) => {
        e.preventDefault();
        toggleBold();
      },
    },
    {
      key: 'i',
      modifiers: ['meta'],
      handler: (e) => {
        e.preventDefault();
        toggleItalic();
      },
    },
    {
      key: 'i',
      modifiers: ['ctrl'],
      handler: (e) => {
        e.preventDefault();
        toggleItalic();
      },
    },
    {
      key: '`',
      modifiers: ['meta'],
      handler: (e) => {
        e.preventDefault();
        toggleCode();
      },
    },
    {
      key: '`',
      modifiers: ['ctrl'],
      handler: (e) => {
        e.preventDefault();
        toggleCode();
      },
    },
    {
      key: '1',
      modifiers: ['meta', 'shift'],
      handler: (e) => {
        e.preventDefault();
        toggleHeading1();
      },
    },
    {
      key: '2',
      modifiers: ['meta', 'shift'],
      handler: (e) => {
        e.preventDefault();
        toggleHeading2();
      },
    },
    {
      key: '3',
      modifiers: ['meta', 'shift'],
      handler: (e) => {
        e.preventDefault();
        toggleHeading3();
      },
    },
    {
      key: 'l',
      modifiers: ['meta', 'shift'],
      handler: (e) => {
        e.preventDefault();
        toggleBulletList();
      },
    },
    {
      key: 'o',
      modifiers: ['meta', 'shift'],
      handler: (e) => {
        e.preventDefault();
        toggleOrderedList();
      },
    },
    {
      key: 'q',
      modifiers: ['meta', 'shift'],
      handler: (e) => {
        e.preventDefault();
        toggleBlockquote();
      },
    },
  ]);

  useEffect(() => {
    if (debouncedContent && debouncedContent !== content) {
      // Auto-save handled by debounce
    }
  }, [debouncedContent, content]);

  const aiActions = [
    {
      id: 'generate',
      label: 'Generate Full Post',
      icon: Sparkles,
      shortcut: '⌥G',
      requirement: 'Needs a Topic (from title or prompt)',
      needsContent: false,
    },
    {
      id: 'improve',
      label: 'Improve Writing',
      icon: Wand2,
      shortcut: '⌥I',
      requirement: 'Needs text in the editor',
      needsContent: true,
    },
    {
      id: 'title',
      label: 'Generate Titles',
      icon: Type,
      shortcut: '⌥T',
      requirement: 'Needs draft text or title',
      needsContent: false,
    },
    {
      id: 'tags',
      label: 'Generate Tags',
      icon: Tags,
      shortcut: '⌥G',
      requirement: 'Needs text in the editor',
      needsContent: true,
    },
    {
      id: 'excerpt',
      label: 'Generate Excerpt',
      icon: FileText,
      shortcut: '⌥E',
      requirement: 'Needs text in the editor',
      needsContent: true,
    },
    {
      id: 'seo',
      label: 'Generate SEO Meta',
      icon: Search,
      shortcut: '⌥S',
      requirement: 'Needs post title & content',
      needsContent: false,
    },
    {
      id: 'faq',
      label: 'Generate FAQ Section',
      icon: HelpCircle,
      shortcut: '⌥F',
      requirement: 'Needs text in the editor',
      needsContent: true,
    },
    {
      id: 'social',
      label: 'Generate Social Post',
      icon: Share2,
      shortcut: '⌥P',
      requirement: 'Needs text in the editor',
      needsContent: true,
    },
    {
      id: 'continue',
      label: 'Continue Writing',
      icon: FastForward,
      shortcut: '⌥C',
      requirement: 'Needs text in the editor',
      needsContent: true,
    },
  ] as const;

  return (
    <EditorLayout
      title={title}
      onTitleChange={handleTitleChange}
      onSave={handleSave}
      onPublish={handlePublish}
      isSaving={isSaving}
      isPublishing={createPost.isPending && status === 'PUBLISHED'}
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
            <div className={styles.editor} ref={editorRef}>
              <Editor
                ref={editorRef}
                content={content}
                onChange={handleContentChange}
                onReady={handleEditorReady}
                placeholder="Start writing..."
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
                <div className={styles.shortcutSection}>
                  <h3 className={styles.shortcutSectionTitle}>General</h3>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Save draft</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>S</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>
                      Toggle shortcuts
                    </span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>K</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>
                      Toggle AI panel
                    </span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>A</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>
                      Toggle settings
                    </span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>⇧</span>
                      <span className={styles.shortcutKey}>S</span>
                    </div>
                  </div>
                </div>
                <div className={styles.shortcutSection}>
                  <h3 className={styles.shortcutSectionTitle}>AI Assistant</h3>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>
                      Improve writing
                    </span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌥</span>
                      <span className={styles.shortcutKey}>I</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Generate title</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌥</span>
                      <span className={styles.shortcutKey}>T</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Generate tags</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌥</span>
                      <span className={styles.shortcutKey}>G</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>
                      Generate excerpt
                    </span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌥</span>
                      <span className={styles.shortcutKey}>E</span>
                    </div>
                  </div>
                </div>
                <div className={styles.shortcutSection}>
                  <h3 className={styles.shortcutSectionTitle}>Formatting</h3>
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
                    <span className={styles.shortcutLabel}>Inline code</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>`</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Heading 1</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>⇧</span>
                      <span className={styles.shortcutKey}>1</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Heading 2</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>⇧</span>
                      <span className={styles.shortcutKey}>2</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Heading 3</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>⇧</span>
                      <span className={styles.shortcutKey}>3</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Bullet list</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>⇧</span>
                      <span className={styles.shortcutKey}>L</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Ordered list</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>⇧</span>
                      <span className={styles.shortcutKey}>O</span>
                    </div>
                  </div>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Blockquote</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>⇧</span>
                      <span className={styles.shortcutKey}>Q</span>
                    </div>
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
