'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/core';
import {
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code2,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './BubbleMenu.module.css';

interface BubbleMenuProps {
  editor: Editor;
}

export default function BubbleMenu({ editor }: BubbleMenuProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const update = useCallback(() => {
    const { selection } = editor.state;
    const { $anchor } = selection;
    const node = $anchor.node();
    const isRoot = $anchor.depth === 1;
    const isEmptyParagraph =
      isRoot && node.type.name === 'paragraph' && node.content.size === 0;

    if (!isEmptyParagraph) {
      setShow(false);
      return;
    }

    try {
      const coords = editor.view.coordsAtPos($anchor.pos);
      const editorRect = editor.view.dom.getBoundingClientRect();

      let left = coords.left;
      if (menuRef.current) {
        const menuWidth = menuRef.current.offsetWidth;
        left = Math.min(left, editorRect.right - menuWidth - 8);
      }

      setPosition({ top: coords.top, left });
      setShow(true);
    } catch {
      setShow(false);
    }
  }, [editor]);

  useEffect(() => {
    const onSelectionUpdate = () => update();
    const onUpdate = () => update();
    const onBlur = () => {
      setTimeout(() => {
        if (!editor.view) return;
        const editorEl = editor.view.dom;
        if (!editorEl.contains(document.activeElement)) {
          setShow(false);
        }
      }, 200);
    };
    const onScroll = () => {
      if (show) update();
    };

    editor.on('selectionUpdate', onSelectionUpdate);
    editor.on('update', onUpdate);
    editor.on('blur', onBlur);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      editor.off('selectionUpdate', onSelectionUpdate);
      editor.off('update', onUpdate);
      editor.off('blur', onBlur);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [editor, update, show]);

  if (!show) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={styles.menu}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)',
        zIndex: 'var(--z-tooltip)',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className={styles.group}>
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
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
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
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <button
          type="button"
          className={styles.button}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          aria-label="Divider"
        >
          <Minus size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
}
