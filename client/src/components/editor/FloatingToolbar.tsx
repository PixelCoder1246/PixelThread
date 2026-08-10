'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/core';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  Highlighter,
  Link2Off,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './FloatingToolbar.module.css';

interface FloatingToolbarProps {
  editor: Editor;
}

export default function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [show, setShow] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [linkUrl, setLinkUrl] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const { selection } = editor.state;
    const { empty, from, to } = selection;

    if (empty) {
      setShow(false);
      setShowLinkInput(false);
      return;
    }

    try {
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const editorRect = editor.view.dom.getBoundingClientRect();

      let left = (start.left + end.left) / 2;
      if (toolbarRef.current) {
        const toolbarWidth = toolbarRef.current.offsetWidth;
        left = Math.max(
          editorRect.left + 8,
          Math.min(left - toolbarWidth / 2, editorRect.right - toolbarWidth - 8),
        );
      }
      const top = start.top - 8;

      setPosition({ top, left });
      setShow(true);
    } catch {
      setShow(false);
    }
  }, [editor]);

  useEffect(() => {
    const onSelectionUpdate = () => updatePosition();
    const onBlur = () => {
      setTimeout(() => {
        if (!editor.view) return;
        const editorEl = editor.view.dom;
        const toolbarEl = toolbarRef.current;
        const activeEl = document.activeElement;
        if (
          !editorEl.contains(activeEl) &&
          !(toolbarEl && toolbarEl.contains(activeEl))
        ) {
          setShow(false);
          setShowLinkInput(false);
        }
      }, 200);
    };
    const onScroll = () => {
      if (show) updatePosition();
    };

    editor.on('selectionUpdate', onSelectionUpdate);
    editor.on('blur', onBlur);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      editor.off('selectionUpdate', onSelectionUpdate);
      editor.off('blur', onBlur);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [editor, updatePosition, show]);

  const handleLinkClick = useCallback(() => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    const previousUrl = editor.getAttributes('link').href as string || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  }, [editor]);

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
    [editor, linkUrl],
  );

  if (!show) return null;

  return createPortal(
    <div
      ref={toolbarRef}
      className={styles.toolbar}
      data-visible="true"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)',
        zIndex: 'var(--z-tooltip)',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {showLinkInput ? (
        <form className={styles.linkInput} onSubmit={handleLinkSubmit}>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL..."
            autoFocus
          />
          <button
            type="button"
            className={cn(styles.button, editor.isActive('link') && styles.active)}
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
        <>
          <div className={styles.group}>
            <button
              type="button"
              className={cn(styles.button, editor.isActive('bold') && styles.active)}
              onClick={() => editor.chain().focus().toggleBold().run()}
              aria-label="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              className={cn(styles.button, editor.isActive('italic') && styles.active)}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              aria-label="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              className={cn(styles.button, editor.isActive('strike') && styles.active)}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              aria-label="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>
          </div>

          <div className={styles.divider} />

          <div className={styles.group}>
            <button
              type="button"
              className={cn(styles.button, editor.isActive('code') && styles.active)}
              onClick={() => editor.chain().focus().toggleCode().run()}
              aria-label="Inline code"
            >
              <Code size={16} />
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={handleLinkClick}
              aria-label="Link"
            >
              {editor.isActive('link') ? <Link2Off size={16} /> : <Link size={16} />}
            </button>
            <button
              type="button"
              className={cn(styles.button, editor.isActive('highlight') && styles.active)}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              aria-label="Highlight"
            >
              <Highlighter size={16} />
            </button>
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
