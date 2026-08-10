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
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import EditorLayout from '@/components/layout/EditorLayout';
import { useCreatePost } from '@/hooks/usePosts';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboard } from '@/hooks/useKeyboard';
import { aiService } from '@/services/ai';
import { cn, calculateReadingTime } from '@/lib/utils';
import type { PostFormData } from '@/types';
import Editor from '@/components/editor/Editor';
import styles from './page.module.css';

export default function CreatePostPage() {
  const router = useRouter();
  const createPost = useCreatePost();
  const editorRef = useRef<any>(null);
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
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);

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
            if (result.title && !title) handleTitleChange(result.title);
            break;
          case 'improve':
            if (!content.trim()) {
              toast.error('No content to improve');
              return;
            }
            result = await aiService.improveWriting(content);
            if (result.improvedContent) {
              handleContentChange(result.improvedContent);
              setAiResult('Content improved');
            }
            break;
          case 'title':
            if (!content.trim()) {
              toast.error('Write some content first');
              return;
            }
            result = await aiService.generateTitles(content);
            if (result.titles?.[0]) {
              handleTitleChange(result.titles[0]);
              setAiResult(`Title: ${result.titles[0]}`);
            }
            break;
          case 'tags':
            if (!content.trim()) {
              toast.error('Write some content first');
              return;
            }
            result = await aiService.generateTags(content);
            if (result.tags?.length) {
              setTags(result.tags);
              setAiResult(`Tags: ${result.tags.join(', ')}`);
            }
            break;
          case 'excerpt':
            if (!content.trim()) {
              toast.error('Write some content first');
              return;
            }
            result = await aiService.generateExcerpt(content);
            if (result.excerpt) {
              setExcerpt(result.excerpt);
              setAiResult('Excerpt generated');
            }
            break;
          default:
            break;
        }
      } catch (error: any) {
        console.error('AI error:', error);
        toast.error(error.response?.data?.message || `AI ${action} failed`);
      } finally {
        setAiLoading(null);
      }
    },
    [title, content, handleContentChange, handleTitleChange],
  );

  // Editor formatting shortcuts - only work when editor is ready
  const toggleBold = useCallback(() => editorReady && editorRef.current?.chain?.().focus().toggleBold().run(), [editorReady]);
  const toggleItalic = useCallback(() => editorReady && editorRef.current?.chain?.().focus().toggleItalic().run(), [editorReady]);
  const toggleCode = useCallback(() => editorReady && editorRef.current?.chain?.().focus().toggleCode().run(), [editorReady]);
  const toggleHeading1 = useCallback(() => editorReady && editorRef.current?.chain?.().focus().toggleHeading({ level: 1 }).run(), [editorReady]);
  const toggleHeading2 = useCallback(() => editorReady && editorRef.current?.chain?.().focus().toggleHeading({ level: 2 }).run(), [editorReady]);
  const toggleHeading3 = useCallback(() => editorReady && editorRef.current?.chain?.().focus().toggleHeading({ level: 3 }).run(), [editorReady]);
  const toggleBulletList = useCallback(() => editorReady && editorRef.current?.chain?.().focus().toggleBulletList().run(), [editorReady]);
  const toggleOrderedList = useCallback(() => editorReady && editorRef.current?.chain?.().focus().toggleOrderedList().run(), [editorReady]);
  const toggleBlockquote = useCallback(() => editorReady && editorRef.current?.chain?.().focus().toggleBlockquote().run(), [editorReady]);

  // AI shortcuts
  const toggleAiPanel = useCallback(() => setShowAiPanel((prev) => !prev), []);
  const aiImprove = useCallback(() => handleAiAction('improve'), [handleAiAction]);
  const aiGenerateTitle = useCallback(() => handleAiAction('title'), [handleAiAction]);
  const aiGenerateTags = useCallback(() => handleAiAction('tags'), [handleAiAction]);
  const aiGenerateExcerpt = useCallback(() => handleAiAction('excerpt'), [handleAiAction]);

  useKeyboard([
    // Save
    { key: 's', modifiers: ['meta'], handler: (e) => { e.preventDefault(); handleSave(); } },
    { key: 's', modifiers: ['ctrl'], handler: (e) => { e.preventDefault(); handleSave(); } },
    // Shortcuts modal
    { key: 'k', modifiers: ['meta'], handler: () => setShowShortcuts((prev) => !prev) },
    { key: 'k', modifiers: ['ctrl'], handler: () => setShowShortcuts((prev) => !prev) },
    // AI Panel toggle
    { key: 'a', modifiers: ['meta'], handler: (e) => { e.preventDefault(); toggleAiPanel(); } },
    { key: 'a', modifiers: ['ctrl'], handler: (e) => { e.preventDefault(); toggleAiPanel(); } },
    // Settings toggle
    { key: ',', modifiers: ['meta'], handler: (e) => { e.preventDefault(); setShowSettings((prev) => !prev); } },
    { key: ',', modifiers: ['ctrl'], handler: (e) => { e.preventDefault(); setShowSettings((prev) => !prev); } },
    // AI Actions (Alt + letter for AI)
    { key: 'i', modifiers: ['alt'], handler: (e) => { e.preventDefault(); aiImprove(); } },
    { key: 't', modifiers: ['alt'], handler: (e) => { e.preventDefault(); aiGenerateTitle(); } },
    { key: 'g', modifiers: ['alt'], handler: (e) => { e.preventDefault(); aiGenerateTags(); } },
    { key: 'e', modifiers: ['alt'], handler: (e) => { e.preventDefault(); aiGenerateExcerpt(); } },
    // Formatting (Cmd/Ctrl + key)
    { key: 'b', modifiers: ['meta'], handler: (e) => { e.preventDefault(); toggleBold(); } },
    { key: 'b', modifiers: ['ctrl'], handler: (e) => { e.preventDefault(); toggleBold(); } },
    { key: 'i', modifiers: ['meta'], handler: (e) => { e.preventDefault(); toggleItalic(); } },
    { key: 'i', modifiers: ['ctrl'], handler: (e) => { e.preventDefault(); toggleItalic(); } },
    { key: '`', modifiers: ['meta'], handler: (e) => { e.preventDefault(); toggleCode(); } },
    { key: '`', modifiers: ['ctrl'], handler: (e) => { e.preventDefault(); toggleCode(); } },
    { key: '1', modifiers: ['meta', 'shift'], handler: (e) => { e.preventDefault(); toggleHeading1(); } },
    { key: '2', modifiers: ['meta', 'shift'], handler: (e) => { e.preventDefault(); toggleHeading2(); } },
    { key: '3', modifiers: ['meta', 'shift'], handler: (e) => { e.preventDefault(); toggleHeading3(); } },
    { key: 'l', modifiers: ['meta', 'shift'], handler: (e) => { e.preventDefault(); toggleBulletList(); } },
    { key: 'o', modifiers: ['meta', 'shift'], handler: (e) => { e.preventDefault(); toggleOrderedList(); } },
    { key: 'q', modifiers: ['meta', 'shift'], handler: (e) => { e.preventDefault(); toggleBlockquote(); } },
  ]);

  useEffect(() => {
    if (debouncedContent && debouncedContent !== content) {
      // Auto-save handled by debounce
    }
  }, [debouncedContent, content]);

  const aiActions = [
    { id: 'generate', label: 'Generate Post', icon: Sparkles, shortcut: '⌥G' },
    { id: 'improve', label: 'Improve Writing', icon: Wand2, shortcut: '⌥I' },
    { id: 'title', label: 'Generate Title', icon: Type, shortcut: '⌥T' },
    { id: 'tags', label: 'Generate Tags', icon: Tags, shortcut: '⌥G' },
    { id: 'excerpt', label: 'Generate Excerpt', icon: FileText, shortcut: '⌥E' },
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
                    <span className={styles.aiButtonShortcut}>{action.shortcut}</span>
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
                    <span className={styles.shortcutLabel}>Toggle shortcuts</span>
                    <div className={styles.shortcutKeys}>
                      <span className={styles.shortcutKey}>⌘</span>
                      <span className={styles.shortcutKey}>K</span>
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
                </div>
                <div className={styles.shortcutSection}>
                  <h3 className={styles.shortcutSectionTitle}>AI Assistant</h3>
                  <div className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>Improve writing</span>
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
                    <span className={styles.shortcutLabel}>Generate excerpt</span>
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
