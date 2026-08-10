'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { codeToHtml } from 'shiki';
import { Copy, Check, FileDown, FileUp, RefreshCw, Zap } from 'lucide-react';
import { cn, copyToClipboard } from '@/lib/utils';
import type { TokenUsage } from '@/types';
import styles from './AIResponseBlock.module.css';

interface AIResponseBlockProps {
  content: string;
  tokenUsage?: TokenUsage | null;
  isStreaming?: boolean;
  onCopy?: () => void;
  onInsertAtCursor?: () => void;
  onReplaceSelection?: () => void;
  onRegenerate?: () => void;
  className?: string;
}

function CodeBlockWithShiki({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, { lang: language, theme: 'dark-plus' }).then(
      (result) => {
        if (!cancelled) setHtml(result);
      },
      () => {
        if (!cancelled) setHtml(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (!html) {
    return (
      <pre>
        <code>{code}</code>
      </pre>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function AIResponseBlock({
  content,
  tokenUsage,
  isStreaming = false,
  onCopy,
  onInsertAtCursor,
  onReplaceSelection,
  onRegenerate,
  className,
}: AIResponseBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(styles.block, className)}>
      <div className={styles.content}>
        <ReactMarkdown
          components={{
            code({ className: codeClassName, children, ...props }) {
              const match = /language-(\w+)/.exec(codeClassName || '');
              const code = String(children).replace(/\n$/, '');
              if (match) {
                return (
                  <CodeBlockWithShiki language={match[1]} code={code} />
                );
              }
              return (
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              );
            },
            pre({ children }) {
              return <>{children}</>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={handleCopy}
          title="Copy response"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>

        {onInsertAtCursor && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={onInsertAtCursor}
            title="Insert at cursor"
          >
            <FileDown size={14} />
            Insert
          </button>
        )}

        {onReplaceSelection && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={onReplaceSelection}
            title="Replace selection"
          >
            <FileUp size={14} />
            Replace
          </button>
        )}

        {onRegenerate && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={onRegenerate}
            disabled={isStreaming}
            title="Regenerate"
          >
            <RefreshCw
              size={14}
              className={isStreaming ? undefined : undefined}
            />
            Regenerate
          </button>
        )}

        {tokenUsage && (
          <span className={styles.tokenBadge}>
            <Zap size={12} />
            {tokenUsage.totalTokens} tokens
          </span>
        )}
      </div>
    </div>
  );
}
