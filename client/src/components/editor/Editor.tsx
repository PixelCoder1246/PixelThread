import React, { useMemo, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent, type Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { common, createLowlight } from 'lowlight';
import { cn } from '@/lib/utils';
import EditorToolbar from './EditorToolbar';
import FloatingToolbar from './FloatingToolbar';
import BubbleMenu from './BubbleMenu';
import { SlashCommandExtension } from './SlashCommands';
import styles from './Editor.module.css';

const lowlight = createLowlight(common);

interface EditorProps {
  content?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  onReady?: () => void;
}

interface EditorRef {
  chain: TiptapEditor['chain'];
  getHTML: () => string;
  getText: () => string;
  can: TiptapEditor['can'];
  isActive: (name: string, attributes?: Record<string, unknown>) => boolean;
}

const Editor = forwardRef<EditorRef, EditorProps>(({
  content = '',
  onChange,
  editable = true,
  placeholder = 'Start writing...',
  className,
  onReady,
}, ref) => {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      SlashCommandExtension,
    ],
    [placeholder],
  );

  const handleUpdate = useCallback(
    ({ editor }: { editor: { getHTML: () => string } }) => {
      onChange?.(editor.getHTML());
    },
    [onChange],
  );

  const editor = useEditor({
    extensions,
    editable,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor && editable !== editor.isEditable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  useEffect(() => {
    if (editor) {
      onReady?.();
    }
  }, [editor, onReady]);

  useImperativeHandle(ref, () => ({
    chain: () => editor?.chain(),
    getHTML: () => editor?.getHTML() || '',
    getText: () => editor?.getText() || '',
    can: () => editor?.can(),
    isActive: (name: string, attributes?: Record<string, unknown>) => editor?.isActive(name, attributes) || false,
  }), [editor]);

  if (!editor) return null;

  return (
    <div className={cn(styles.editor, className)}>
      <EditorToolbar editor={editor} />
      <FloatingToolbar editor={editor} />
      <BubbleMenu editor={editor} />
      <div className={styles.editorContent}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
