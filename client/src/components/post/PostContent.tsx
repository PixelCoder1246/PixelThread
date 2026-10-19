'use client';

import type { ContentBlock } from '@/types/post';
import styles from './PostContent.module.css';

interface PostContentProps {
  content: ContentBlock[] | string | null | undefined;
}

function renderMark(
  type: string,
  text: string,
  attrs?: Record<string, unknown>
): React.ReactNode {
  switch (type) {
    case 'bold':
      return <strong>{text}</strong>;
    case 'italic':
      return <em>{text}</em>;
    case 'underline':
      return <u>{text}</u>;
    case 'strike':
      return <s>{text}</s>;
    case 'code':
      return <code>{text}</code>;
    case 'link':
      return (
        <a
          href={attrs?.href as string}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      );
    default:
      return text;
  }
}

function renderInlineContent(block: ContentBlock): React.ReactNode {
  if (block.type === 'text') {
    const text = block.text ?? '';
    if (!block.marks || block.marks.length === 0) return text;

    return block.marks.reduce<React.ReactNode>((acc, mark) => {
      return renderMark(
        mark.type,
        typeof acc === 'string' ? acc : text,
        mark.attrs
      );
    }, text);
  }

  if (block.type === 'hardBreak') return <br />;
  if (block.type === 'image') {
    return (
      <img
        src={block.attrs?.src as string}
        alt={(block.attrs?.alt as string) ?? ''}
        className={styles.inlineImage}
      />
    );
  }

  return null;
}

function renderBlock(block: ContentBlock, index: number): React.ReactNode {
  const children = block.content?.map((child, i) => (
    <span key={i}>{renderInlineContent(child)}</span>
  ));

  switch (block.type) {
    case 'paragraph':
      return (
        <p key={index} className={styles.paragraph}>
          {children}
        </p>
      );

    case 'heading': {
      const level = (block.attrs?.level as number) ?? 2;
      const Tag = `h${Math.min(level, 6)}` as
        | 'h1'
        | 'h2'
        | 'h3'
        | 'h4'
        | 'h5'
        | 'h6';
      return (
        <Tag
          key={index}
          className={styles[`heading${level}`] ?? styles.heading2}
        >
          {children}
        </Tag>
      );
    }

    case 'bulletList':
      return (
        <ul key={index} className={styles.bulletList}>
          {block.content?.map((item, i) => (
            <li key={i} className={styles.listItem}>
              {item.content?.map((child, ci) => (
                <span key={ci}>{renderBlock(child, ci)}</span>
              ))}
            </li>
          ))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={index} className={styles.orderedList}>
          {block.content?.map((item, i) => (
            <li key={i} className={styles.listItem}>
              {item.content?.map((child, ci) => (
                <span key={ci}>{renderBlock(child, ci)}</span>
              ))}
            </li>
          ))}
        </ol>
      );

    case 'listItem':
      return (
        <li key={index} className={styles.listItem}>
          {children}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote key={index} className={styles.blockquote}>
          {children}
        </blockquote>
      );

    case 'codeBlock':
      return (
        <pre key={index} className={styles.codeBlock}>
          <code>{block.content?.map((c) => c.text ?? '').join('')}</code>
        </pre>
      );

    case 'horizontalRule':
      return <hr key={index} className={styles.divider} />;

    case 'image':
      return (
        <figure key={index} className={styles.figure}>
          <img
            src={block.attrs?.src as string}
            alt={(block.attrs?.alt as string) ?? ''}
            className={styles.image}
          />
          {Boolean(block.attrs?.title) && (
            <figcaption className={styles.figcaption}>
              {String(block.attrs?.title)}
            </figcaption>
          )}
        </figure>
      );

    case 'taskList':
      return (
        <ul key={index} className={styles.taskList}>
          {block.content?.map((item, i) => (
            <li key={i} className={styles.taskItem}>
              <input
                type="checkbox"
                checked={(item.attrs?.checked as boolean) ?? false}
                readOnly
                className={styles.taskCheckbox}
              />
              <span>
                {item.content?.map((c, ci) => (
                  <span key={ci}>{renderBlock(c, ci)}</span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      );

    // Legacy flat content blocks from backend
    case 'text':
      return (
        <p key={index} className={styles.paragraph}>
          {(block as { value?: string; text?: string }).value ??
            block.text ??
            ''}
        </p>
      );

    default:
      // Fallback: try to render children
      if (block.content) {
        return <div key={index}>{children}</div>;
      }
      // Legacy: value field
      const legacy = block as unknown as { value?: string };
      if (legacy.value) {
        return (
          <p key={index} className={styles.paragraph}>
            {legacy.value}
          </p>
        );
      }
      return null;
  }
}

export function PostContent({ content }: PostContentProps) {
  if (!content) {
    return <p className={styles.empty}>No content available.</p>;
  }

  // If content is a string, try to parse as JSON, else render as text
  let blocks: ContentBlock[];
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      blocks = Array.isArray(parsed)
        ? parsed
        : [{ type: 'paragraph', content: [{ type: 'text', text: content }] }];
    } catch {
      return (
        <div className={styles.content}>
          <p className={styles.paragraph}>{content}</p>
        </div>
      );
    }
  } else {
    blocks = content;
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return <p className={styles.empty}>No content available.</p>;
  }

  return (
    <div className={styles.content}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
