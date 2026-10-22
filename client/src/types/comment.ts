export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
  likeCount: number;
  isLiked: boolean;
  replies: Comment[];
}

export interface ThreadedCommentsResponse {
  comments: Comment[];
}

export interface RepliesResponse {
  comment: Comment;
}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  content: string;
}
