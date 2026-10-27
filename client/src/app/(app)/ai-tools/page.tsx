'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Wand2,
  FileText,
  Share2,
  HelpCircle,
  CheckCheck,
  Zap,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Sliders,
  Type,
  Maximize2,
  Minimize2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useAI } from '@/features/ai/useAI';
import { useToast } from '@/components/ui/Toast';
import { ROUTES } from '@/lib/constants';
import styles from './page.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All AI Tools', icon: Sparkles },
  { id: 'drafting', label: 'Drafting & Ideation', icon: FileText },
  { id: 'refining', label: 'Refining & Tone', icon: Wand2 },
  { id: 'headlines', label: 'Headlines & SEO', icon: Type },
  { id: 'social', label: 'Social & FAQs', icon: Share2 },
  { id: 'critique', label: 'Critique & Audit', icon: CheckCheck },
] as const;

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

export default function AIToolsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [articleViewMode, setArticleViewMode] = useState<'formatted' | 'raw'>(
    'formatted'
  );

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
  } = useAI();

  // Tool 1: Full Post
  const [postTopic, setPostTopic] = useState('');
  const [postTone, setPostTone] =
    useState<(typeof TONES)[number]>('professional');
  const [postCategory, setPostCategory] = useState<string>('technology');
  const [postLength, setPostLength] = useState<
    'short' | 'medium' | 'long' | 'comprehensive'
  >('medium');
  const [postAudience, setPostAudience] = useState('');
  const [postKeywords, setPostKeywords] = useState('');

  // Tool 2: Headlines
  const [headlineInput, setHeadlineInput] = useState('');

  // Tool 3: Tone Rewriter
  const [rewriteInput, setRewriteInput] = useState('');
  const [selectedRewriteTone, setSelectedRewriteTone] =
    useState<(typeof TONES)[number]>('storytelling');

  // Tool 4: Expander
  const [expandInput, setExpandInput] = useState('');

  // Tool 5: Shortener
  const [shortenInput, setShortenInput] = useState('');

  // Tool 6: Continuator
  const [continueInput, setContinueInput] = useState('');

  // Tool 7: Summarizer
  const [summarizeInput, setSummarizeInput] = useState('');

  // Tool 8: FAQs
  const [faqInput, setFaqInput] = useState('');

  // Tool 9: Social
  const [socialInput, setSocialInput] = useState('');

  // Tool 10: Critique
  const [critiqueInput, setCritiqueInput] = useState('');

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

  const handleOpenInEditor = (post: {
    title?: string;
    excerpt?: string;
    content?: unknown;
    suggestedTags?: string[];
    tags?: string[];
  }) => {
    try {
      localStorage.setItem(
        'pixelthread_new_post_draft',
        JSON.stringify({
          title: post.title || '',
          excerpt: post.excerpt || '',
          tags: post.suggestedTags || post.tags || [],
          content: markdownToHtml(String(post.content || '')),
          savedAt: new Date().toISOString(),
        })
      );
      toast({
        title: 'Opening Story in Editor',
        message: 'Draft populated and transferring to Post Editor...',
        type: 'success',
      });
      router.push(ROUTES.POST_NEW);
    } catch {
      router.push(ROUTES.POST_NEW);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} />
          <span>PixelThread AI Studio</span>
        </div>
        <h1 className={styles.heroTitle}>
          Supercharge Your Storytelling with{' '}
          <span className={styles.heroGradientText}>AI Magic</span>
        </h1>
        <p className={styles.heroSubtitle}>
          From instant comprehensive blog drafts to tone rewrites, headline
          optimization, and social threads. Elevate every sentence with
          state-of-the-art AI.
        </p>

        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <Zap size={14} color="#a855f7" />
            <span>16+ Specialized Writing Tools</span>
          </div>
          <div className={styles.statPill}>
            <ExternalLink size={14} color="#3b82f6" />
            <span>1-Click Export to Post Editor</span>
          </div>
          <div className={styles.statPill}>
            <BookOpen size={14} color="#10b981" />
            <span>Context-Aware Storytelling</span>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <nav className={styles.filterBar} aria-label="Tool Categories">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.filterBtnActive : ''}`}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Grid of Interactive AI Tools */}
      <div className={styles.toolsGrid}>
        {/* TOOL 1: FULL POST GENERATOR */}
        {(activeCategory === 'all' || activeCategory === 'drafting') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Complete Article Generator</h2>
                <p className={styles.cardDescription}>
                  Turn any idea or topic into a full, formatted article with SEO
                  title & tags.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Article Topic or Outline *
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder="e.g. The Future of AI Agents in Modern Web Development..."
                  value={postTopic}
                  onChange={(e) => setPostTopic(e.target.value)}
                  rows={3}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Tone of Voice</label>
                <div className={styles.toneGrid}>
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPostTone(t)}
                      className={`${styles.toneBtn} ${postTone === t ? styles.toneBtnActive : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Length & Category</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}
                >
                  <select
                    className={styles.textarea}
                    style={{
                      height: '38px',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                    }}
                    value={postLength}
                    onChange={(e) =>
                      setPostLength(
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
                    className={styles.textarea}
                    style={{
                      height: '38px',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                    }}
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
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

              <div className={styles.inputGroup}>
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
                      className={styles.textarea}
                      style={{
                        height: '38px',
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                      }}
                      placeholder="e.g. Intermediate React developers"
                      value={postAudience}
                      onChange={(e) => setPostAudience(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Keywords (Opt)</label>
                    <input
                      type="text"
                      className={styles.textarea}
                      style={{
                        height: '38px',
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                      }}
                      placeholder="e.g. React, RSC, Next.js"
                      value={postKeywords}
                      onChange={(e) => setPostKeywords(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={!postTopic.trim() || generatePost.isPending}
                onClick={() =>
                  generatePost.mutate({
                    topic: postTopic.trim(),
                    tone: postTone,
                    category: postCategory || undefined,
                    approximateLength: postLength,
                    targetAudience: postAudience.trim() || undefined,
                    keywords: postKeywords.trim() || undefined,
                  })
                }
              >
                {generatePost.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Writing Article with AI... (approx 30s)</span>
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

              {generatePost.data && (
                <div className={styles.resultBox}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#f8fafc',
                        fontSize: '0.9rem',
                      }}
                    >
                      {generatePost.data.title}
                    </div>
                    <div className={styles.viewModeToggle}>
                      <button
                        type="button"
                        className={`${styles.viewModeBtn} ${articleViewMode === 'formatted' ? styles.viewModeBtnActive : ''}`}
                        onClick={() => setArticleViewMode('formatted')}
                      >
                        Formatted
                      </button>
                      <button
                        type="button"
                        className={`${styles.viewModeBtn} ${articleViewMode === 'raw' ? styles.viewModeBtnActive : ''}`}
                        onClick={() => setArticleViewMode('raw')}
                      >
                        Markdown
                      </button>
                    </div>
                  </div>

                  {articleViewMode === 'formatted' ? (
                    <div
                      className={styles.resultContentFormatted}
                      dangerouslySetInnerHTML={{
                        __html: markdownToHtml(
                          String(generatePost.data.content || '')
                        ),
                      }}
                    />
                  ) : (
                    <div className={styles.resultContent}>
                      {String(generatePost.data.content || '')}
                    </div>
                  )}

                  <div className={styles.resultFooter}>
                    <span className={styles.tokenTag}>
                      ⚡ {generatePost.data.tokenUsage?.totalTokens || 0} tokens
                    </span>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() =>
                          handleCopy(
                            `${generatePost.data.title}\n\n${markdownToPlainText(String(generatePost.data.content || ''))}`,
                            'tool-post-plain'
                          )
                        }
                        title="Copy as plain normal text"
                      >
                        {copiedId === 'tool-post-plain' ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                        <span>Copy Plain Text</span>
                      </button>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() =>
                          handleCopy(
                            `${generatePost.data.title}\n\n${String(generatePost.data.content || '')}`,
                            'tool-post'
                          )
                        }
                        title="Copy raw markdown"
                      >
                        {copiedId === 'tool-post' ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                        <span>Copy Markdown</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                        onClick={() => handleOpenInEditor(generatePost.data)}
                        title="Open in editor with formatted headings, lists and code blocks"
                      >
                        <ArrowRight size={12} />
                        <span>Open in Editor</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </article>
        )}

        {/* TOOL 2: HEADLINE & TITLE WIZARD */}
        {(activeCategory === 'all' || activeCategory === 'headlines') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Type size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Headline & Title Wizard</h2>
                <p className={styles.cardDescription}>
                  Generate 5 high-converting, viral headlines based on your
                  topic or draft.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Post Topic or Draft Snippet
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste your opening thoughts or draft..."
                  value={headlineInput}
                  onChange={(e) => setHeadlineInput(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={!headlineInput.trim() || generateTitles.isPending}
                onClick={() =>
                  generateTitles.mutate({ content: headlineInput.trim() })
                }
              >
                {generateTitles.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Brainstorming Titles...</span>
                  </>
                ) : (
                  <>
                    <Type size={16} />
                    <span>Suggest 5 Viral Titles</span>
                  </>
                )}
              </button>

              {generateTitles.data?.titles && (
                <div className={styles.resultBox}>
                  {generateTitles.data.titles.map((t, idx) => {
                    const titleText =
                      typeof t === 'string'
                        ? t
                        : (t as { title: string }).title;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          fontSize: '0.8rem',
                        }}
                      >
                        <span
                          style={{
                            color: '#f1f5f9',
                            flex: 1,
                            paddingRight: '8px',
                          }}
                        >
                          {titleText}
                        </span>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleCopy(titleText, `t-${idx}`)}
                        >
                          {copiedId === `t-${idx}` ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </article>
        )}

        {/* TOOL 3: TONE REWRITER */}
        {(activeCategory === 'all' || activeCategory === 'refining') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Sliders size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Tone Rewriter & Stylist</h2>
                <p className={styles.cardDescription}>
                  Rewrite any paragraph to fit professional, friendly, casual or
                  storytelling voices.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Text to Rewrite</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste your text here to transform its tone..."
                  value={rewriteInput}
                  onChange={(e) => setRewriteInput(e.target.value)}
                  rows={3}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Select Target Tone</label>
                <div className={styles.toneGrid}>
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedRewriteTone(t)}
                      className={`${styles.toneBtn} ${selectedRewriteTone === t ? styles.toneBtnActive : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={!rewriteInput.trim() || rewriteContent.isPending}
                onClick={() =>
                  rewriteContent.mutate({
                    content: rewriteInput.trim(),
                    tone: selectedRewriteTone,
                  })
                }
              >
                {rewriteContent.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Rewriting...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    <span>Rewrite in {selectedRewriteTone} Tone</span>
                  </>
                )}
              </button>

              {rewriteContent.data?.rewrittenContent ||
              rewriteContent.data?.content ? (
                <div className={styles.resultBox}>
                  <div className={styles.resultContent}>
                    {rewriteContent.data.rewrittenContent ||
                      String(rewriteContent.data.content)}
                  </div>
                  <div className={styles.resultFooter}>
                    <span className={styles.tokenTag}>⚡ AI Refined</span>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() =>
                        handleCopy(
                          rewriteContent.data?.rewrittenContent ||
                            String(rewriteContent.data?.content || ''),
                          'rew-tool'
                        )
                      }
                    >
                      {copiedId === 'rew-tool' ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>Copy Result</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        )}

        {/* TOOL 4: CONTENT EXPANDER */}
        {(activeCategory === 'all' || activeCategory === 'refining') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Maximize2 size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Content Expander</h2>
                <p className={styles.cardDescription}>
                  Flesh out bullet points or brief outlines into rich, detailed
                  explanations.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Points or Brief Section</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste brief sentences or bullet points to expand..."
                  value={expandInput}
                  onChange={(e) => setExpandInput(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={!expandInput.trim() || expandContent.isPending}
                onClick={() =>
                  expandContent.mutate({ content: expandInput.trim() })
                }
              >
                {expandContent.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Expanding Section...</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={16} />
                    <span>Expand with In-Depth Details</span>
                  </>
                )}
              </button>

              {expandContent.data?.expandedContent ||
              expandContent.data?.content ? (
                <div className={styles.resultBox}>
                  <div className={styles.resultContent}>
                    {expandContent.data.expandedContent ||
                      String(expandContent.data.content)}
                  </div>
                  <div className={styles.resultFooter}>
                    <span className={styles.tokenTag}>⚡ Enriched</span>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() =>
                        handleCopy(
                          expandContent.data?.expandedContent ||
                            String(expandContent.data?.content || ''),
                          'exp-tool'
                        )
                      }
                    >
                      {copiedId === 'exp-tool' ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        )}

        {/* TOOL 5: CONTENT CONDENSER */}
        {(activeCategory === 'all' || activeCategory === 'refining') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Minimize2 size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Concise Editor & Condenser</h2>
                <p className={styles.cardDescription}>
                  Trim fluff, eliminate redundancies, and keep your writing
                  punchy and impactful.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Verbose Text to Condense</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste long-winded paragraphs here..."
                  value={shortenInput}
                  onChange={(e) => setShortenInput(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={!shortenInput.trim() || shortenContent.isPending}
                onClick={() =>
                  shortenContent.mutate({ content: shortenInput.trim() })
                }
              >
                {shortenContent.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Trimming Fluff...</span>
                  </>
                ) : (
                  <>
                    <Minimize2 size={16} />
                    <span>Make Concise & Impactful</span>
                  </>
                )}
              </button>

              {shortenContent.data?.shortenedContent ||
              shortenContent.data?.content ? (
                <div className={styles.resultBox}>
                  <div className={styles.resultContent}>
                    {shortenContent.data.shortenedContent ||
                      String(shortenContent.data.content)}
                  </div>
                  <div className={styles.resultFooter}>
                    <span className={styles.tokenTag}>⚡ Concise Output</span>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() =>
                        handleCopy(
                          shortenContent.data?.shortenedContent ||
                            String(shortenContent.data?.content || ''),
                          'sh-tool'
                        )
                      }
                    >
                      {copiedId === 'sh-tool' ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        )}

        {/* TOOL 6: STORY CONTINUATOR */}
        {(activeCategory === 'all' || activeCategory === 'drafting') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <ArrowRight size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Story Continuator</h2>
                <p className={styles.cardDescription}>
                  Stuck with writer&apos;s block? Let AI craft the natural
                  continuation of your story.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Your Story So Far</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste where you left off..."
                  value={continueInput}
                  onChange={(e) => setContinueInput(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={!continueInput.trim() || continueWriting.isPending}
                onClick={() =>
                  continueWriting.mutate({ content: continueInput.trim() })
                }
              >
                {continueWriting.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Writing Next Scene...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    <span>Continue Narrative</span>
                  </>
                )}
              </button>

              {continueWriting.data?.continuation ||
              continueWriting.data?.content ? (
                <div className={styles.resultBox}>
                  <div className={styles.resultContent}>
                    {continueWriting.data.continuation ||
                      String(continueWriting.data.content)}
                  </div>
                  <div className={styles.resultFooter}>
                    <span className={styles.tokenTag}>⚡ Story Extension</span>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() =>
                        handleCopy(
                          continueWriting.data?.continuation ||
                            String(continueWriting.data?.content || ''),
                          'cont-tool'
                        )
                      }
                    >
                      {copiedId === 'cont-tool' ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>Copy Continuation</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        )}

        {/* TOOL 7: ARTICLE SUMMARIZER */}
        {(activeCategory === 'all' || activeCategory === 'refining') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <FileText size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Executive Summarizer</h2>
                <p className={styles.cardDescription}>
                  Generate one-sentence hooks, TL;DR paragraphs, and key bullet
                  takeaways.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Article Text</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste article to distill..."
                  value={summarizeInput}
                  onChange={(e) => setSummarizeInput(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={!summarizeInput.trim() || summarizeContent.isPending}
                onClick={() =>
                  summarizeContent.mutate({ content: summarizeInput.trim() })
                }
              >
                {summarizeContent.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Distilling Key Points...</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    <span>Summarize Article</span>
                  </>
                )}
              </button>

              {summarizeContent.data &&
                (() => {
                  const summaryText =
                    summarizeContent.data.paragraphSummary ||
                    summarizeContent.data.oneLineSummary ||
                    summarizeContent.data.summary ||
                    '';
                  return (
                    <div className={styles.resultBox}>
                      <div className={styles.resultContent}>{summaryText}</div>
                      <div className={styles.resultFooter}>
                        <span className={styles.tokenTag}>
                          ⚡ Summary Ready
                        </span>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleCopy(summaryText, 'sum-tool')}
                        >
                          {copiedId === 'sum-tool' ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </article>
        )}

        {/* TOOL 8: SMART FAQ GENERATOR */}
        {(activeCategory === 'all' || activeCategory === 'social') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <HelpCircle size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Smart FAQ Generator</h2>
                <p className={styles.cardDescription}>
                  Turn any topic or article into a comprehensive Questions &
                  Answers section.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Article or Topic</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste article to extract FAQs..."
                  value={faqInput}
                  onChange={(e) => setFaqInput(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={!faqInput.trim() || generateFAQ.isPending}
                onClick={() => generateFAQ.mutate({ content: faqInput.trim() })}
              >
                {generateFAQ.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Extracting FAQs...</span>
                  </>
                ) : (
                  <>
                    <HelpCircle size={16} />
                    <span>Generate FAQs</span>
                  </>
                )}
              </button>

              {generateFAQ.data?.faqs && (
                <div className={styles.resultBox}>
                  {generateFAQ.data.faqs.map(
                    (f: { question: string; answer: string }, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: '6px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div
                          style={{
                            color: '#c084fc',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        >
                          Q: {f.question}
                        </div>
                        <div
                          style={{
                            color: '#cbd5e1',
                            fontSize: '0.78rem',
                            marginTop: '2px',
                          }}
                        >
                          {f.answer}
                        </div>
                      </div>
                    )
                  )}
                  <div className={styles.resultFooter}>
                    <span className={styles.tokenTag}>
                      {generateFAQ.data.faqs.length} Questions Generated
                    </span>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        const allFaqs = generateFAQ.data.faqs
                          .map(
                            (f: { question: string; answer: string }) =>
                              `Q: ${f.question}\nA: ${f.answer}`
                          )
                          .join('\n\n');
                        handleCopy(allFaqs, 'faq-tool');
                      }}
                    >
                      {copiedId === 'faq-tool' ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>Copy FAQs</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        )}

        {/* TOOL 9: SOCIAL THREAD GENERATOR */}
        {(activeCategory === 'all' || activeCategory === 'social') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Share2 size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Social Thread Generator</h2>
                <p className={styles.cardDescription}>
                  Craft high-engagement posts for X/Twitter & LinkedIn with
                  viral hooks.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Article or Main Idea</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste your key takeaways or story..."
                  value={socialInput}
                  onChange={(e) => setSocialInput(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={!socialInput.trim() || generateSocialPosts.isPending}
                onClick={() =>
                  generateSocialPosts.mutate({ content: socialInput.trim() })
                }
              >
                {generateSocialPosts.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Crafting Social Posts...</span>
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    <span>Generate Social Posts</span>
                  </>
                )}
              </button>

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
                    <div className={styles.resultBox}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#38bdf8',
                        }}
                      >
                        Twitter / X Post
                      </div>
                      <div className={styles.resultContent}>{twText}</div>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        style={{
                          alignSelf: 'flex-start',
                          margin: '4px 0 10px',
                        }}
                        onClick={() => handleCopy(twText, 'soc-x')}
                      >
                        {copiedId === 'soc-x' ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                        <span>Copy Tweet</span>
                      </button>

                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#0ea5e9',
                        }}
                      >
                        LinkedIn Post
                      </div>
                      <div className={styles.resultContent}>{liText}</div>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                        onClick={() => handleCopy(liText, 'soc-in')}
                      >
                        {copiedId === 'soc-in' ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                        <span>Copy LinkedIn</span>
                      </button>
                    </div>
                  );
                })()}
            </div>
          </article>
        )}

        {/* TOOL 10: WRITING CRITIQUE & AUDIT */}
        {(activeCategory === 'all' || activeCategory === 'critique') && (
          <article className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <CheckCheck size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>
                  Writing Critique & Scorecard
                </h2>
                <p className={styles.cardDescription}>
                  Receive an objective score on clarity, pacing, and engagement
                  with concrete fixes.
                </p>
              </div>
            </div>

            <div className={styles.workbench}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Draft to Audit</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste your article draft to evaluate..."
                  value={critiqueInput}
                  onChange={(e) => setCritiqueInput(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className={styles.runBtn}
                disabled={
                  !critiqueInput.trim() || generateSuggestions.isPending
                }
                onClick={() =>
                  generateSuggestions.mutate({ content: critiqueInput.trim() })
                }
              >
                {generateSuggestions.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Auditing Draft...</span>
                  </>
                ) : (
                  <>
                    <CheckCheck size={16} />
                    <span>Score & Audit Draft</span>
                  </>
                )}
              </button>

              {generateSuggestions.data && (
                <div className={styles.resultBox}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#f1f5f9',
                      }}
                    >
                      Overall Story Score
                    </span>
                    <span
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: '#c084fc',
                      }}
                    >
                      {Math.max(
                        65,
                        100 -
                          (generateSuggestions.data.suggestions?.length || 0) *
                            5
                      )}
                      /100
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginTop: '6px',
                    }}
                  >
                    {generateSuggestions.data.suggestions?.map((s, idx) => {
                      const text = s.suggestion || s.description || '';
                      const level = s.severity || s.priority || 'medium';
                      return (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '2px',
                            }}
                          >
                            <strong style={{ color: '#e2e8f0' }}>
                              {s.type}
                            </strong>
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
                          <span style={{ color: '#94a3b8' }}>{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
