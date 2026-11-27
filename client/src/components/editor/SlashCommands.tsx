'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from 'react';
import { Extension, type Editor } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Image,
  Minus,
  Table,
} from 'lucide-react';
import styles from './SlashCommands.module.css';

type Range = { from: number; to: number };

interface SuggestionProps<TItem> {
  editor: Editor;
  range: Range;
  clientRect: (() => DOMRect | null) | null;
  items: TItem[];
  command: (item: TItem) => void;
  query: string;
  decorationNode: Element | null;
}

interface SuggestionKeyDownProps {
  event: KeyboardEvent;
}

interface CommandItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

const commandItems: CommandItem[] = [
  {
    icon: <Heading1 size={18} />,
    title: 'Heading 1',
    description: 'Large section heading',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run();
    },
  },
  {
    icon: <Heading2 size={18} />,
    title: 'Heading 2',
    description: 'Medium section heading',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run();
    },
  },
  {
    icon: <Heading3 size={18} />,
    title: 'Heading 3',
    description: 'Small section heading',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run();
    },
  },
  {
    icon: <List size={18} />,
    title: 'Bullet List',
    description: 'Create a simple bullet list',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    icon: <ListOrdered size={18} />,
    title: 'Ordered List',
    description: 'Create a numbered list',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    icon: <Quote size={18} />,
    title: 'Blockquote',
    description: 'Add a blockquote',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    icon: <Code2 size={18} />,
    title: 'Code Block',
    description: 'Add a code snippet',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    icon: <Image size={18} />,
    title: 'Image',
    description: 'Add an image',
    command: ({ editor, range }) => {
      const url = window.prompt('Enter image URL');
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      }
    },
  },
  {
    icon: <Minus size={18} />,
    title: 'Divider',
    description: 'Add a horizontal rule',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    icon: <Table size={18} />,
    title: 'Table',
    description: 'Insert a table',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
];

interface CommandsListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

interface CommandsListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const CommandsList = forwardRef<CommandsListRef, CommandsListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [items, command]
    );

    useImperativeHandle(
      ref,
      () => ({
        onKeyDown: ({ event }: SuggestionKeyDownProps) => {
          if (event.key === 'ArrowUp') {
            setSelectedIndex(
              (prev) => (prev - 1 + items.length) % items.length
            );
            return true;
          }
          if (event.key === 'ArrowDown') {
            setSelectedIndex((prev) => (prev + 1) % items.length);
            return true;
          }
          if (event.key === 'Enter') {
            selectItem(selectedIndex);
            return true;
          }
          return false;
        },
      }),
      [items, selectedIndex, selectItem]
    );

    return (
      <div className={styles.menu}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={`${styles.item} ${index === selectedIndex ? styles.active : ''}`}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <div className={styles.info}>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.description}>{item.description}</span>
              </div>
            </button>
          ))
        ) : (
          <div className={styles.empty}>No results</div>
        )}
      </div>
    );
  }
);

CommandsList.displayName = 'CommandsList';

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: CommandItem;
        }) => {
          props.command({ editor, range });
        },
        items: ({ query }: { query: string }) => {
          return commandItems.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: () => {
          let component: ReactRenderer<CommandsListRef>;
          let element: HTMLDivElement;

          return {
            onStart: (props: SuggestionProps<CommandItem>) => {
              component = new ReactRenderer(CommandsList, {
                props: {
                  items: props.items,
                  command: props.command,
                },
                editor: props.editor,
              });

              element = component.element as HTMLDivElement;
              element.style.position = 'fixed';
              element.style.zIndex = 'var(--z-command)';

              const rect = props.clientRect?.();
              if (rect) {
                element.style.left = `${rect.left}px`;
                element.style.top = `${rect.bottom + 4}px`;
              }

              document.body.appendChild(element);
            },

            onUpdate: (props: SuggestionProps<CommandItem>) => {
              component.updateProps({
                items: props.items,
                command: props.command,
              });

              const rect = props.clientRect?.();
              if (rect) {
                element.style.left = `${rect.left}px`;
                element.style.top = `${rect.bottom + 4}px`;
              }
            },

            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === 'Escape') {
                element?.remove();
                return true;
              }
              return component.ref?.onKeyDown(props) ?? false;
            },

            onExit: () => {
              element?.remove();
              component?.destroy();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
