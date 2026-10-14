import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function formatDate(date: string | Date, pattern = 'PPP'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return format(d, pattern);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'PPp');
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min read';
  return `${minutes} min read`;
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
