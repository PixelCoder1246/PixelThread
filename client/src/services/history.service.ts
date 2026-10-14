import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type { PostListItem } from '@/types/post';

export interface HistoryItem extends PostListItem {
  lastReadAt: string;
  readCount: number;
}

export interface HistoryResponse {
  posts: HistoryItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const historyService = {
  async getHistory(page = 1, limit = 10): Promise<HistoryResponse> {
    return api.get(API_ENDPOINTS.history.list, { page, limit });
  },

  async deleteHistoryItem(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.history.delete(id));
  },

  async clearHistory(): Promise<void> {
    return api.delete(API_ENDPOINTS.history.clear);
  },
};