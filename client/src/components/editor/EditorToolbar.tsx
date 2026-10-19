'use client';

import { useState, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import styles from './EditorToolbar.module.css';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  // Subscribe to editor transactions & selection updates so undo, redo, and active states update reactively
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      setTick((t) => t + 1);
    };

    editor.on('transaction', handler);
    editor.on('selectionUpdate', handler);

    return () => {
      editor.off('transaction', handler);
      editor.off('selectionUpdate', handler);
    };
  }, [editor]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const input = window.prompt(
      'Enter link URL (e.g. https://example.com)',
      previousUrl
    );

    if (input === null) return;
    const trimmed = input.trim();

    if (trimmed === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Auto-prefix https:// if user omitted protocol
    const finalUrl =
      /^https?:\/\//i.test(trimmed) ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('tel:') ||
      trimmed.startsWith('/')
        ? trimmed
        : `https://${trimmed}`;

    if (editor.state.selection.empty) {
      // If no text was highlighted, insert the link with the URL as the text
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: trimmed,
          marks: [{ type: 'link', attrs: { href: finalUrl } }],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: finalUrl })
        .run();
    }
  };

  const addImage = () => {
    const input = window.prompt(
      'Enter image URL (e.g. https://example.com/photo.jpg)'
    );
    if (!input) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    const finalUrl =
      /^https?:\/\//i.test(trimmed) ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('/')
        ? trimmed
        : `https://${trimmed}`;

    editor.chain().focus().setImage({ src: finalUrl }).run();
  };

  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${styles.toolBtn} ${editor.isActive('bold') ? styles.toolBtnActive : ''}`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${styles.toolBtn} ${editor.isActive('italic') ? styles.toolBtnActive : ''}`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`${styles.toolBtn} ${editor.isActive('strike') ? styles.toolBtnActive : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`${styles.toolBtn} ${editor.isActive('code') ? styles.toolBtnActive : ''}`}
        title="Inline Code"
      >
        <Code size={16} />
      </button>

      <div className={styles.divider} />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${styles.toolBtn} ${editor.isActive('heading', { level: 1 }) ? styles.toolBtnActive : ''}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${styles.toolBtn} ${editor.isActive('heading', { level: 2 }) ? styles.toolBtnActive : ''}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${styles.toolBtn} ${editor.isActive('heading', { level: 3 }) ? styles.toolBtnActive : ''}`}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <div className={styles.divider} />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${styles.toolBtn} ${editor.isActive('bulletList') ? styles.toolBtnActive : ''}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${styles.toolBtn} ${editor.isActive('orderedList') ? styles.toolBtnActive : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${styles.toolBtn} ${editor.isActive('blockquote') ? styles.toolBtnActive : ''}`}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={styles.toolBtn}
        title="Horizontal Rule"
      >
        <Minus size={16} />
      </button>

      <div className={styles.divider} />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={setLink}
        className={`${styles.toolBtn} ${editor.isActive('link') ? styles.toolBtnActive : ''}`}
        title="Add Link"
      >
        <LinkIcon size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={addImage}
        className={styles.toolBtn}
        title="Add Image URL"
      >
        <ImageIcon size={16} />
      </button>

      <div className={styles.divider} />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          editor.chain().focus().undo().run();
        }}
        disabled={!canUndo}
        className={styles.toolBtn}
        title="Undo (Ctrl+Z)"
      >
        <Undo size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          editor.chain().focus().redo().run();
        }}
        disabled={!canRedo}
        className={styles.toolBtn}
        title="Redo (Ctrl+Y)"
      >
        <Redo size={16} />
      </button>
    </div>
  );
}
