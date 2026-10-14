export interface SearchResultPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  tags: { tag: { id: string; name: string } }[];
  author: { id: string; name: string; image?: string | null };
  views: number;
  likesCount: number;
  createdAt: string;
  publishedAt?: string | null;
}

export interface SearchResultUser {
  id: string;
  name: string;
  image?: string | null;
  postsCount: number;
  followersCount: number;
  createdAt: string;
}

export interface SearchResultTag {
  id: string;
  name: string;
  postCount: number;
}

export interface GlobalSearchResponse {
  posts: SearchResultPost[];
  users: SearchResultUser[];
  tags: SearchResultTag[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
}

export interface SuggestionsResponse {
  posts: Array<{ id: string; title: string; slug: string; excerpt?: string | null }>;
  users: Array<{ id: string; name: string; image?: string | null }>;
  tags: Array<{ id: string; name: string }>;
}

export interface TrendingResponse {
  keyword: string;
  count: number;
}

export interface HistoryResponse {
  id: string;
  query: string;
  createdAt: string;
}

export interface PopularTagResponse {
  id: string;
  name: string;
  postCount: number;
}

export interface AuthorResponse {
  id: string;
  name: string;
  image?: string | null;
  postsCount: number;
  followersCount: number;
}

export interface AuthorsResponse {
  authors: AuthorResponse[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}