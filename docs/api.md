# API Documentation

> **Status**: Auth, Post, User, Analytics, SEO, Comment, Like, Tag, AI (16 endpoints), Notification, Follow, and Search modules fully implemented (v0.5.0). See [createdAPIs.md](../createdAPIs.md) for complete Postman-ready API reference with request/response examples.

## Base URL

| Environment | URL |
|---|---|
| Development | `http://localhost:5000` |
| Production | TBD |

---

## Health Check

### `GET /`

Returns a welcome message to confirm the API is running.

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "PixelThread API is running!"
}
```

---

## Implemented Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register a new user |
| `POST` | `/api/auth/verify-email` | None | Verify email with token |
| `POST` | `/api/auth/resend-verification` | None | Resend verification email |
| `POST` | `/api/auth/login` | None | Login, sets `accessToken` + `refreshToken` cookies |
| `POST` | `/api/auth/logout` | `accessToken` cookie | Logout, clears cookies + deletes session |
| `POST` | `/api/auth/refresh` | `refreshToken` cookie | Explicit token rotation |
| `GET` | `/api/auth/me` | `accessToken` cookie | Get current authenticated user |
| `POST` | `/api/auth/forgot-password` | None | Send password reset email |
| `POST` | `/api/auth/reset-password` | None | Reset password with token |

### Posts (`/api/posts`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/posts` | None | List published posts (paginated) |
| `GET` | `/api/posts/search` | None | Search posts by query, tag, author |
| `GET` | `/api/posts/:slug` | None | Get a post by slug |
| `POST` | `/api/posts` | `accessToken` + verified email | Create a post (multipart, supports images) |
| `PUT` | `/api/posts/:id` | `accessToken` + verified email | Update a post (owner or admin) |
| `DELETE` | `/api/posts/:id` | `accessToken` + verified email | Delete a post (owner or admin) — also removes uploaded images |

### SEO (`/api/posts`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/posts/:id/seo` | None | Get SEO metadata, score (0–100), and suggestions |
| `PATCH` | `/api/posts/:id/seo` | `accessToken` cookie | Update SEO metadata (post owner or admin) — auto-recalculates score |

### Users (`/api/users`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/:id/posts` | Optional | Get posts by user (auth = include drafts/private) |

### Analytics (`/api`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/posts/:id/view` | None | Record a view for a post |
| `GET` | `/api/posts/:id/analytics` | None | Get view, like, comment counts for a post |
| `GET` | `/api/me/analytics` | `accessToken` cookie | Get authenticated user's overall analytics |
| `GET` | `/api/me/posts/analytics` | `accessToken` cookie | Get paginated analytics for user's posts |
| `GET` | `/api/me/posts/top` | `accessToken` cookie | Get user's top performing posts |
| `GET` | `/api/admin/analytics` | `accessToken` + `ADMIN` role | Platform-wide analytics (admin only) |

### Comments (`/api`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/posts/:postId/comments` | Optional | Get all root comments for a post with recursive nested replies |
| `POST` | `/api/posts/:postId/comments` | `accessToken` + verified email | Create a root comment on a post |
| `GET` | `/api/comments/:id/replies` | Optional | Get the full reply subtree from a specific comment |
| `POST` | `/api/comments/:id/replies` | `accessToken` + verified email | Reply to any comment (unlimited nesting depth) |
| `PATCH` | `/api/comments/:id` | `accessToken` + verified email | Update a comment (owner or admin) |
| `DELETE` | `/api/comments/:id` | `accessToken` + verified email | Delete a comment + all descendants (owner or admin) |

### Tags (`/api/tags`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tags` | None | List all tags with post counts (paginated, sortable) |
| `GET` | `/api/tags/:name/posts` | None | List public published posts for a tag (paginated) |
| `POST` | `/api/tags` | `accessToken` + `ADMIN` role | Create a new tag |
| `DELETE` | `/api/tags/:id` | `accessToken` + `ADMIN` role | Delete a tag (only if no posts attached) |

### Likes (`/api`)
| Method | Path | Auth | Description |
|---|---|---|---|---|
| `POST` | `/api/posts/:id/like` | `accessToken` cookie | Toggle like on a blog post |
| `POST` | `/api/comments/:id/like` | `accessToken` cookie | Toggle like on a comment |
| `GET` | `/api/posts/:id/likes` | Optional | Get list of users who liked a post |
| `GET` | `/api/comments/:id/likes` | Optional | Get list of users who liked a comment |
| `GET` | `/api/posts/:id/like-status` | `accessToken` cookie | Get current user's like status for a post |
| `GET` | `/api/comments/:id/like-status` | `accessToken` cookie | Get current user's like status for a comment |

### AI (`/api/ai`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/generate-post` | `accessToken` cookie + rate-limited | Generate a complete blog post from a topic |
| `POST` | `/api/ai/title` | `accessToken` cookie + rate-limited | Generate title suggestions from content |
| `POST` | `/api/ai/title/improve` | `accessToken` cookie + rate-limited | Improve an existing title |
| `POST` | `/api/ai/excerpt` | `accessToken` cookie + rate-limited | Generate a post excerpt/summary |
| `POST` | `/api/ai/tags` | `accessToken` cookie + rate-limited | Generate relevant tags from content |
| `POST` | `/api/ai/seo` | `accessToken` cookie + rate-limited | Generate SEO metadata (meta title, description, keywords) |
| `POST` | `/api/ai/improve` | `accessToken` cookie + rate-limited | Improve writing quality |
| `POST` | `/api/ai/rewrite` | `accessToken` cookie + rate-limited | Rewrite content in a different tone |
| `POST` | `/api/ai/expand` | `accessToken` cookie + rate-limited | Expand/section-break content |
| `POST` | `/api/ai/shorten` | `accessToken` cookie + rate-limited | Shorten/condense content |
| `POST` | `/api/ai/continue` | `accessToken` cookie + rate-limited | Continue writing from where content ends |
| `POST` | `/api/ai/summarize` | `accessToken` cookie + rate-limited | Generate a summary of provided content |
| `POST` | `/api/ai/faq` | `accessToken` cookie + rate-limited | Generate FAQ entries from content |
| `POST` | `/api/ai/social` | `accessToken` cookie + rate-limited | Generate social-media posts from content |
| `POST` | `/api/ai/suggestions` | `accessToken` cookie + rate-limited | Generate topic/content suggestions |
| `POST` | `/api/ai/suggestions/apply` | `accessToken` cookie + rate-limited | Apply AI suggestions directly to content |

All AI endpoints are rate-limited to **10 requests per minute** per user. Token usage (`model`, `promptTokens`, `completionTokens`, `totalTokens`, `responseTime`, `finishReason`) is returned with every response. Every request is logged to the `AIGeneration` table for audit and analytics.

### Notifications (`/api/notifications`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | `accessToken` cookie | List notifications (paginated, filterable by type/read) |
| `GET` | `/api/notifications/unread-count` | `accessToken` cookie | Get unread notification count |
| `PATCH` | `/api/notifications/:id/read` | `accessToken` cookie | Mark a single notification as read (recipient only) |
| `PATCH` | `/api/notifications/read-all` | `accessToken` cookie | Mark all notifications as read |
| `DELETE` | `/api/notifications/:id` | `accessToken` cookie | Delete a single notification (recipient only) |
| `DELETE` | `/api/notifications/read` | `accessToken` cookie | Delete all read notifications |
| `POST` | `/api/notifications/broadcast` | `accessToken` + `ADMIN` role | Send system notification to all or specific users |

### Follow (`/api/users`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users/:userId/follow` | `accessToken` cookie | Follow a user |
| `DELETE` | `/api/users/:userId/follow` | `accessToken` cookie | Unfollow a user |
| `GET` | `/api/users/:userId/followers` | Optional | List followers of a user (paginated) |
| `GET` | `/api/users/:userId/following` | Optional | List who a user is following (paginated) |

### Search (`/api/search`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/search` | Optional | Global search across posts, users, and tags |
| `GET` | `/api/search/suggestions` | None | Autocomplete suggestions (posts, users, tags) |
| `GET` | `/api/search/trending` | None | Trending search keywords |
| `GET` | `/api/search/history` | `accessToken` cookie | User's recent search history |
| `DELETE` | `/api/search/history` | `accessToken` cookie | Clear user's search history |
| `GET` | `/api/search/popular-tags` | None | Popular tags by post count |
| `GET` | `/api/search/authors` | None | Discover authors (paginated, sorted by followers) |

All search endpoints are rate-limited to **30 requests per minute** per IP.

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "A human-readable error message"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Unauthorized — session token missing or invalid |
| `403` | Forbidden — insufficient permissions |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Authentication Notes

- All protected endpoints use **HttpOnly cookies** (`accessToken`, `refreshToken`)
- Send requests with `credentials: 'include'` (fetch) or enable "Send cookies" in Postman/Insomnia
- Write endpoints (`POST`, `PUT`, `DELETE`) require **verified email** (`isEmailVerified: true`)
- `optionalAuth` middleware: attaches user if valid token present, continues anonymously otherwise