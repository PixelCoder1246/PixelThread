'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Wand2,
  FileText,
  Share2,
  HelpCircle,
  CheckCheck,
  History,
  Zap,
  ArrowRight,
  RefreshCw,
  Plus,
  Sliders,
  Type,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAI, useAIHistory, AIHistoryItem } from '@/features/ai/useAI';
import { useToast } from '@/components/ui/Toast';
import styles from './AIPanel.module.css';

interface AIPanelProps {
  editor: Editor | null;
  title: string;
  onSetTitle: (title: string) => void;
  excerpt: string;
  onSetExcerpt: (excerpt: string) => void;
  tags: string[];
  onSetTags: (tags: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabKey =
  | 'draft'
  | 'refine'
  | 'headlines'
  | 'social'
  | 'critique'
  | 'history';

const TONES = [
  'professional',
  'casual',
  'friendly',
  'technical',
  'academic',
  'storytelling',
] as const;

const AI_CATEGORIES = [
  'technology',
  'lifestyle',
  'health',
  'business',
  'education',
  'entertainment',
  'science',
  'travel',
  'food',
  'finance',
  'sports',
  'politics',
  'culture',
  'other',
] as const;

const AI_LENGTHS = [
  { value: 'short', label: 'Short (300-800 words)' },
  { value: 'medium', label: 'Medium (800-1500 words)' },
  { value: 'long', label: 'Long (1500-2500 words)' },
  { value: 'comprehensive', label: 'Comprehensive (2500+ words)' },
] as const;

import { markdownToHtml, markdownToPlainText } from '@/lib/markdown';

export function AIPanel({
  editor,
  title,
  onSetTitle,
  excerpt: _excerpt,
  onSetExcerpt,
  tags,
  onSetTags,
  isOpen,
  onClose,
}: AIPanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('draft');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draftViewMode, setDraftViewMode] = useState<'formatted' | 'raw'>(
    'formatted'
  );
  const [refineViewMode, setRefineViewMode] = useState<'formatted' | 'raw'>(
    'formatted'
  );

  // AI Hook mutations
  const {
    generatePost,
    generateTitles,
    generateExcerpt,
    generateTags,
    improveWriting,
    rewriteContent,
    expandContent,
    shortenContent,
    continueWriting,
    summarizeContent,
    generateFAQ,
    generateSocialPosts,
    generateSuggestions,
    applySuggestions,
    isAnyLoading,
  } = useAI();

  const { history, clearHistory } = useAIHistory();

  // Tab 1: Draft Inputs
  const [draftTopic, setDraftTopic] = useState('');
  const [draftTone, setDraftTone] =
    useState<(typeof TONES)[number]>('professional');
  const [draftCategory, setDraftCategory] = useState<string>('');
  const [draftLength, setDraftLength] = useState<
    'short' | 'medium' | 'long' | 'comprehensive'
  >('medium');
  const [draftAudience, setDraftAudience] = useState('');
  const [draftKeywords, setDraftKeywords] = useState('');

  // Tab 2: Refine Inputs
  const [selectedTone, setSelectedTone] =
    useState<(typeof TONES)[number]>('friendly');

  // Selected Text in TipTap
  const getEditorSelection = () => {
    if (!editor) return '';
    const { from, to } = editor.state.selection;
    if (from === to) return '';
    return editor.state.doc.textBetween(from, to, ' ');
  };

  const getFullContent = () => {
    return editor ? editor.getText() : '';
  };

  const hasSelection = Boolean(getEditorSelection());

  const getRefineContent = (): string => {
    if (improveWriting.data?.improvedContent)
      return improveWriting.data.improvedContent;
    if (improveWriting.data?.content)
      return String(improveWriting.data.content);
    if (rewriteContent.data?.rewrittenContent)
      return rewriteContent.data.rewrittenContent;
    if (rewriteContent.data?.content)
      return String(rewriteContent.data.content);
    if (expandContent.data?.expandedContent)
      return expandContent.data.expandedContent;
    if (expandContent.data?.content) return String(expandContent.data.content);
    if (shortenContent.data?.shortenedContent)
      return shortenContent.data.shortenedContent;
    if (shortenContent.data?.content)
      return String(shortenContent.data.content);
    if (continueWriting.data?.continuation)
      return continueWriting.data.continuation;
    if (continueWriting.data?.content)
      return String(continueWriting.data.content);
    if (summarizeContent.data?.paragraphSummary)
      return summarizeContent.data.paragraphSummary;
    if (summarizeContent.data?.oneLineSummary)
      return summarizeContent.data.oneLineSummary;
    if (summarizeContent.data?.summary) return summarizeContent.data.summary;
    return '';
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: 'Copied to clipboard',
      message: 'Content copied successfully',
      type: 'success',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertAtCursor = (text: string) => {
    if (!editor) return;
    const html = markdownToHtml(text);
    editor.chain().focus().insertContent(html).run();
    toast({
      title: 'Inserted into story',
      message: 'AI generated content added to your post',
      type: 'success',
    });
  };

  const handleReplaceSelection = (text: string) => {
    if (!editor) return;
    const html = markdownToHtml(text);
    editor.chain().focus().insertContent(html).run();
    toast({
      title: 'Selection updated',
      message: 'Highlighted content replaced with AI refinement',
      type: 'success',
    });
  };

  const handleApplyFullPost = (data: {
    title?: string;
    excerpt?: string;
    content?: unknown;
    suggestedTags?: string[];
    tags?: string[];
  }) => {
    if (data.title) onSetTitle(data.title);
    if (data.excerpt) onSetExcerpt(data.excerpt);
    const tagsToAdd = data.suggestedTags || data.tags;
    if (tagsToAdd && tagsToAdd.length > 0) {
      const merged = Array.from(new Set([...tags, ...tagsToAdd]));
      onSetTags(merged);
    }
    if (data.content && editor) {
      const html = markdownToHtml(String(data.content));
      editor.commands.setContent(html);
    }
    toast({
      title: 'Post Applied!',
      message: 'Title, excerpt, content, and tags populated successfully.',
      type: 'success',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile/Tablet Backdrop Blur */}
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />

      <aside className={styles.panel} aria-label="AI Writing Assistant Panel">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <Sparkles className={styles.sparkleIcon} size={20} />
            <div>
              <h2 className={styles.title}>AI Writing Studio</h2>
              <p className={styles.subtitle}>
                Supercharge your writing with AI
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.tokenBadge}>
              <Zap size={12} />
              AI Ready
            </span>
            <button
              type="button"
              onClick={onClose}
              className={styles.closeBtn}
              aria-label="Close AI panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabsList} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'draft'}
            onClick={() => setActiveTab('draft')}
            className={`${styles.tabBtn} ${activeTab === 'draft' ? styles.tabBtnActive : ''}`}
          >
            <Sparkles size={14} />
            <span>Draft</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'refine'}
            onClick={() => setActiveTab('refine')}
            className={`${styles.tabBtn} ${activeTab === 'refine' ? styles.tabBtnActive : ''}`}
          >
            <Wand2 size={14} />
            <span>Refine</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'headlines'}
            onClick={() => setActiveTab('headlines')}
            className={`${styles.tabBtn} ${activeTab === 'headlines' ? styles.tabBtnActive : ''}`}
          >
            <FileText size={14} />
            <span>Headlines & SEO</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'social'}
            onClick={() => setActiveTab('social')}
            className={`${styles.tabBtn} ${activeTab === 'social' ? styles.tabBtnActive : ''}`}
          >
            <Share2 size={14} />
            <span>Social & FAQs</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'critique'}
            onClick={() => setActiveTab('critique')}
            className={`${styles.tabBtn} ${activeTab === 'critique' ? styles.tabBtnActive : ''}`}
          >
            <CheckCheck size={14} />
            <span>Critique</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabBtnActive : ''}`}
          >
            <History size={14} />
            <span>History</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className={styles.contentArea}>
          {/* Highlight Indicator if user highlighted text */}
          {hasSelection && activeTab === 'refine' && (
            <div className={styles.selectionBanner}>
              <Wand2 size={14} />
              <span className={styles.selectionText}>
                Active selection: &quot;{getEditorSelection().substring(0, 45)}
                ...&quot;
              </span>
            </div>
          )}

          {/* TAB 1: DRAFT A FULL POST */}
          {activeTab === 'draft' && (
            <div className={styles.formGroup}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Story Topic or Prompt *
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {draftTopic.length}/500
                  </span>
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder="e.g. How WebAssembly and Next.js are revolutionizing fullstack web apps..."
                  value={draftTopic}
                  onChange={(e) => setDraftTopic(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Desired Tone</label>
                <div className={styles.pillGrid}>
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDraftTone(t)}
                      className={`${styles.pillBtn} ${draftTone === t ? styles.pillBtnActive : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Length & Category</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}
                >
                  <select
                    className={styles.select}
                    value={draftLength}
                    onChange={(e) =>
                      setDraftLength(
                        e.target.value as
                          | 'short'
                          | 'medium'
                          | 'long'
                          | 'comprehensive'
                      )
                    }
                  >
                    {AI_LENGTHS.map((len) => (
                      <option key={len.value} value={len.value}>
                        {len.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.select}
                    value={draftCategory}
                    onChange={(e) => setDraftCategory(e.target.value)}
                  >
                    <option value="">Category (Optional)</option>
                    {AI_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}
                >
                  <div>
                    <label className={styles.label}>
                      Target Audience (Opt)
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. React developers"
                      value={draftAudience}
                      onChange={(e) => setDraftAudience(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Keywords (Opt)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. RSC, Next.js"
                      value={draftKeywords}
                      onChange={(e) => setDraftKeywords(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.generateBtn}
                disabled={!draftTopic.trim() || generatePost.isPending}
                onClick={() => {
                  generatePost.mutate({
                    topic: draftTopic.trim(),
                    tone: draftTone,
                    category: draftCategory || undefined,
                    approximateLength: draftLength,
                    targetAudience: draftAudience.trim() || undefined,
                    keywords: draftKeywords.trim() || undefined,
                  });
                }}
              >
                {generatePost.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Writing Story with AI... (approx 30s)</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Complete Post</span>
                  </>
                )}
              </button>

              {generatePost.isError && (
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    fontSize: '0.8rem',
                  }}
                >
                  {generatePost.error instanceof Error
                    ? generatePost.error.message
                    : 'Failed to generate post.'}
                </div>
              )}

              {/* Result Preview */}
              {generatePost.data && (
                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultTitle}>Generated Story</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div className={styles.viewModeToggle}>
                        <button
                          type="button"
                          className={`${styles.viewModeBtn} ${draftViewMode === 'formatted' ? styles.viewModeBtnActive : ''}`}
                          onClick={() => setDraftViewMode('formatted')}
                        >
                          Formatted
                        </button>
                        <button
                          type="button"
                          className={`${styles.viewModeBtn} ${draftViewMode === 'raw' ? styles.viewModeBtnActive : ''}`}
                          onClick={() => setDraftViewMode('raw')}
                        >
                          Markdown
                        </button>
                      </div>
                      <span className={styles.tokenBadge}>
                        ⚡ {generatePost.data.tokenUsage?.totalTokens || 0}{' '}
                        tokens
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: '0.9rem',
                        color: '#f8fafc',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {generatePost.data.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.76rem',
                        color: '#94a3b8',
                        margin: '0 0 8px 0',
                      }}
                    >
                      {generatePost.data.excerpt}
                    </p>
                  </div>

                  {draftViewMode === 'formatted' ? (
                    <div
                      className={styles.resultBodyFormatted}
                      dangerouslySetInnerHTML={{
                        __html: markdownToHtml(
                          String(generatePost.data.content || '')
                        ),
                      }}
                    />
                  ) : (
                    <div className={styles.resultBody}>
                      {String(generatePost.data.content || '')}
                    </div>
                  )}

                  <div className={styles.resultActions}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                      onClick={() => handleApplyFullPost(generatePost.data)}
                      title="Convert markdown into rich text and code blocks directly in your editor"
                    >
                      <ArrowRight size={14} />
                      <span>Apply to Editor</span>
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() =>
                        handleCopy(
                          `${generatePost.data.title}\n\n${markdownToPlainText(String(generatePost.data.content || ''))}`,
                          'gen-post-plain'
                        )
                      }
                      title="Copy normal plain text without markdown symbols"
                    >
                      {copiedId === 'gen-post-plain' ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span>Copy Plain Text</span>
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() =>
                        handleCopy(
                          `${generatePost.data.title}\n\n${String(generatePost.data.content || '')}`,
                          'gen-post'
                        )
                      }
                      title="Copy raw markdown text"
                    >
                      {copiedId === 'gen-post' ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span>Copy Markdown</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REFINE & POLISH */}
          {activeTab === 'refine' && (
            <div className={styles.formGroup}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tone for Rewriting</label>
                <div className={styles.pillGrid}>
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTone(t)}
                      className={`${styles.pillBtn} ${selectedTone === t ? styles.pillBtnActive : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.actionGrid}>
                {/* 1. Improve Writing */}
                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={improveWriting.isPending}
                  onClick={() => {
                    const text = getEditorSelection() || getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'No text found',
                        message: 'Write or highlight some text to improve.',
                        type: 'info',
                      });
                      return;
                    }
                    improveWriting.mutate({ content: text });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <Wand2 size={16} color="#8b5cf6" />
                    <span>Improve Writing</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Fix grammar, clarity & elevate vocabulary.
                  </p>
                </button>

                {/* 2. Rewrite with Tone */}
                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={rewriteContent.isPending}
                  onClick={() => {
                    const text = getEditorSelection() || getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'No text found',
                        message: 'Write or highlight some text to rewrite.',
                        type: 'info',
                      });
                      return;
                    }
                    rewriteContent.mutate({
                      content: text,
                      tone: selectedTone,
                    });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <Sliders size={16} color="#3b82f6" />
                    <span>Rewrite ({selectedTone})</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Shift style while preserving key facts.
                  </p>
                </button>

                {/* 3. Expand Content */}
                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={expandContent.isPending}
                  onClick={() => {
                    const text = getEditorSelection() || getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'No text found',
                        message: 'Write or highlight some text to expand.',
                        type: 'info',
                      });
                      return;
                    }
                    expandContent.mutate({ content: text });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <Maximize2 size={16} color="#10b981" />
                    <span>Expand Section</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Elaborate with deeper examples & details.
                  </p>
                </button>

                {/* 4. Shorten Content */}
                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={shortenContent.isPending}
                  onClick={() => {
                    const text = getEditorSelection() || getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'No text found',
                        message: 'Write or highlight some text to shorten.',
                        type: 'info',
                      });
                      return;
                    }
                    shortenContent.mutate({ content: text });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <Minimize2 size={16} color="#f59e0b" />
                    <span>Make Concise</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Trim fluff into crisp, high-impact phrasing.
                  </p>
                </button>

                {/* 5. Continue Writing */}
                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={continueWriting.isPending}
                  onClick={() => {
                    const text = getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'No story text',
                        message: 'Start writing a paragraph to continue.',
                        type: 'info',
                      });
                      return;
                    }
                    continueWriting.mutate({ content: text });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <ArrowRight size={16} color="#ec4899" />
                    <span>Continue Story</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Seamlessly write the next paragraph.
                  </p>
                </button>

                {/* 6. Summarize */}
                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={summarizeContent.isPending}
                  onClick={() => {
                    const text = getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'No text found',
                        message: 'Write some content first to summarize.',
                        type: 'info',
                      });
                      return;
                    }
                    summarizeContent.mutate({ content: text });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <FileText size={16} color="#06b6d4" />
                    <span>Summarize</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Generate one-liner and bullet takeaways.
                  </p>
                </button>

                {/* 7. Markdown to Rich Text & Code */}
                <button
                  type="button"
                  className={styles.actionCard}
                  onClick={() => {
                    const text = getEditorSelection() || getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'No text found',
                        message: 'Write or paste markdown text to convert.',
                        type: 'info',
                      });
                      return;
                    }
                    const html = markdownToHtml(text);
                    if (hasSelection) {
                      editor?.chain().focus().insertContent(html).run();
                    } else {
                      editor?.commands.setContent(html);
                    }
                    toast({
                      title: 'Converted to Rich Text!',
                      message:
                        'Markdown converted to formatted text and interactive code blocks.',
                      type: 'success',
                    });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <Wand2 size={16} color="#a855f7" />
                    <span>Markdown to Rich Text</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Convert markdown in story to formatted text & code.
                  </p>
                </button>
              </div>

              {/* Any Refine Result Rendering */}
              {(improveWriting.data ||
                rewriteContent.data ||
                expandContent.data ||
                shortenContent.data ||
                continueWriting.data ||
                summarizeContent.data) && (
                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultTitle}>
                      Refinement Output
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div className={styles.viewModeToggle}>
                        <button
                          type="button"
                          className={`${styles.viewModeBtn} ${refineViewMode === 'formatted' ? styles.viewModeBtnActive : ''}`}
                          onClick={() => setRefineViewMode('formatted')}
                        >
                          Formatted
                        </button>
                        <button
                          type="button"
                          className={`${styles.viewModeBtn} ${refineViewMode === 'raw' ? styles.viewModeBtnActive : ''}`}
                          onClick={() => setRefineViewMode('raw')}
                        >
                          Markdown
                        </button>
                      </div>
                      <span className={styles.tokenBadge}>⚡ AI Completed</span>
                    </div>
                  </div>

                  {refineViewMode === 'formatted' ? (
                    <div
                      className={styles.resultBodyFormatted}
                      dangerouslySetInnerHTML={{
                        __html: markdownToHtml(getRefineContent()),
                      }}
                    />
                  ) : (
                    <div className={styles.resultBody}>
                      {getRefineContent()}
                    </div>
                  )}

                  <div className={styles.resultActions}>
                    {hasSelection ? (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                        onClick={() =>
                          handleReplaceSelection(getRefineContent())
                        }
                      >
                        <Wand2 size={14} />
                        <span>Replace Selection</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                        onClick={() => handleInsertAtCursor(getRefineContent())}
                      >
                        <Plus size={14} />
                        <span>Insert at Cursor</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() =>
                        handleCopy(
                          markdownToPlainText(getRefineContent()),
                          'refine-plain'
                        )
                      }
                      title="Copy as plain normal text"
                    >
                      {copiedId === 'refine-plain' ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span>Copy Plain Text</span>
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() =>
                        handleCopy(getRefineContent(), 'refine-res')
                      }
                      title="Copy raw markdown"
                    >
                      {copiedId === 'refine-res' ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span>Copy Markdown</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HEADLINES & SEO */}
          {activeTab === 'headlines' && (
            <div className={styles.formGroup}>
              {/* Generate Titles */}
              <button
                type="button"
                className={styles.generateBtn}
                disabled={generateTitles.isPending}
                onClick={() => {
                  const text = getFullContent() || title;
                  if (!text.trim()) {
                    toast({
                      title: 'Content needed',
                      message:
                        'Write a draft or title first to suggest headlines.',
                      type: 'info',
                    });
                    return;
                  }
                  generateTitles.mutate({ content: text });
                }}
              >
                {generateTitles.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Generating Headlines...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate 5 Catchy Headlines</span>
                  </>
                )}
              </button>

              {/* Title Suggestions Result */}
              {generateTitles.data?.titles && (
                <div className={styles.titlesList}>
                  {generateTitles.data.titles.map((t, idx) => {
                    const titleText =
                      typeof t === 'string'
                        ? t
                        : (t as { title: string }).title;
                    const score =
                      typeof t === 'object' && 'confidenceScore' in t
                        ? (t as { confidenceScore: number }).confidenceScore
                        : 95;
                    return (
                      <div key={idx} className={styles.titleItem}>
                        <span className={styles.titleItemText}>
                          {titleText}
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span className={styles.titleItemScore}>
                            {score}% Match
                          </span>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => {
                              onSetTitle(titleText);
                              toast({
                                title: 'Title updated',
                                message: `Post title set to "${titleText}"`,
                                type: 'success',
                              });
                            }}
                          >
                            <Check size={12} />
                            <span>Use</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick SEO & Excerpt Buttons */}
              <div className={styles.actionGrid} style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={generateExcerpt.isPending}
                  onClick={() => {
                    const text = getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'Story needed',
                        message:
                          'Write some content first to craft an excerpt.',
                        type: 'info',
                      });
                      return;
                    }
                    generateExcerpt.mutate({ content: text });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <FileText size={16} color="#8b5cf6" />
                    <span>Craft Excerpt</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    140-char punchy story summary.
                  </p>
                </button>

                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={generateTags.isPending}
                  onClick={() => {
                    const text = getFullContent() || title;
                    if (!text.trim()) {
                      toast({
                        title: 'Story needed',
                        message: 'Write some content first to generate tags.',
                        type: 'info',
                      });
                      return;
                    }
                    generateTags.mutate({ content: text });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <Type size={16} color="#10b981" />
                    <span>Generate Tags</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Top trending topic tags.
                  </p>
                </button>
              </div>

              {/* Excerpt Result */}
              {generateExcerpt.data && (
                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultTitle}>Crafted Excerpt</span>
                  </div>
                  <div className={styles.resultBody}>
                    {generateExcerpt.data.excerpt}
                  </div>
                  <div className={styles.resultActions}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                      onClick={() => {
                        onSetExcerpt(generateExcerpt.data.excerpt);
                        toast({
                          title: 'Excerpt applied',
                          message: 'Story excerpt updated',
                          type: 'success',
                        });
                      }}
                    >
                      <Check size={14} />
                      <span>Apply as Excerpt</span>
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() =>
                        handleCopy(generateExcerpt.data.excerpt, 'exc-res')
                      }
                    >
                      {copiedId === 'exc-res' ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tags Result */}
              {generateTags.data && (
                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultTitle}>Suggested Tags</span>
                  </div>
                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                  >
                    {generateTags.data.tags?.map((t: string) => (
                      <span
                        key={t}
                        className={styles.pillBtn}
                        style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#c084fc',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <div className={styles.resultActions}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                      onClick={() => {
                        const newTags = Array.from(
                          new Set([...tags, ...(generateTags.data.tags || [])])
                        );
                        onSetTags(newTags);
                        toast({
                          title: 'Tags added',
                          message: 'Suggested tags applied to post',
                          type: 'success',
                        });
                      }}
                    >
                      <Plus size={14} />
                      <span>Add All to Post</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SOCIAL & FAQS */}
          {activeTab === 'social' && (
            <div className={styles.formGroup}>
              <div className={styles.actionGrid}>
                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={generateFAQ.isPending}
                  onClick={() => {
                    const text = getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'Content needed',
                        message: 'Write some content first to extract FAQs.',
                        type: 'info',
                      });
                      return;
                    }
                    generateFAQ.mutate({ content: text });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <HelpCircle size={16} color="#8b5cf6" />
                    <span>Generate FAQs</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Q&A accordion from your article.
                  </p>
                </button>

                <button
                  type="button"
                  className={styles.actionCard}
                  disabled={generateSocialPosts.isPending}
                  onClick={() => {
                    const text = getFullContent();
                    if (!text.trim()) {
                      toast({
                        title: 'Content needed',
                        message:
                          'Write some content first to generate social posts.',
                        type: 'info',
                      });
                      return;
                    }
                    generateSocialPosts.mutate({ content: text });
                  }}
                >
                  <div className={styles.actionCardHeader}>
                    <Share2 size={16} color="#06b6d4" />
                    <span>Social Posts</span>
                  </div>
                  <p className={styles.actionCardDesc}>
                    Tailored for Twitter/X & LinkedIn.
                  </p>
                </button>
              </div>

              {/* FAQs Result */}
              {generateFAQ.data?.faqs && (
                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultTitle}>Generated FAQs</span>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        const faqMarkdown = generateFAQ.data.faqs
                          .map(
                            (f: { question: string; answer: string }) =>
                              `### ${f.question}\n${f.answer}`
                          )
                          .join('\n\n');
                        handleInsertAtCursor(faqMarkdown);
                      }}
                    >
                      <Plus size={14} />
                      <span>Insert FAQs into Story</span>
                    </button>
                  </div>
                  <div>
                    {generateFAQ.data.faqs.map(
                      (
                        f: { question: string; answer: string },
                        idx: number
                      ) => (
                        <div key={idx} className={styles.faqItem}>
                          <div className={styles.faqQuestion}>
                            Q: {f.question}
                          </div>
                          <div className={styles.faqAnswer}>{f.answer}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Social Posts Result */}
              {generateSocialPosts.data &&
                (() => {
                  const twText =
                    typeof generateSocialPosts.data.twitter === 'object'
                      ? generateSocialPosts.data.twitter?.post
                      : String(generateSocialPosts.data.twitter || '');
                  const liText =
                    typeof generateSocialPosts.data.linkedin === 'object'
                      ? generateSocialPosts.data.linkedin?.post
                      : String(generateSocialPosts.data.linkedin || '');
                  return (
                    <div className={styles.resultCard}>
                      <div className={styles.resultHeader}>
                        <span className={styles.resultTitle}>
                          X (Twitter) Post
                        </span>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleCopy(twText, 'soc-tw')}
                        >
                          {copiedId === 'soc-tw' ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className={styles.resultBody}>{twText}</div>

                      <div
                        className={styles.resultHeader}
                        style={{ marginTop: '12px' }}
                      >
                        <span className={styles.resultTitle}>
                          LinkedIn Post
                        </span>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleCopy(liText, 'soc-li')}
                        >
                          {copiedId === 'soc-li' ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className={styles.resultBody}>{liText}</div>
                    </div>
                  );
                })()}
            </div>
          )}

          {/* TAB 5: CRITIQUE & AUDIT */}
          {activeTab === 'critique' && (
            <div className={styles.formGroup}>
              <button
                type="button"
                className={styles.generateBtn}
                disabled={generateSuggestions.isPending}
                onClick={() => {
                  const text = getFullContent();
                  if (!text.trim()) {
                    toast({
                      title: 'Story needed',
                      message: 'Write some content first to evaluate.',
                      type: 'info',
                    });
                    return;
                  }
                  generateSuggestions.mutate({ content: text });
                }}
              >
                {generateSuggestions.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Analyzing Story...</span>
                  </>
                ) : (
                  <>
                    <CheckCheck size={16} />
                    <span>Analyze & Audit Draft</span>
                  </>
                )}
              </button>

              {generateSuggestions.data && (
                <div className={styles.resultCard}>
                  <div className={styles.scoreRow}>
                    <div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#f1f5f9',
                        }}
                      >
                        Overall Story Score
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Clarity, Pacing & Reader Engagement
                      </div>
                    </div>
                    <div className={styles.scoreValue}>
                      {Math.max(
                        65,
                        100 -
                          (generateSuggestions.data.suggestions?.length || 0) *
                            5
                      )}
                      /100
                    </div>
                  </div>

                  <div className={styles.suggestionsList}>
                    {generateSuggestions.data.suggestions?.map((s, idx) => {
                      const text = s.suggestion || s.description || '';
                      const level = s.severity || s.priority || 'medium';
                      return (
                        <div key={idx} className={styles.suggestionItem}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '2px',
                            }}
                          >
                            <span className={styles.suggestionTitle}>
                              {s.type || `Insight #${idx + 1}`}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                textTransform: 'uppercase',
                                color:
                                  level === 'high'
                                    ? '#ef4444'
                                    : level === 'medium'
                                      ? '#f59e0b'
                                      : '#10b981',
                              }}
                            >
                              {level}
                            </span>
                          </div>
                          <div className={styles.suggestionText}>{text}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 1-Click Apply Suggestions */}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                    disabled={applySuggestions.isPending}
                    onClick={() => {
                      const text = getFullContent();
                      applySuggestions.mutate({
                        content: text,
                        suggestions:
                          generateSuggestions.data?.suggestions || [],
                      });
                    }}
                  >
                    {applySuggestions.isPending ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Applying Suggestions with AI...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={14} />
                        <span>Automatically Apply Suggestions</span>
                      </>
                    )}
                  </button>

                  {applySuggestions.data?.improvedContent ||
                  applySuggestions.data?.content ? (
                    <div style={{ marginTop: '12px' }}>
                      <div className={styles.resultHeader}>
                        <span className={styles.resultTitle}>
                          Enhanced Story
                        </span>
                      </div>
                      <div className={styles.resultBody}>
                        {applySuggestions.data.improvedContent ||
                          String(applySuggestions.data.content)}
                      </div>
                      <div className={styles.resultActions}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                          onClick={() => {
                            const newContent =
                              applySuggestions.data?.improvedContent ||
                              String(applySuggestions.data?.content || '');
                            if (editor && newContent) {
                              const html = markdownToHtml(newContent);
                              editor.commands.setContent(html);
                              toast({
                                title: 'Story Updated',
                                message:
                                  'All critique suggestions applied to your story.',
                                type: 'success',
                              });
                            }
                          }}
                        >
                          <Check size={14} />
                          <span>Replace Entire Story</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: HISTORY */}
          {activeTab === 'history' && (
            <div className={styles.formGroup}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Recent generations in this session
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={clearHistory}
                    className={styles.actionBtn}
                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '30px 10px',
                    color: '#64748b',
                    fontSize: '0.8rem',
                  }}
                >
                  No generations yet in this session.
                </div>
              ) : (
                history.map((item: AIHistoryItem) => (
                  <div key={item.id} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyTitle}>{item.title}</span>
                      <span>
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className={styles.historyPreview}>{item.preview}</div>
                    <div className={styles.resultActions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleCopy(item.preview, item.id)}
                      >
                        {copiedId === item.id ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                        <span>Copy</span>
                      </button>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleInsertAtCursor(item.preview)}
                      >
                        <Plus size={12} />
                        <span>Insert</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pulsing AI Shimmer when generating */}
          {isAnyLoading && (
            <div className={styles.loadingContainer}>
              <div className={styles.aiBrainPulse}>
                <Sparkles size={24} color="#f8fafc" />
              </div>
              <span className={styles.loadingText}>
                PixelThread AI is crafting your words...
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
