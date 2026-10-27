/**
 * Robust markdown to clean HTML parser for TipTap editor and preview rendering.
 * Converts markdown headings, code blocks, lists, blockquotes, inline formatting,
 * and normal text into semantic HTML.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseInline(text: string): string {
  let res = text;

  // 1. Inline code: `code`
  res = res.replace(/`([^`]+)`/g, (_match, code) => {
    return `<code>${escapeHtml(code)}</code>`;
  });

  // 2. Bold & Italic: ***text*** or ___text___
  res = res.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>');

  // 3. Bold: **text** or __text__
  res = res.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

  // 4. Italic: *text* or _text_
  res = res.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

  // 5. Strikethrough: ~~text~~
  res = res.replace(/~~(.*?)~~/g, '<s>$1</s>');

  // 6. Links: [label](url)
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const cleanUrl = url.replace(/"/g, '&quot;');
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  return res;
}

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const result: string[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];

  let inList: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  let inBlockquote = false;
  let blockquoteContent: string[] = [];

  let inParagraph = false;
  let paragraphContent: string[] = [];

  const flushParagraph = () => {
    if (inParagraph && paragraphContent.length > 0) {
      const pText = paragraphContent.join('<br/>').trim();
      if (pText) {
        result.push(`<p>${parseInline(pText)}</p>`);
      }
      paragraphContent = [];
      inParagraph = false;
    }
  };

  const flushList = () => {
    if (inList && listItems.length > 0) {
      const itemsHtml = listItems
        .map((item) => `<li>${parseInline(item)}</li>`)
        .join('');
      result.push(`<${inList}>${itemsHtml}</${inList}>`);
      listItems = [];
      inList = null;
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote && blockquoteContent.length > 0) {
      const bqText = blockquoteContent.join('<br/>').trim();
      if (bqText) {
        result.push(`<blockquote><p>${parseInline(bqText)}</p></blockquote>`);
      }
      blockquoteContent = [];
      inBlockquote = false;
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushBlockquote();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Blocks: ```lang ... ```
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        flushAll();
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
        codeBlockContent = [];
      } else {
        inCodeBlock = false;
        const codeText = escapeHtml(codeBlockContent.join('\n'));
        const langClass = codeBlockLang
          ? ` class="language-${escapeHtml(codeBlockLang)}"`
          : '';
        result.push(`<pre><code${langClass}>${codeText}</code></pre>`);
        codeBlockContent = [];
        codeBlockLang = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // 2. Blank Lines
    if (!trimmed) {
      flushAll();
      continue;
    }

    // 3. Horizontal Rules: ---, ***, ___
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushAll();
      result.push('<hr/>');
      continue;
    }

    // 4. Headings: #, ##, ###, ####, #####, ######
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      result.push(`<h${level}>${parseInline(headingText)}</h${level}>`);
      continue;
    }

    // 5. Blockquotes: > quote
    if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      inBlockquote = true;
      blockquoteContent.push(trimmed.replace(/^>\s?/, ''));
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // 6. Unordered Lists: - item, * item, + item
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (inList === 'ol') flushList();
      inList = 'ul';
      listItems.push(ulMatch[1].trim());
      continue;
    }

    // 7. Ordered Lists: 1. item, 2. item
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      if (inList === 'ul') flushList();
      inList = 'ol';
      listItems.push(olMatch[1].trim());
      continue;
    }

    // If we were in a list and hit normal text
    if (inList) {
      flushList();
    }

    // 8. Normal Paragraph text
    inParagraph = true;
    paragraphContent.push(trimmed);
  }

  // Final flush for remaining open blocks
  if (inCodeBlock) {
    const codeText = escapeHtml(codeBlockContent.join('\n'));
    result.push(`<pre><code>${codeText}</code></pre>`);
  }
  flushAll();

  return result.join('\n');
}

/**
 * Strips markdown and returns clean plain text (useful for copying as raw text)
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, '$1') // remove code fence markers
    .replace(/`([^`]+)`/g, '$1') // remove inline code backticks
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // remove bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // remove italic
    .replace(/~~(.*?)~~/g, '$1') // remove strikethrough
    .replace(/^#{1,6}\s+(.+)$/gm, '$1') // remove heading hashes
    .replace(/^[-*+]\s+/gm, '• ') // replace bullets with bullet symbol
    .replace(/^>\s+/gm, '') // remove blockquotes
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)') // format links
    .trim();
}
