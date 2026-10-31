import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseInline(text) {
  let res = text;
  res = res.replace(
    /`([^`]+)`/g,
    (_match, code) => `<code>${escapeHtml(code)}</code>`
  );
  res = res.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>');
  res = res.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  res = res.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
  res = res.replace(/~~(.*?)~~/g, '<s>$1</s>');
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const cleanUrl = url.replace(/"/g, '&quot;');
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  return res;
}

describe('Markdown Parser', () => {
  describe('inline formatting', () => {
    test('parses bold text correctly', () => {
      assert.equal(
        parseInline('This is **bold** text'),
        'This is <strong>bold</strong> text'
      );
    });

    test('parses italic text correctly', () => {
      assert.equal(
        parseInline('This is *italic* text'),
        'This is <em>italic</em> text'
      );
    });

    test('parses inline code blocks correctly with HTML escaping', () => {
      assert.equal(
        parseInline('Run `npm run build && <test>` now'),
        'Run <code>npm run build &amp;&amp; &lt;test&gt;</code> now'
      );
    });

    test('parses strikethrough text correctly', () => {
      assert.equal(
        parseInline('Old ~~deprecated~~ value'),
        'Old <s>deprecated</s> value'
      );
    });

    test('parses links with security attributes', () => {
      assert.equal(
        parseInline('Visit [Google](https://google.com)'),
        'Visit <a href="https://google.com" target="_blank" rel="noopener noreferrer">Google</a>'
      );
    });
  });
});
