import { User } from './user';

export interface Tag {
  id: string;
  name: string;
}

export interface PostAnalytics {
  views: number;
}

export interface PostAuthor {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
}

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: ContentBlock[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE';
  authorId: string;
  author: PostAuthor;
  tags: { tag: Tag }[];
  analytics?: PostAnalytics | null;
  _count?: {
    likes: number;
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  featured: boolean;
  pinned: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface PostDetail extends PostListItem {
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string[] | null;
    canonicalUrl?: string | null;
    score?: number | null;
  } | null;
}

export interface ContentBlock {
  type: string;
  attrs?: Record<string, unknown>;
  content?: ContentBlock[];
  text?: string;
  marks?: Mark[];
}

export interface Mark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface CreatePostInput {
  title: string;
  content: ContentBlock[];
  excerpt?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  visibility?: 'PUBLIC' | 'PRIVATE';
  tags?: string[];
}

export type UpdatePostInput = Partial<CreatePostInput>;

export interface PostSearchParams {
  q?: string;
  tag?: string;
  authorId?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'mostViewed' | 'mostLiked' | 'relevance';
}

export interface PostsResponse {
  posts: PostListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SearchPostsResponse {
  posts: PostListItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
