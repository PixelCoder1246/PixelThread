'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Sparkles,
  PenLine,
  FileText,
  Tags,
  FileEdit,
  Search,
  ChevronDown,
  X,
  StopCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { aiService } from '@/services/ai';
import { cn, copyToClipboard } from '@/lib/utils';
import type { TokenUsage, AiGenerationResponse } from '@/types';
import AITypingIndicator from './AITypingIndicator';
import AIResponseBlock from './AIResponseBlock';
import styles from './AIAssistant.module.css';

type AiAction = 'generate' | 'improve' | 'title' | 'tags' | 'excerpt' | 'seo';

interface AiTrigger {
  key: AiAction;
  label: string;
  icon: React.ReactNode;
  description: string;
  fields: AiField[];
}

interface AiField {
  name: string;
  label: string;
  type: 'text' | 'textarea';
  required?: boolean;
  placeholder?: string;
}

const triggers: AiTrigger[] = [
  {
    key: 'generate',
    label: 'Generate Post',
    icon: <Sparkles size={16} />,
    description: 'Generate a full blog post from a topic',
    fields: [
      {
        name: 'topic',
        label: 'Topic',
        type: 'text',
        required: true,
        placeholder: 'e.g. Benefits of TypeScript',
      },
      {
        name: 'targetAudience',
        label: 'Target Audience',
        type: 'text',
        placeholder: 'e.g. Junior developers',
      },
      {
        name: 'tone',
        label: 'Tone',
        type: 'text',
        placeholder: 'e.g. Professional, Casual',
      },
      {
        name: 'keywords',
        label: 'Keywords',
        type: 'text',
        placeholder: 'e.g. typescript, javascript, web dev',
      },
    ],
  },
  {
    key: 'improve',
    label: 'Improve Writing',
    icon: <PenLine size={16} />,
    description: 'Improve selected text or entire content',
    fields: [],
  },
  {
    key: 'title',
    label: 'Generate Title',
    icon: <FileText size={16} />,
    description: 'Generate title suggestions',
    fields: [
      {
        name: 'keywords',
        label: 'Target Keywords',
        type: 'text',
        placeholder: 'e.g. react, performance, optimization',
      },
    ],
  },
  {
    key: 'tags',
    label: 'Generate Tags',
    icon: <Tags size={16} />,
    description: 'Generate relevant tags from content',
    fields: [],
  },
  {
    key: 'excerpt',
    label: 'Generate Excerpt',
    icon: <FileEdit size={16} />,
    description: 'Generate a post excerpt/summary',
    fields: [],
  },
  {
    key: 'seo',
    label: 'Generate SEO',
    icon: <Search size={16} />,
    description: 'Generate SEO metadata',
    fields: [
      {
        name: 'title',
        label: 'Post Title',
        type: 'text',
        required: true,
        placeholder: 'Enter post title',
      },
    ],
  },
];

interface AIAssistantProps {
  editor: Editor | null;
  className?: string;
}

function getAiResponseText(response: AiGenerationResponse): string {
  if (response.content) return response.content;
  if (response.improvedContent) return response.improvedContent;
  if (response.titles) return response.titles.join('\n');
  if (response.title) return response.title;
  if (response.improvedTitle) return response.improvedTitle;
  if (response.tags) return response.tags.join(', ');
  if (response.excerpt) return response.excerpt;
  if (response.suggestedTags) return response.suggestedTags.join(', ');
  if (response.seoTitle || response.seoDescription) {
    const parts: string[] = [];
    if (response.seoTitle) parts.push(`**SEO Title:** ${response.seoTitle}`);
    if (response.seoDescription)
      parts.push(`**SEO Description:** ${response.seoDescription}`);
    if (response.keywords)
      parts.push(`**Keywords:** ${response.keywords.join(', ')}`);
    return parts.join('\n\n');
  }
  if (response.metaTitle || response.metaDescription) {
    const parts: string[] = [];
    if (response.metaTitle) parts.push(`**Meta Title:** ${response.metaTitle}`);
    if (response.metaDescription)
      parts.push(`**Meta Description:** ${response.metaDescription}`);
    if (response.keywords)
      parts.push(`**Keywords:** ${response.keywords.join(', ')}`);
    if (response.suggestions)
      parts.push(`**Suggestions:**\n${response.suggestions.join('\n')}`);
    return parts.join('\n\n');
  }
  if (response.suggestions) return response.suggestions.join('\n');
  return JSON.stringify(response, null, 2);
}

export default function AIAssistant({ editor, className }: AIAssistantProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [displayedResponse, setDisplayedResponse] = useState<string>('');
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const responseAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (responseAreaRef.current) {
        responseAreaRef.current.scrollTop =
          responseAreaRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (!isStreaming || !response) return;
    let index = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayedResponse('');
    const interval = setInterval(() => {
      if (index < response.length) {
        setDisplayedResponse(response.slice(0, index + 3));
        index += 3;
        scrollToBottom();
      } else {
        setDisplayedResponse(response);
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [isStreaming, response, scrollToBottom]);

  const handleSelectAction = useCallback((key: AiAction) => {
    setActiveAction(key);
    setFormData({});
    setResponse('');
    setDisplayedResponse('');
    setTokenUsage(null);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const handleClose = useCallback(() => {
    setActiveAction(null);
    setFormData({});
    setResponse('');
    setDisplayedResponse('');
    setTokenUsage(null);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setIsStreaming(false);
    setDisplayedResponse(response);
  }, [response]);

  const handleCopyResponse = useCallback(async () => {
    await copyToClipboard(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [response]);

  const handleInsertAtCursor = useCallback(() => {
    if (!editor || !response) return;
    editor.chain().focus().insertContent(response).run();
  }, [editor, response]);

  const handleReplaceSelection = useCallback(() => {
    if (!editor || !response) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;
    editor
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent(response)
      .run();
  }, [editor, response]);

  const handleRegenerate = useCallback(async () => {
    if (!activeAction) return;
    setError(null);
    setResponse('');
    setDisplayedResponse('');
    setTokenUsage(null);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const content = editor?.getHTML() || '';
      let result: AiGenerationResponse;

      switch (activeAction) {
        case 'generate': {
          result = await aiService.generatePost({
            topic: formData.topic || '',
            targetAudience: formData.targetAudience,
            tone: formData.tone,
            keywords: formData.keywords,
          });
          break;
        }
        case 'improve': {
          result = await aiService.improveWriting(content);
          break;
        }
        case 'title': {
          result = await aiService.generateTitles(content, formData.keywords);
          break;
        }
        case 'tags': {
          result = await aiService.generateTags(content);
          break;
        }
        case 'excerpt': {
          result = await aiService.generateExcerpt(content);
          break;
        }
        case 'seo': {
          result = await aiService.generateSeo(formData.title || '', content);
          break;
        }
        default:
          return;
      }

      const text = getAiResponseText(result);
      setResponse(text);
      setTokenUsage(result.tokenUsage ?? null);
      setIsLoading(false);
      setIsStreaming(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  }, [activeAction, formData, editor]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await handleRegenerate();
    },
    [handleRegenerate]
  );

  const activeTrigger = activeAction
    ? triggers.find((t) => t.key === activeAction)
    : null;

  return (
    <div className={cn(styles.panel, className)}>
      <div
        className={styles.header}
        onClick={() => setIsCollapsed((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ')
            setIsCollapsed((prev) => !prev);
        }}
        aria-expanded={!isCollapsed}
      >
        <div className={styles.headerLeft}>
          <Sparkles size={16} className={styles.headerIcon} />
          <span className={styles.headerTitle}>AI Assistant</span>
          {activeAction && <span className={styles.headerBadge}>1</span>}
        </div>
        <ChevronDown
          size={16}
          className={cn(styles.toggleIcon, isCollapsed && styles.collapsed)}
        />
      </div>

      <div className={cn(styles.body, isCollapsed && styles.collapsed)}>
        <div className={styles.triggerList}>
          {triggers.map((trigger) => (
            <button
              key={trigger.key}
              type="button"
              className={cn(
                styles.triggerButton,
                activeAction === trigger.key && styles.active
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAction(trigger.key);
              }}
              title={trigger.description}
            >
              <span className={styles.triggerIcon}>{trigger.icon}</span>
              {trigger.label}
            </button>
          ))}
        </div>

        {activeAction && activeTrigger && (
          <div className={styles.content}>
            <div className={styles.formArea}>
              <div className={styles.formTitle}>{activeTrigger.label}</div>
              <form onSubmit={handleSubmit}>
                {activeTrigger.fields.map((field) => (
                  <div key={field.name} className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor={field.name}>
                      {field.label}
                      {field.required && ' *'}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={field.name}
                        className={styles.formTextarea}
                        value={formData[field.name] || ''}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    ) : (
                      <input
                        id={field.name}
                        type="text"
                        className={styles.formInput}
                        value={formData[field.name] || ''}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#fff',
                            borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite',
                            display: 'inline-block',
                          }}
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Generate
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleClose}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            </div>

            <div className={styles.responseArea} ref={responseAreaRef}>
              {error && <div className={styles.errorText}>{error}</div>}

              {isLoading && !response && (
                <div className={styles.loadingArea}>
                  <AITypingIndicator />
                </div>
              )}

              {response && (
                <AIResponseBlock
                  content={displayedResponse || response}
                  tokenUsage={tokenUsage}
                  isStreaming={isStreaming}
                />
              )}

              {(isLoading || isStreaming) && (
                <div className={styles.responseControls}>
                  <button
                    type="button"
                    className={styles.stopButton}
                    onClick={handleStop}
                  >
                    <StopCircle size={14} />
                    Stop
                  </button>
                </div>
              )}

              {response && !isLoading && !isStreaming && (
                <div className={styles.responseControls}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={handleCopyResponse}
                  >
                    {copied ? (
                      <>
                        <Check size={14} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={handleInsertAtCursor}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>↓</span>
                    Insert
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={handleReplaceSelection}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>↕</span>
                    Replace
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={handleRegenerate}
                  >
                    <RefreshCw size={14} />
                    Regenerate
                  </button>
                </div>
              )}

              {!response && !isLoading && !error && (
                <div className={styles.emptyState}>
                  <Sparkles size={32} className={styles.emptyIcon} />
                  <div className={styles.emptyTitle}>
                    {activeTrigger.description}
                  </div>
                  <div className={styles.emptyDescription}>
                    Fill in the fields above and click Generate to start.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.tokenInfo}>
          <Zap size={12} />
          {tokenUsage
            ? `${tokenUsage.totalTokens} tokens used`
            : 'AI Assistant'}
        </div>
        {tokenUsage && (
          <span className={styles.tokenBadge}>{tokenUsage.model}</span>
        )}
      </div>
    </div>
  );
}
