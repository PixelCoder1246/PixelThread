import { READING_SPEED } from '@/constants';

export function cn(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatRelativeDate(
  date: string | Date | null | undefined
): string {
  if (!date) return '';
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return formatDate(dateObj);
}

export function formatNumber(num: unknown): string {
  const n = Number(num);
  if (!Number.isFinite(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractTextFromContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (typeof content === 'number' || typeof content === 'boolean')
    return String(content);
  if (Array.isArray(content))
    return content.map(extractTextFromContent).join(' ');
  if (content && typeof content === 'object') {
    const obj = content as Record<string, unknown>;
    if (obj.text && typeof obj.text === 'string') return obj.text;
    if (obj.value && typeof obj.value === 'string') return obj.value;
    if (obj.props && typeof obj.props === 'object') {
      const props = obj.props as Record<string, unknown>;
      if (props.children) return extractTextFromContent(props.children);
    }
    if (obj.content) return extractTextFromContent(obj.content);
    if (obj.props) return extractTextFromContent(obj.props);
  }
  return '';
}

export function blocksToMarkdown(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return extractTextFromContent(content);
  return content
    .map((block) => {
      if (typeof block === 'string') return block;
      if (!block || typeof block !== 'object') return '';
      const b = block as Record<string, unknown>;
      const url = typeof b.url === 'string' ? b.url : '';
      if (url) {
        return `![image](${url})`;
      }
      let text = '';
      if (typeof b.value === 'string') text = b.value;
      else if (typeof b.text === 'string') text = b.text;
      else if (b.data && typeof b.data === 'object') {
        const d = b.data as Record<string, unknown>;
        if (typeof d.text === 'string') text = d.text;
      }
      const type = typeof b.type === 'string' ? b.type : '';
      if (type.startsWith('h') && type.length === 2) {
        const level = parseInt(type[1], 10);
        if (level >= 1 && level <= 6) {
          return `${'#'.repeat(level)} ${text}`;
        }
      }
      if (type === 'code') {
        return '```\n' + text + '\n```';
      }
      if (type === 'blockquote' || type === 'quote') {
        return text
          .split('\n')
          .map((l) => `> ${l}`)
          .join('\n');
      }
      return text;
    })
    .filter(Boolean)
    .join('\n\n');
}

export function calculateReadingTime(content: unknown): number {
  const text = extractTextFromContent(content);
  if (!text.trim()) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / READING_SPEED));
}

export function parseJsonSafe<T>(
  value: string | null | undefined,
  fallback: T
): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRandomColor(name: string): string {
  const colors = [
    'var(--primary-500)',
    'var(--accent-500)',
    'var(--emerald-500)',
    'var(--amber-500)',
    'var(--rose-500)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getPostStatusColor(status: string): string {
  switch (status) {
    case 'PUBLISHED':
      return 'var(--color-success)';
    case 'DRAFT':
      return 'var(--color-warning)';
    case 'ARCHIVED':
      return 'var(--text-tertiary)';
    default:
      return 'var(--text-tertiary)';
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}
