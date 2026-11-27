'use client';

import React, { useState, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code2,
  List,
  ListOrdered,
  Image,
  Link,
  Table,
  Minus,
  Link2Off,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './EditorToolbar.module.css';

interface EditorToolbarProps {
  editor: Editor;
}

type ToolbarGroup = 'history' | 'inline' | 'blocks' | 'insert';

const groupOrder: ToolbarGroup[] = ['history', 'inline', 'blocks', 'insert'];

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleLinkSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (linkUrl) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: linkUrl })
          .run();
      } else {
        editor.chain().focus().unsetLink().run();
      }
      setShowLinkInput(false);
      setLinkUrl('');
    },
    [editor, linkUrl]
  );

  const handleImageInsert = useCallback(() => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const groups: Record<ToolbarGroup, React.ReactNode> = {
    history: (
      <>
        <button
          type="button"
          className={styles.button}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Redo"
        >
          <Redo2 size={16} />
        </button>
      </>
    ),
    inline: (
      <>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('bold') && styles.active
          )}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('italic') && styles.active
          )}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('strike') && styles.active
          )}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('code') && styles.active
          )}
          onClick={() => editor.chain().focus().toggleCode().run()}
          aria-label="Code"
        >
          <Code size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('highlight') && styles.active
          )}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          aria-label="Highlight"
        >
          <Highlighter size={16} />
        </button>
      </>
    ),
    blocks: (
      <>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('heading', { level: 1 }) && styles.active
          )}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          aria-label="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('heading', { level: 2 }) && styles.active
          )}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('heading', { level: 3 }) && styles.active
          )}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          aria-label="Heading 3"
        >
          <Heading3 size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('blockquote') && styles.active
          )}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Blockquote"
        >
          <Quote size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('codeBlock') && styles.active
          )}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          aria-label="Code block"
        >
          <Code2 size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('bulletList') && styles.active
          )}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          className={cn(
            styles.button,
            editor.isActive('orderedList') && styles.active
          )}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered list"
        >
          <ListOrdered size={16} />
        </button>
      </>
    ),
    insert: (
      <>
        <button
          type="button"
          className={styles.button}
          onClick={handleImageInsert}
          aria-label="Insert image"
        >
          <Image size={16} />
        </button>
        {showLinkInput ? (
          <form
            onSubmit={handleLinkSubmit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="URL..."
              style={{
                width: 120,
                height: '1.75rem',
                padding: '0 6px',
                fontSize: '12px',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
              autoFocus
            />
            <button
              type="submit"
              className={styles.button}
              aria-label="Apply link"
            >
              <Link size={16} />
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setShowLinkInput(false);
              }}
              aria-label="Remove link"
            >
              <Link2Off size={16} />
            </button>
          </form>
        ) : (
          <button
            type="button"
            className={cn(
              styles.button,
              editor.isActive('link') && styles.active
            )}
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
              } else {
                setLinkUrl('');
                setShowLinkInput(true);
              }
            }}
            aria-label="Link"
          >
            <Link size={16} />
          </button>
        )}
        <button
          type="button"
          className={styles.button}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          aria-label="Insert table"
        >
          <Table size={16} />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          aria-label="Insert divider"
        >
          <Minus size={16} />
        </button>
      </>
    ),
  };

  return (
    <div className={styles.toolbar}>
      {groupOrder.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <div className={styles.divider} />}
          <div className={styles.group}>{groups[key]}</div>
        </React.Fragment>
      ))}
    </div>
  );
}
