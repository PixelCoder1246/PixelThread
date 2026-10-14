import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type { PostListItem } from '@/types/post';

export interface BookmarksResponse {
  posts: (PostListItem & { bookmarkedAt: string })[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BookmarkStatusResponse {
  isBookmarked: boolean;
}

export const bookmarksService = {
  async getMyBookmarks(
    page = 1,
    limit = 10,
    sort = 'newest'
  ): Promise<BookmarksResponse> {
    return api.get(API_ENDPOINTS.bookmarks.list, { page, limit, sort });
  },

  async bookmarkPost(postId: string): Promise<{ bookmarked: true }> {
    return api.post(API_ENDPOINTS.bookmarks.add(postId));
  },

  async removeBookmark(postId: string): Promise<{ bookmarked: false }> {
    return api.delete(API_ENDPOINTS.bookmarks.remove(postId));
  },

  async getBookmarkStatus(postId: string): Promise<BookmarkStatusResponse> {
    return api.get(API_ENDPOINTS.bookmarks.status(postId));
  },
};
