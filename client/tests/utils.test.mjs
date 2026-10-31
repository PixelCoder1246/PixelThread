import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test utils functions directly
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function truncate(str, length) {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

describe('Utility Functions', () => {
  describe('formatNumber', () => {
    test('formats numbers below 1000 as string', () => {
      assert.equal(formatNumber(0), '0');
      assert.equal(formatNumber(42), '42');
      assert.equal(formatNumber(999), '999');
    });

    test('formats thousands with K suffix', () => {
      assert.equal(formatNumber(1000), '1.0K');
      assert.equal(formatNumber(1500), '1.5K');
      assert.equal(formatNumber(24500), '24.5K');
    });

    test('formats millions with M suffix', () => {
      assert.equal(formatNumber(1000000), '1.0M');
      assert.equal(formatNumber(3400000), '3.4M');
    });
  });

  describe('slugify', () => {
    test('converts plain title to kebab case', () => {
      assert.equal(slugify('Hello World'), 'hello-world');
    });

    test('handles special characters and multiple spaces', () => {
      assert.equal(
        slugify('What is React 19 & Next.js?!'),
        'what-is-react-19-nextjs'
      );
    });

    test('strips leading and trailing hyphens', () => {
      assert.equal(slugify('---hello---'), 'hello');
    });
  });

  describe('truncate', () => {
    test('does not truncate strings shorter than limit', () => {
      assert.equal(truncate('short text', 20), 'short text');
    });

    test('truncates strings longer than limit and appends ellipsis', () => {
      assert.equal(
        truncate('This is a very long text to be truncated', 10),
        'This is a...'
      );
    });
  });

  describe('getInitials', () => {
    test('extracts two initials from full name', () => {
      assert.equal(getInitials('John Doe'), 'JD');
    });

    test('handles single names', () => {
      assert.equal(getInitials('PixelCoder'), 'P');
    });

    test('handles multiple names and caps at 2 characters', () => {
      assert.equal(getInitials('Alex Michael Smith'), 'AM');
    });
  });
});
