# API Documentation

> **Status**: Auth, Post, and User modules fully implemented (v0.2.1). See [createdAPIs.md](../createdAPIs.md) for complete Postman-ready API reference with request/response examples.

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
| `GET` | `/api/posts/:slug` | None | Get a post by slug |
| `POST` | `/api/posts` | `accessToken` + verified email | Create a post (multipart, supports images) |
| `PUT` | `/api/posts/:id` | `accessToken` + verified email | Update a post (owner or admin) |
| `DELETE` | `/api/posts/:id` | `accessToken` + verified email | Delete a post (owner or admin) — also removes uploaded images |

### SEO
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts/:id/seo` | Get the SEO metadata + score for a post |
| `PATCH` | `/api/posts/:id/seo` | Update the SEO metadata for a post |

### Tags
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tags` | List all available tags |
| `GET` | `/api/tags/:name/posts` | Get all posts with a given tag |

### Comments
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts/:postId/comments` | Get all comments for a post (nested) |
| `POST` | `/api/posts/:postId/comments` | Add a comment or reply to a post |
| `DELETE` | `/api/comments/:id` | Delete a comment (owner or admin) |

### Likes
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/posts/:id/like` | Toggle like on a blog post |
| `POST` | `/api/comments/:id/like` | Toggle like on a comment |

### AI Assistant
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/ai/generate` | Generate content (blog, title, SEO, rewrite) |

### Tags
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tags` | List all tags |
| `GET` | `/api/tags/:name/posts` | Get posts by tag |

---

## Error Responses

All errors follow this format:
```json
{
  "error": "A human-readable error message"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Unauthorized — session token missing or invalid |
| `403` | Forbidden — insufficient permissions |
| `404` | Resource not found |
| `500` | Internal server error |
