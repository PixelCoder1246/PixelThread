import api from '@/lib/api';

// Shape returned by the server (flat)
interface RawHistoryEntry {
  id: string;
  postId: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  author?: { id: string; name: string; image?: string | null };
  publishedAt?: string;
  views?: number;
  tags?: { id: string; name: string }[];
  lastReadAt: string;
  readCount: number;
}

// Shape the page component consumes (nested)
interface HistoryEntry {
  id: string;
  post: {
    id: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    author?: { id: string; name: string; image?: string | null };
    publishedAt?: string;
    tags?: { id: string; name: string }[];
  };
  viewedAt: string;
}

function toHistoryEntry(raw: RawHistoryEntry): HistoryEntry {
  return {
    id: raw.id,
    post: {
      id: raw.postId,
      title: raw.title,
      slug: raw.slug,
      excerpt: raw.excerpt,
      author: raw.author,
      publishedAt: raw.publishedAt,
      tags: raw.tags ?? [],
    },
    viewedAt: raw.lastReadAt,
  };
}

export const historyService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ entries: HistoryEntry[]; pagination: unknown }> {
    const res = await api.get('/me/history', { params });
    const raw: RawHistoryEntry[] = res.data.data.posts ?? [];
    return {
      entries: raw.map(toHistoryEntry),
      pagination: res.data.data.pagination,
    };
  },

  async clearAll(): Promise<void> {
    await api.delete('/me/history');
  },

  async deleteEntry(id: string): Promise<void> {
    await api.delete(`/me/history/${id}`);
  },
};

export type { HistoryEntry };
