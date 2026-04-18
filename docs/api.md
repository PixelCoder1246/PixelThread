# API Documentation

> **Status**: Base structure initialized (v0.0.0). Routes are placeholders pending feature development.

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
  "message": "Welcome to PixelThread API"
}
```

---

## Planned Endpoints

The following endpoints will be implemented as features are developed. The server directory structure is pre-organized to support these routes:

### Auth
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a session token |
| `POST` | `/api/auth/logout` | Invalidate the current session |

### Users
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/users/:id` | Get a user's public profile |
| `PATCH` | `/api/users/:id` | Update user profile |

### Posts
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts` | List all published blog posts |
| `GET` | `/api/posts/:slug` | Get a single blog post by its slug |
| `POST` | `/api/posts` | Create a new blog post (draft or published) |
| `PATCH` | `/api/posts/:id` | Update an existing post (content, status, tags, etc.) |
| `DELETE` | `/api/posts/:id` | Delete a post |

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
