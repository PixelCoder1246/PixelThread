# API Documentation

> **Status**: Auth, Post, User, Analytics, Comment, and Like modules fully implemented (v0.3.0). See [createdAPIs.md](../createdAPIs.md) for complete Postman-ready API reference with request/response examples.

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

### Likes (`/api`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/posts/:id/like` | `accessToken` cookie | Toggle like on a blog post |
| `POST` | `/api/comments/:id/like` | `accessToken` cookie | Toggle like on a comment |
| `GET` | `/api/posts/:id/likes` | Optional | Get list of users who liked a post |
| `GET` | `/api/comments/:id/likes` | Optional | Get list of users who liked a comment |
| `GET` | `/api/posts/:id/like-status` | `accessToken` cookie | Get current user's like status for a post |
| `GET` | `/api/comments/:id/like-status` | `accessToken` cookie | Get current user's like status for a comment |

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