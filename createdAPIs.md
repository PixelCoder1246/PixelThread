# PixelThread API Reference

This file documents all API endpoints created in the project. You can copy the URLs, request bodies, and headers to set up your Postman collections.

## Base URL
*   **Local Development**: `http://localhost:5000`

> **Authentication**: All protected endpoints use `HttpOnly` cookies (`accessToken`). Send requests with `credentials: 'include'` in the client, or enable "Send cookies" in Postman/Insomnia.

---

## Auth Endpoints — `/api/auth`

### 1. API Health Check
*   **Method**: `GET`
*   **Endpoint**: `/`
*   **Response (200 OK)**:
    ```json
    { "success": true, "message": "PixelThread API is running!" }
    ```

---

### 2. Register User
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/register`
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Registration successful. Please verify your email.",
      "data": {
        "user": {
          "id": "cl...",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "role": "USER",
          "image": null,
          "isEmailVerified": false
        }
      }
    }
    ```

---

### 3. Verify Email
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/verify-email`
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "token": "your_email_verification_token_here" }
    ```
*   **Response (200 OK)**:
    ```json
    { "success": true, "message": "Email verified successfully. You can now log in." }
    ```

---

### 4. Resend Email Verification
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/resend-verification`
*   **Body**: `{ "email": "john.doe@example.com" }`
*   **Response (200 OK)**:
    ```json
    { "success": true, "message": "If your account exists and is unverified, a new verification email has been sent." }
    ```

---

### 5. Login
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/login`
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "email": "john.doe@example.com", "password": "securepassword123" }
    ```
*   **Cookies Set**:
    *   `accessToken` — JWT, 15 min, HttpOnly, Secure, SameSite=Strict
    *   `refreshToken` — JWT, 30 days, HttpOnly, Secure, SameSite=Strict
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Login successful.",
      "data": { "user": { "id": "cl...", "name": "John Doe", "email": "john.doe@example.com", "role": "USER", "isEmailVerified": true } }
    }
    ```
*   **Error — Unverified (403)**:
    ```json
    { "success": false, "message": "Please verify your email before logging in." }
    ```

---

### 6. Logout
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/logout`
*   **Auth**: `accessToken` cookie
*   **Response (200 OK)**:
    ```json
    { "success": true, "message": "Logged out successfully." }
    ```

---

### 7. Refresh Token (Explicit)
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/refresh`
*   **Auth**: `refreshToken` cookie
*   **Cookies Set**: New rotated `accessToken` + `refreshToken`
*   **Response (200 OK)**:
    ```json
    { "success": true, "message": "Token refreshed." }
    ```
> **Note**: You typically never need to call this endpoint manually. The `protect` middleware on all protected routes now performs **silent token refresh** automatically when the access token is expired — using the refresh token cookie with full session rotation. The request proceeds seamlessly with a new `accessToken` set on the response cookies.

---

### 8. Get Current User
*   **Method**: `GET`
*   **Endpoint**: `/api/auth/me`
*   **Auth**: `accessToken` cookie (unverified users allowed)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Current user fetched.",
      "data": { "user": { "id": "cl...", "name": "John Doe", "email": "...", "role": "USER", "isEmailVerified": true } }
    }
    ```

---

### 9. Forgot Password
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/forgot-password`
*   **Body**: `{ "email": "john.doe@example.com" }`
*   **Response (200 OK)**:
    ```json
    { "success": true, "message": "If an account with that email exists, a password reset link has been sent." }
    ```

---

### 10. Reset Password
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/reset-password`
*   **Body**:
    ```json
    { "token": "your_password_reset_token_here", "newPassword": "newsecurepassword123" }
    ```
*   **Response (200 OK)**:
    ```json
    { "success": true, "message": "Password reset successfully. Please log in with your new password." }
    ```

---

## Post Endpoints — `/api/posts`

> **Write endpoints** (`POST`, `PUT`, `DELETE`) require:
> 1. Valid `accessToken` cookie (authenticated)
> 2. `isEmailVerified: true` (email verified)
>
> **Read endpoints** (`GET`) are fully public — no auth required.

---

### 11. Get All Posts (Public Feed)
*   **Method**: `GET`
*   **Endpoint**: `/api/posts`
*   **Auth**: None required
*   **Query Params**: `?page=1&limit=10` (page ≥ 1, limit 1–100, default: page=1, limit=10)
*   **Description**: Returns paginated list of `PUBLISHED` + `PUBLIC` posts with author info, tags, and analytics summary.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Posts fetched successfully.",
      "data": {
        "posts": [
          {
            "id": "clxxx...",
            "title": "My First Post",
            "slug": "my-first-post",
            "content": "Post content here...",
            "excerpt": "Short summary",
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
            "authorId": "cl...",
            "createdAt": "2026-06-22T06:00:00.000Z",
            "updatedAt": "2026-06-22T06:00:00.000Z",
            "publishedAt": null,
            "author": { "id": "cl...", "name": "John Doe", "email": "john@example.com", "image": null },
            "tags": [{ "id": "cl...", "name": "react" }, { "id": "cl...", "name": "nodejs" }],
            "analytics": { "views": 0, "likes": 0 }
          }
        ],
        "pagination": {
          "total": 1,
          "page": 1,
          "limit": 10,
          "totalPages": 1,
          "hasNextPage": false,
          "hasPrevPage": false
        }
      }
    }
    ```

---

### 12. Get Single Post by Slug
*   **Method**: `GET`
*   **Endpoint**: `/api/posts/:slug`
*   **Auth**: None required
*   **Params**: `slug` — URL-safe slug string (e.g. `my-first-post`)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Post fetched successfully.",
      "data": {
        "post": {
          "id": "clxxx...",
          "title": "My First Post",
          "slug": "my-first-post",
          "content": "Full post content...",
          "excerpt": "Short summary",
          "status": "PUBLISHED",
          "visibility": "PUBLIC",
          "authorId": "cl...",
          "author": { "id": "cl...", "name": "John Doe", "email": "john@example.com", "image": null },
          "tags": [{ "id": "cl...", "name": "react" }],
          "analytics": { "views": 0, "likes": 0 },
          "createdAt": "2026-06-22T06:00:00.000Z",
          "updatedAt": "2026-06-22T06:00:00.000Z"
        }
      }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

---

### 13. Create Post
*   **Method**: `POST`
*   **Endpoint**: `/api/posts`
*   **Auth**: `accessToken` cookie + email verified
*   **Headers**: `Content-Type: multipart/form-data`
*   **Body** (Form Data):
    *   `title` (text): `"My First React Post"`
    *   `content` (text, JSON stringified): `"[{\"type\":\"text\",\"value\":\"Here is a picture:\"},{\"type\":\"image\",\"fileIndex\":0}]"`
    *   `excerpt` (text): `"A short summary of the post."`
    *   `status` (text): `"DRAFT"`
    *   `visibility` (text): `"PUBLIC"`
    *   `tags` (text, JSON stringified): `"[\"react\", \"nodejs\"]"`
    *   `files` (file): Attach `picture.jpg`

*   **Validation Rules**:
    | Field | Rule |
    |---|---|
    | `title` | Required, string, 3–200 characters |
    | `content` | Required, JSON stringified array of blocks. Example: `[{"type": "text", "value": "..."}]` |
    | `excerpt` | Optional, string |
    | `status` | Optional — `DRAFT` or `PUBLISHED` only. `ARCHIVED` is **not** allowed on creation. Default: `DRAFT` |
    | `visibility` | Optional — `PUBLIC` or `PRIVATE`. Default: `PUBLIC` |
    | `tags` | Optional, JSON stringified array of strings. Missing tags are created automatically. |
    | `files` | Optional, up to 10 files allowed. Reference via `fileIndex` in `content` blocks. |

*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Post created successfully.",
      "data": {
        "post": {
          "id": "clxxx...",
          "title": "My First React Post",
          "slug": "my-first-react-post",
          "content": [
            { "type": "text", "value": "Here is a picture:" },
            { "type": "image", "url": "http://localhost:5000/uploads/picture.jpg" }
          ],
          "excerpt": "A short summary of the post.",
          "status": "DRAFT",
          "visibility": "PUBLIC",
          "authorId": "cl...",
          "author": { "id": "cl...", "name": "John Doe", "email": "john@example.com", "image": null },
          "tags": [{ "id": "cl...", "name": "react" }, { "id": "cl...", "name": "nodejs" }],
          "analytics": { "views": 0, "likes": 0 },
          "createdAt": "2026-06-22T06:00:00.000Z",
          "updatedAt": "2026-06-22T06:00:00.000Z"
        }
      }
    }
    ```
*   **Error — Validation (400)**:
    ```json
    { "success": false, "message": "Title must be between 3 and 200 characters." }
    ```
*   **Error — Unverified (403)**:
    ```json
    { "success": false, "message": "Please verify your email before accessing this feature." }
    ```

---

### 14. Update Post
*   **Method**: `PUT`
*   **Endpoint**: `/api/posts/:id`
*   **Auth**: `accessToken` cookie + email verified. Only the **post owner** or an **ADMIN** may update.
*   **Params**: `id` — post CUID
*   **Headers**: `Content-Type: multipart/form-data`
*   **Body** (Form Data, all fields optional):
    *   `title` (text): `"Updated Post Title"`
    *   `content` (text, JSON stringified): `"[{\"type\":\"text\",\"value\":\"Updated content blocks\"}]"`
    *   `excerpt` (text): `"Updated summary"`
    *   `status` (text): `"PUBLISHED"`
    *   `visibility` (text): `"PRIVATE"`
    *   `tags` (text, JSON stringified): `"[\"typescript\", \"express\"]"`
    *   `files` (file): Attach files if new `fileIndex` is used in content.

*   **Validation Rules**:
    | Field | Rule |
    |---|---|
    | `title` | Optional, string, 3–200 characters. If changed, slug is auto-regenerated. |
    | `content` | Optional, JSON stringified array of blocks. |
    | `excerpt` | Optional, string or null |
    | `status` | Optional — `DRAFT`, `PUBLISHED`, or `ARCHIVED` (all three allowed on update) |
    | `visibility` | Optional — `PUBLIC` or `PRIVATE` |
    | `tags` | Optional, JSON stringified array. Replaces ALL existing tags. |
    | `files` | Optional, up to 10 files allowed. Reference via `fileIndex` in `content` blocks. |

*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Post updated successfully.",
      "data": { "post": { "id": "...", "title": "Updated Post Title", "slug": "updated-post-title", "..." : "..." } }
    }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You do not have permission to update this post." }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

---

### 15. Delete Post
*   **Method**: `DELETE`
*   **Endpoint**: `/api/posts/:id`
*   **Auth**: `accessToken` cookie + email verified. Only the **post owner** or an **ADMIN** may delete.
*   **Params**: `id` — post CUID
*   **Response (200 OK)**:
    ```json
    { "success": true, "message": "Post deleted successfully." }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You do not have permission to delete this post." }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```
> **Note**: All uploaded image files referenced in the post content (`/uploads/<filename>`) are automatically deleted from disk when the post is removed.

---

## SEO Endpoints — `/api/posts`

> **Read endpoint** (`GET`) is fully public — no auth required.
>
> **Write endpoint** (`PATCH`) requires `accessToken` cookie + ownership or `ADMIN` role.
>
> SEO score (0–100) is automatically calculated based on title length, meta title/description length, keywords, canonical URL, excerpt, and focus keyword presence. Suggestions are generated dynamically for any missing or underperforming fields.

---

### 16. Get SEO Metadata

*   **Method**: `GET`
*   **Endpoint**: `/api/posts/:id/seo`
*   **Auth**: None required
*   **Params**: `id` — post CUID
*   **Description**: Returns the post's SEO metadata, computed SEO score (0–100), and actionable improvement suggestions. If no `SeoMeta` record exists, one is created automatically with default values.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "SEO metadata fetched successfully.",
      "data": {
        "metaTitle": "Understanding React Hooks | PixelThread",
        "metaDescription": "A comprehensive guide to React Hooks including useState, useEffect, and custom hooks. Learn how to build better components.",
        "keywords": ["react", "hooks", "javascript", "frontend", "web development"],
        "canonicalUrl": "https://pixelthread.example.com/understanding-react-hooks",
        "score": 85,
        "suggestions": [
          "Meta title is too long (aim for 50–60 characters).",
          "Focus keyword is missing from the meta description."
        ]
      }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

---

### 17. Update SEO Metadata

*   **Method**: `PATCH`
*   **Endpoint**: `/api/posts/:id/seo`
*   **Auth**: `accessToken` cookie. Only the **post owner** or an **ADMIN** may update.
*   **Params**: `id` — post CUID
*   **Headers**: `Content-Type: application/json`
*   **Description**: Updates one or more SEO fields. The SEO score is automatically recalculated after every update.

*   **Body**:
    ```json
    {
      "metaTitle": "Understanding React Hooks | PixelThread",
      "metaDescription": "A comprehensive guide to React Hooks including useState, useEffect, and custom hooks.",
      "keywords": ["react", "hooks", "javascript"],
      "canonicalUrl": "https://pixelthread.example.com/understanding-react-hooks"
    }
    ```

*   **Validation Rules**:
    | Field | Rule |
    |---|---|
    | `metaTitle` | Optional, string, 1–200 characters (trimmed) |
    | `metaDescription` | Optional, string, 1–350 characters (trimmed) |
    | `keywords` | Optional, array of strings. 1–50 entries, each 1–100 characters. Trimmed, deduplicated, lowercased. |
    | `canonicalUrl` | Optional, valid HTTP(S) URL, max 500 characters |

*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "SEO metadata updated successfully.",
      "data": {
        "metaTitle": "Understanding React Hooks | PixelThread",
        "metaDescription": "A comprehensive guide to React Hooks including useState, useEffect, and custom hooks.",
        "keywords": ["react", "hooks", "javascript"],
        "canonicalUrl": "https://pixelthread.example.com/understanding-react-hooks",
        "score": 90,
        "suggestions": [
          "Add at least three keywords for better SEO."
        ]
      }
    }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You do not have permission to update SEO for this post." }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

> **Note**: Keywords are stored lowercase and deduplicated. Duplicate entries in the request are silently collapsed. The `score` is recalculated using a weighted algorithm (title length, meta title, meta description, keywords, canonical URL, excerpt, focus keyword presence in title/meta/content). `suggestions` provides human-readable improvement tips.

---

## User Endpoints — `/api/users`

---

### 18. Get Posts by User
*   **Method**: `GET`
*   **Endpoint**: `/api/users/:id/posts`
*   **Auth**: Optional — uses `optionalAuth` middleware
    *   **Authenticated as the target user**: Includes `DRAFT` + `PRIVATE` posts
    *   **Not authenticated / other user**: Only `PUBLISHED` + `PUBLIC` posts
*   **Params**: `id` — user CUID
*   **Query Params**:
    *   `page` (optional, default: `1`, min: `1`)
    *   `limit` (optional, default: `10`, range: `1`–`100`)
    *   `sort` (optional, default: `newest`, options: `newest`, `oldest`)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User posts fetched successfully.",
      "data": {
        "posts": [
          {
            "id": "clxxx...",
            "title": "My First Post",
            "slug": "my-first-post",
            "content": "Post content here...",
            "excerpt": "Short summary",
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
            "authorId": "cl...",
            "createdAt": "2026-06-22T06:00:00.000Z",
            "updatedAt": "2026-06-22T06:00:00.000Z",
            "publishedAt": null,
            "author": { "id": "cl...", "name": "John Doe", "image": null },
            "tags": [{ "id": "cl...", "name": "react" }, { "id": "cl...", "name": "nodejs" }],
            "analytics": { "views": 0, "likes": 0 }
          }
        ],
        "pagination": {
          "totalItems": 1,
          "totalPages": 1,
          "currentPage": 1,
          "hasNextPage": false,
          "hasPreviousPage": false
        }
      }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "User not found." }
    ```

---

## Post Search Endpoint — `/api/posts/search`

---

### 19. Search Posts
*   **Method**: `GET`
*   **Endpoint**: `/api/posts/search`
*   **Auth**: None required
*   **Query Params**:
    *   `q` (required) — case-insensitive search across `title`, `excerpt`, `content` (JSON), tag names, and author name
    *   `tag` (optional) — filter by exact tag name (case-insensitive)
    *   `authorId` (optional) — filter by author CUID
    *   `page` (optional, default: `1`, min: `1`)
    *   `limit` (optional, default: `10`, range: `1`–`100`)
    *   `sort` (optional, default: `relevance`, options: `relevance`, `newest`, `oldest`, `mostViewed`, `mostLiked`)
*   **Sort Modes**:
    | Mode | Behaviour |
    |---|---|
    | `relevance` | Title matches ranked first (score 3), then excerpt matches (score 2), then newest as tiebreaker |
    | `newest` | `createdAt` descending |
    | `oldest` | `createdAt` ascending |
    | `mostViewed` | `analytics.views` descending |
    | `mostLiked` | `analytics.likes` descending |
*   **Description**: Searches only `PUBLISHED` + `PUBLIC` posts. Returns matching posts with full metadata.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Posts searched successfully.",
      "data": {
        "posts": [
          {
            "id": "clxxx...",
            "title": "My First Post",
            "slug": "my-first-post",
            "content": "Post content here...",
            "excerpt": "Short summary",
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
            "authorId": "cl...",
            "createdAt": "2026-06-22T06:00:00.000Z",
            "updatedAt": "2026-06-22T06:00:00.000Z",
            "publishedAt": null,
            "author": { "id": "cl...", "name": "John Doe", "image": null },
            "tags": [{ "id": "cl...", "name": "react" }, { "id": "cl...", "name": "nodejs" }],
            "analytics": { "views": 0, "likes": 0 }
          }
        ],
        "pagination": {
          "totalItems": 1,
          "totalPages": 1,
          "currentPage": 1,
          "hasNextPage": false,
          "hasPreviousPage": false
        }
      }
    }
    ```
*   **Error — Validation (400)**:
    ```json
    { "success": false, "message": "Search query (q) is required." }
    ```

---

## Analytics Endpoints

---

### 20. Record a View

*   **Method**: `POST`
*   **Endpoint**: `/api/posts/:id/view`
*   **Auth**: None required
*   **Params**: `id` — post CUID
*   **Description**: Verifies the post exists, atomically upserts and increments the view count.
*   **Response (200 OK)**:
    ```json
    { "success": true, "message": "View recorded" }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

---

### 21. Get Analytics for a Post

*   **Method**: `GET`
*   **Endpoint**: `/api/posts/:id/analytics`
*   **Auth**: None required
*   **Params**: `id` — post CUID
*   **Description**: Returns view count (from PostAnalytics), like count (from Like table), and comment count (from Comment table).
*   **Response (200 OK)**:
    ```json
    {
      "views": 245,
      "likes": 31,
      "comments": 12
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

---

### 22. Get My Overall Analytics

*   **Method**: `GET`
*   **Endpoint**: `/api/me/analytics`
*   **Auth**: Required (access token cookie)
*   **Description**: Aggregated statistics across all posts authored by the authenticated user.
*   **Response (200 OK)**:
    ```json
    {
      "totalPosts": 18,
      "publishedPosts": 15,
      "draftPosts": 2,
      "archivedPosts": 1,
      "totalViews": 12430,
      "totalLikes": 652,
      "totalComments": 183,
      "averageViewsPerPost": 690,
      "averageLikesPerPost": 36
    }
    ```

---

### 23. Get Analytics for All My Posts

*   **Method**: `GET`
*   **Endpoint**: `/api/me/posts/analytics`
*   **Auth**: Required (access token cookie)
*   **Query Params**:
    *   `page` (optional, default: `1`, min: `1`)
    *   `limit` (optional, default: `10`, range: `1`–`100`)
    *   `sort` (optional, default: `newest`, options: `newest`, `oldest`, `mostViewed`, `mostLiked`)
*   **Description**: Paginated list of the authenticated user's posts with view, like, and comment counts.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "My posts analytics fetched successfully.",
      "data": {
        "posts": [
          {
            "id": "clxxx...",
            "title": "My First Post",
            "slug": "my-first-post",
            "status": "PUBLISHED",
            "publishedAt": "2026-06-22T06:00:00.000Z",
            "views": 245,
            "likes": 31,
            "comments": 12
          }
        ],
        "pagination": {
          "totalItems": 1,
          "totalPages": 1,
          "currentPage": 1,
          "hasNextPage": false,
          "hasPreviousPage": false
        }
      }
    }
    ```

---

### 24. Top Performing Posts

*   **Method**: `GET`
*   **Endpoint**: `/api/me/posts/top`
*   **Auth**: Required (access token cookie)
*   **Query Params**:
    *   `limit` (optional, default: `5`, range: `1`–`50`)
    *   `sort` (optional, default: `views`, options: `views`, `likes`)
*   **Description**: Returns the authenticated user's highest-performing posts.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Top posts fetched successfully.",
      "data": [
        {
          "id": "clxxx...",
          "title": "Understanding React",
          "slug": "understanding-react",
          "views": 2410,
          "likes": 201,
          "comments": 42
        }
      ]
    }
    ```

---

### 25. Admin Platform Analytics

*   **Method**: `GET`
*   **Endpoint**: `/api/admin/analytics`
*   **Auth**: Required (access token cookie) + `ADMIN` role
*   **Description**: Returns platform-wide statistics. Restricted to administrators.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Admin analytics fetched successfully.",
      "data": {
        "totalUsers": 42,
        "totalPosts": 120,
        "publishedPosts": 100,
        "draftPosts": 15,
        "archivedPosts": 5,
        "totalComments": 530,
        "totalLikes": 1250,
        "totalViews": 45000
      }
    }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You do not have permission to perform this action." }
    ```

---

---

## Likes Endpoints — `/api`

---

### 26. Toggle Post Like

*   **Method**: `POST`
*   **Endpoint**: `/api/posts/:id/like`
*   **Auth**: `accessToken` cookie (email verified required)
*   **Params**: `id` — post CUID
*   **Description**: Toggles the like on a post. If the user hasn't liked it, adds a like. If already liked, removes it.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Post liked successfully.",
      "data": { "liked": true, "likeCount": 42 }
    }
    ```
*   **Response (200 OK) — Unliked**:
    ```json
    {
      "success": true,
      "message": "Post unliked successfully.",
      "data": { "liked": false, "likeCount": 41 }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

---

### 27. Toggle Comment Like

*   **Method**: `POST`
*   **Endpoint**: `/api/comments/:id/like`
*   **Auth**: `accessToken` cookie (email verified required)
*   **Params**: `id` — comment CUID
*   **Description**: Toggles the like on a comment. If the user hasn't liked it, adds a like. If already liked, removes it.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Comment liked successfully.",
      "data": { "liked": true, "likeCount": 15 }
    }
    ```
*   **Response (200 OK) — Unliked**:
    ```json
    {
      "success": true,
      "message": "Comment unliked successfully.",
      "data": { "liked": false, "likeCount": 14 }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Comment not found." }
    ```

---

### 28. Get Post Likes

*   **Method**: `GET`
*   **Endpoint**: `/api/posts/:id/likes`
*   **Auth**: Optional (public read)
*   **Params**: `id` — post CUID
*   **Description**: Returns a list of users who liked the post.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Post likes fetched successfully.",
      "data": {
        "likes": [
          { "id": "clx...", "userId": "clx...", "user": { "id": "clx...", "name": "John Doe", "image": null }, "createdAt": "2026-07-01T10:00:00.000Z" }
        ]
      }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

---

### 29. Get Comment Likes

*   **Method**: `GET`
*   **Endpoint**: `/api/comments/:id/likes`
*   **Auth**: Optional (public read)
*   **Params**: `id` — comment CUID
*   **Description**: Returns a list of users who liked the comment.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Comment likes fetched successfully.",
      "data": {
        "likes": [
          { "id": "clx...", "userId": "clx...", "user": { "id": "clx...", "name": "Jane Smith", "image": null }, "createdAt": "2026-07-01T11:00:00.000Z" }
        ]
      }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Comment not found." }
    ```

---

### 30. Get Post Like Status

*   **Method**: `GET`
*   **Endpoint**: `/api/posts/:id/like-status`
*   **Auth**: `accessToken` cookie
*   **Params**: `id` — post CUID
*   **Description**: Returns whether the authenticated user has liked the post.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Like status fetched successfully.",
      "data": { "isLiked": true }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

---

### 31. Get Comment Like Status

*   **Method**: `GET`
*   **Endpoint**: `/api/comments/:id/like-status`
*   **Auth**: `accessToken` cookie
*   **Params**: `id` — comment CUID
*   **Description**: Returns whether the authenticated user has liked the comment.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Like status fetched successfully.",
      "data": { "isLiked": false }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Comment not found." }
    ```

---

---

## Comments Endpoints — `/api/posts/:postId/comments` and `/api/comments/:id`

> **Reading comments**: Public (optional auth for `isLiked` field — authenticated users see which comments they've liked).
>
> **Creating / replying**: Requires `accessToken` cookie + email verified.
>
> **Updating / deleting**: Owner of the comment or `ADMIN` role only.
>
> **Threading**: Supports unlimited nested replies. The tree is built in-memory from a single database query — no N+1 or recursive DB calls.

---

### 32. Get Threaded Comments (Root + All Nested Replies)

*   **Method**: `GET`
*   **Endpoint**: `/api/posts/:postId/comments`
*   **Auth**: Optional (public read). If authenticated via `accessToken` cookie, the `isLiked` field reflects the user's likes.
*   **Params**: `postId` — post CUID
*   **Description**: Returns only root comments (`parentId = null`) with all descendant replies nested recursively. Replies are ordered oldest-first at every depth level. Builds the entire tree in memory from a single query for efficiency.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Comments fetched successfully.",
      "data": {
        "comments": [
          {
            "id": "clx...",
            "content": "Amazing article!",
            "createdAt": "2026-07-01T10:00:00.000Z",
            "updatedAt": "2026-07-01T10:00:00.000Z",
            "author": {
              "id": "clx...",
              "name": "John Doe",
              "image": null
            },
            "likeCount": 5,
            "isLiked": false,
            "replies": [
              {
                "id": "clx...",
                "content": "I completely agree!",
                "createdAt": "2026-07-01T11:00:00.000Z",
                "updatedAt": "2026-07-01T11:00:00.000Z",
                "author": {
                  "id": "clx...",
                  "name": "Jane Smith",
                  "image": null
                },
                "likeCount": 2,
                "isLiked": true,
                "replies": [
                  {
                    "id": "clx...",
                    "content": "Well explained indeed.",
                    "createdAt": "2026-07-01T12:00:00.000Z",
                    "updatedAt": "2026-07-01T12:00:00.000Z",
                    "author": {
                      "id": "clx...",
                      "name": "Bob Wilson",
                      "image": null
                    },
                    "likeCount": 0,
                    "isLiked": false,
                    "replies": []
                  }
                ]
              }
            ]
          }
        ]
      }
    }
    ```
*   **Error — Post Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

> **Performance**: All comments for the post are fetched in a single `findMany` query with author info, like counts, and per-user like status. The nested tree is constructed in-memory using the `parentId` relationship — no recursive database calls regardless of nesting depth.

---

### 33. Create Root Comment

*   **Method**: `POST`
*   **Endpoint**: `/api/posts/:postId/comments`
*   **Auth**: `accessToken` cookie + email verified
*   **Headers**: `Content-Type: application/json`
*   **Params**: `postId` — post CUID
*   **Body**:
    ```json
    {
      "content": "Great article! This was really helpful."
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Comment created successfully.",
      "data": {
        "comment": {
          "id": "clx...",
          "content": "Great article! This was really helpful.",
          "createdAt": "2026-07-01T10:00:00.000Z",
          "updatedAt": "2026-07-01T10:00:00.000Z",
          "author": {
            "id": "clx...",
            "name": "John Doe",
            "image": null
          },
          "likeCount": 0,
          "isLiked": false,
          "replies": []
        }
      }
    }
    ```
*   **Error — Post Not Found (404)**:
    ```json
    { "success": false, "message": "Post not found." }
    ```

---

### 34. Reply to Any Comment (Unlimited Depth)

*   **Method**: `POST`
*   **Endpoint**: `/api/comments/:id/replies`
*   **Auth**: `accessToken` cookie + email verified
*   **Headers**: `Content-Type: application/json`
*   **Params**: `id` — parent comment CUID (can be any comment at any depth level)
*   **Body**:
    ```json
    {
      "content": "I completely agree with your point."
    }
    ```
*   **Description**: Creates a reply to any existing comment. The parent's `postId` is copied automatically. Supports unlimited nesting — you can reply to Level 1, Level 50, or Level 500 equally.
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Reply created successfully.",
      "data": {
        "comment": {
          "id": "clx...",
          "content": "I completely agree with your point.",
          "createdAt": "2026-07-01T12:00:00.000Z",
          "updatedAt": "2026-07-01T12:00:00.000Z",
          "author": {
            "id": "clx...",
            "name": "Jane Smith",
            "image": null
          },
          "likeCount": 0,
          "isLiked": false,
          "replies": []
        }
      }
    }
    ```
*   **Error — Parent Not Found (404)**:
    ```json
    { "success": false, "message": "Comment not found." }
    ```

---

### 35. Get Full Reply Subtree

*   **Method**: `GET`
*   **Endpoint**: `/api/comments/:id/replies`
*   **Auth**: Optional (public read). If authenticated, `isLiked` reflects the user's likes.
*   **Params**: `id` — comment CUID to start the subtree from
*   **Description**: Returns the specified comment with all of its descendant replies nested recursively. Fetches all post comments in a single query and builds the subtree in memory.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Replies fetched successfully.",
      "data": {
        "comment": {
          "id": "clx...",
          "content": "I completely agree!",
          "createdAt": "2026-07-01T11:00:00.000Z",
          "updatedAt": "2026-07-01T11:00:00.000Z",
          "author": {
            "id": "clx...",
            "name": "Jane Smith",
            "image": null
          },
          "likeCount": 2,
          "isLiked": false,
          "replies": [
            {
              "id": "clx...",
              "content": "Well explained indeed.",
              "createdAt": "2026-07-01T12:00:00.000Z",
              "updatedAt": "2026-07-01T12:00:00.000Z",
              "author": {
                "id": "clx...",
                "name": "Bob Wilson",
                "image": null
              },
              "likeCount": 0,
              "isLiked": false,
              "replies": [
                {
                  "id": "clx...",
                  "content": "Absolutely!",
                  "createdAt": "2026-07-01T13:00:00.000Z",
                  "updatedAt": "2026-07-01T13:00:00.000Z",
                  "author": {
                    "id": "clx...",
                    "name": "Alice Brown",
                    "image": null
                  },
                  "likeCount": 1,
                  "isLiked": false,
                  "replies": []
                }
              ]
            }
          ]
        }
      }
    }
    ```
*   **Error — Comment Not Found (404)**:
    ```json
    { "success": false, "message": "Comment not found." }
    ```

---

### 36. Update Comment

*   **Method**: `PATCH`
*   **Endpoint**: `/api/comments/:id`
*   **Auth**: `accessToken` cookie + email verified. Only the **comment owner** or an **ADMIN** may update.
*   **Headers**: `Content-Type: application/json`
*   **Params**: `id` — comment CUID
*   **Body**:
    ```json
    {
      "content": "Updated comment text with corrections."
    }
    ```
*   **Validation Rules**:
    | Field | Rule |
    |---|---|
    | `content` | Required, non-empty string after trimming. Maximum 2000 characters. Whitespace-only values are rejected. |
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Comment updated successfully.",
      "data": {
        "comment": {
          "id": "clx...",
          "content": "Updated comment text with corrections.",
          "createdAt": "2026-07-01T10:00:00.000Z",
          "updatedAt": "2026-07-01T14:00:00.000Z",
          "author": {
            "id": "clx...",
            "name": "John Doe",
            "image": null
          },
          "likeCount": 3,
          "isLiked": false,
          "replies": []
        }
      }
    }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You do not have permission to update this comment." }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Comment not found." }
    ```

---

### 37. Delete Comment (Cascading)

*   **Method**: `DELETE`
*   **Endpoint**: `/api/comments/:id`
*   **Auth**: `accessToken` cookie + email verified. Only the **comment owner** or an **ADMIN** may delete.
*   **Params**: `id` — comment CUID
*   **Description**: Deletes the comment and **all of its descendants** (replies at any depth). Uses a two-step process: (1) discovers all descendant IDs via in-memory traversal of the post's comment graph, (2) removes all likes and comments in a single transaction. No orphaned replies remain.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Comment deleted successfully."
    }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You do not have permission to delete this comment." }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Comment not found." }
    ```

---

## Comment Validation Rules

| Field | Create / Reply | Update |
|---|---|---|
| `content` | Required, trimmed, 1–2000 chars | Required, trimmed, 1–2000 chars |

---

## Tags Endpoints — `/api/tags`

> **Admin-only endpoints** (`POST`, `DELETE`) require:
> 1. Valid `accessToken` cookie (authenticated)
> 2. `ADMIN` role
>
> **Read endpoints** (`GET`) are fully public — no auth required.

---

### 38. Get All Tags

*   **Method**: `GET`
*   **Endpoint**: `/api/tags`
*   **Auth**: None required
*   **Query Params**:
    *   `page` (optional, default: `1`, min: `1`)
    *   `limit` (optional, default: `10`, range: `1`–`100`)
    *   `sort` (optional, default: `alphabetical`, options: `alphabetical`, `mostUsed`)
*   **Description**: Returns paginated list of all tags with the number of posts associated with each tag.
*   **Sort Modes**:
    | Mode | Behaviour |
    |---|---|
    | `alphabetical` | Tag names in ascending alphabetical order (default) |
    | `mostUsed` | Tags with the most posts first |
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Tags fetched successfully.",
      "data": {
        "tags": [
          { "id": "clx...", "name": "javascript", "postCount": 5 },
          { "id": "clx...", "name": "react", "postCount": 3 }
        ],
        "pagination": {
          "total": 2,
          "page": 1,
          "limit": 10,
          "totalPages": 1,
          "hasNextPage": false,
          "hasPrevPage": false
        }
      }
    }
    ```

---

### 39. Get Posts by Tag

*   **Method**: `GET`
*   **Endpoint**: `/api/tags/:name/posts`
*   **Auth**: None required
*   **Params**: `name` — tag name (case-insensitive, e.g. `react` or `React`)
*   **Query Params**:
    *   `page` (optional, default: `1`, min: `1`)
    *   `limit` (optional, default: `10`, range: `1`–`100`)
*   **Description**: Returns only `PUBLIC` + `PUBLISHED` posts associated with the specified tag, with author, tags, and analytics.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Tag posts fetched successfully.",
      "data": {
        "tag": { "id": "clx...", "name": "react" },
        "posts": [
          {
            "id": "clxxx...",
            "title": "My First Post",
            "slug": "my-first-post",
            "content": "Post content here...",
            "excerpt": "Short summary",
            "status": "PUBLISHED",
            "visibility": "PUBLIC",
            "authorId": "cl...",
            "createdAt": "2026-06-22T06:00:00.000Z",
            "updatedAt": "2026-06-22T06:00:00.000Z",
            "publishedAt": null,
            "author": { "id": "cl...", "name": "John Doe", "email": "john@example.com", "image": null },
            "tags": [{ "id": "cl...", "name": "react" }],
            "analytics": { "views": 0, "likes": 0 }
          }
        ],
        "pagination": {
          "total": 1,
          "page": 1,
          "limit": 10,
          "totalPages": 1,
          "hasNextPage": false,
          "hasPrevPage": false
        }
      }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Tag not found." }
    ```

---

### 40. Create Tag

*   **Method**: `POST`
*   **Endpoint**: `/api/tags`
*   **Auth**: `accessToken` cookie + `ADMIN` role
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "name": "React"
    }
    ```
*   **Description**: Creates a new tag. Name is trimmed of whitespace and stored in lowercase. Duplicate names are rejected.
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Tag created successfully.",
      "data": {
        "tag": { "id": "clx...", "name": "react" }
      }
    }
    ```
*   **Error — Duplicate (409)**:
    ```json
    { "success": false, "message": "Tag already exists." }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You do not have permission to perform this action." }
    ```

---

### 41. Delete Tag

*   **Method**: `DELETE`
*   **Endpoint**: `/api/tags/:id`
*   **Auth**: `accessToken` cookie + `ADMIN` role
*   **Params**: `id` — tag CUID
*   **Description**: Deletes a tag. Cannot delete a tag that is currently attached to any posts.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Tag deleted successfully."
    }
    ```
*   **Error — Attached to Posts (400)**:
    ```json
    { "success": false, "message": "Cannot delete tag that is attached to posts." }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Tag not found." }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You do not have permission to perform this action." }
    ```

---

---

## AI Endpoints — `/api/ai`

> **All AI endpoints require**:
> 1. Valid `accessToken` cookie (authenticated)
> 2. Rate-limited to **10 requests per minute** per user
>
> **Token usage** is returned with every response: `model`, `promptTokens`, `completionTokens`, `totalTokens`, `responseTime`, `finishReason`.
>
> **AI Generation Logging**: Every AI request is logged to the `AIGeneration` table (user ID, type, truncated prompt/response) for audit and analytics.

---

### 42. Generate Complete Blog Post

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/generate-post`
*   **Auth**: `accessToken` cookie
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "topic": "Understanding React Server Components",
      "targetAudience": "Intermediate React developers",
      "tone": "technical",
      "category": "technology",
      "keywords": "React, Server Components, RSC, Next.js",
      "approximateLength": "medium"
    }
    ```
*   **Validation Rules**:
    | Field | Rule |
    |---|---|
    | `topic` | Required, max 500 characters |
    | `targetAudience` | Optional |
    | `tone` | Optional — `professional`, `friendly`, `casual`, `technical`, `academic`, `storytelling` |
    | `category` | Optional — `technology`, `lifestyle`, `health`, `business`, `education`, `entertainment`, `science`, `travel`, `food`, `finance`, `sports`, `politics`, `culture`, `other` |
    | `keywords` | Optional |
    | `approximateLength` | Optional — `short`, `medium`, `long`, `comprehensive` |
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Blog post generated successfully.",
      "data": {
        "title": "Understanding React Server Components: A Complete Guide",
        "excerpt": "Learn how React Server Components work, their benefits, and how to implement them in your Next.js applications.",
        "content": "# Understanding React Server Components\n\n...full markdown content...",
        "suggestedTags": ["react", "server-components", "nextjs", "frontend", "javascript"],
        "seoTitle": "Understanding React Server Components: Complete Guide",
        "seoDescription": "Learn how React Server Components work, their benefits, and how to implement them in your Next.js applications.",
        "tokenUsage": {
          "model": "nvidia/nemotron-3-ultra-550b-a55b",
          "promptTokens": 120,
          "completionTokens": 850,
          "totalTokens": 970,
          "responseTime": "3420ms",
          "finishReason": "stop"
        }
      }
    }
    ```
---

### 43. Generate Title Suggestions

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/title`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "content": "Full blog post content (at least 50 characters)...",
      "keywords": "optional, comma-separated keywords"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Titles generated successfully.",
      "data": {
        "titles": ["Title Option 1", "Title Option 2", "Title Option 3"],
        "tokenUsage": {
          "model": "nvidia/nemotron-3-ultra-550b-a55b",
          "promptTokens": 85,
          "completionTokens": 120,
          "totalTokens": 205,
          "responseTime": "1800ms",
          "finishReason": "stop"
        }
      }
    }
    ```

---

### 44. Improve Existing Title

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/title/improve`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "currentTitle": "My Original Title",
      "targetKeyword": "optional focus keyword"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Title improved successfully.",
      "data": {
        "improvedTitle": "Improved: My Original Title - Better SEO",
        "suggestions": ["Alternative: A More Catchy Version", "Another Option"],
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 50, "completionTokens": 80, "totalTokens": 130, "responseTime": "900ms", "finishReason": "stop" }
      }
    }
    ```

---

### 45. Generate Excerpt

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/excerpt`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Full blog post content..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Excerpt generated successfully.",
      "data": {
        "excerpt": "A concise summary of the blog post content...",
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 60, "completionTokens": 40, "totalTokens": 100, "responseTime": "800ms", "finishReason": "stop" }
      }
    }
    ```

---

### 46. Generate Tags

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/tags`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Full blog post content..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Tags generated successfully.",
      "data": {
        "tags": ["react", "javascript", "web-development", "frontend", "tutorial"],
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 55, "completionTokens": 30, "totalTokens": 85, "responseTime": "700ms", "finishReason": "stop" }
      }
    }
    ```

---

### 47. Generate SEO Metadata

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/seo`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "title": "My Blog Post Title",
      "content": "Full blog post content..."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "SEO metadata generated successfully.",
      "data": {
        "metaTitle": "My Blog Post Title | PixelThread",
        "metaDescription": "A compelling meta description for search results...",
        "keywords": ["react", "hooks", "tutorial"],
        "canonicalUrl": "https://pixelthread.example.com/my-blog-post",
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 90, "completionTokens": 110, "totalTokens": 200, "responseTime": "1500ms", "finishReason": "stop" }
      }
    }
    ```

---

### 48. Improve Writing

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/improve`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Content to improve..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Content improved successfully.",
      "data": {
        "improvedContent": "The improved version of the content...",
        "changes": ["Fixed grammar issues", "Improved sentence structure", "Enhanced readability"],
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 70, "completionTokens": 200, "totalTokens": 270, "responseTime": "2200ms", "finishReason": "stop" }
      }
    }
    ```

---

### 49. Rewrite Content (Change Tone)

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/rewrite`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "content": "Content to rewrite...",
      "tone": "professional"
    }
    ```
*   **Validation**: `tone` must be one of: `professional`, `friendly`, `casual`, `technical`, `academic`, `storytelling`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Content rewritten successfully.",
      "data": {
        "rewrittenContent": "The rewritten content in the requested tone...",
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 75, "completionTokens": 250, "totalTokens": 325, "responseTime": "2800ms", "finishReason": "stop" }
      }
    }
    ```

---

### 50. Expand Content

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/expand`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Content to expand..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Content expanded successfully.",
      "data": {
        "expandedContent": "The expanded version of the content with more detail...",
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 65, "completionTokens": 400, "totalTokens": 465, "responseTime": "3500ms", "finishReason": "stop" }
      }
    }
    ```

---

### 51. Shorten Content

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/shorten`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Content to shorten..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Content shortened successfully.",
      "data": {
        "shortenedContent": "The condensed version of the content...",
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 65, "completionTokens": 150, "totalTokens": 215, "responseTime": "1600ms", "finishReason": "stop" }
      }
    }
    ```

---

### 52. Continue Writing

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/continue`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Partial content to continue from..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Content continuation generated successfully.",
      "data": {
        "continuation": "The AI-generated continuation of the content...",
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 60, "completionTokens": 300, "totalTokens": 360, "responseTime": "3000ms", "finishReason": "stop" }
      }
    }
    ```

---

### 53. Summarize Content

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/summarize`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Content to summarize..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Summary generated successfully.",
      "data": {
        "summary": "A concise summary of the content...",
        "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 60, "completionTokens": 100, "totalTokens": 160, "responseTime": "1200ms", "finishReason": "stop" }
      }
    }
    ```

---

### 54. Generate FAQ

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/faq`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Content to generate FAQs from..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "FAQs generated successfully.",
      "data": {
        "faqs": [
          { "question": "What is React?", "answer": "React is a JavaScript library for building user interfaces." },
          { "question": "What are hooks?", "answer": "Hooks are functions that let you use state in functional components." }
        ],
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 65, "completionTokens": 180, "totalTokens": 245, "responseTime": "2000ms", "finishReason": "stop" }
      }
    }
    ```

---

### 55. Generate Social Posts

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/social`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Content to generate social media posts from..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Social posts generated successfully.",
      "data": {
        "twitter": "Tweet-length version of the content...",
        "linkedin": "LinkedIn-optimized post...",
        "facebook": "Facebook-optimized post...",
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 70, "completionTokens": 200, "totalTokens": 270, "responseTime": "2500ms", "finishReason": "stop" }
      }
    }
    ```

---

### 56. Generate Suggestions

*   **Method**: `POST`
*   **Endpoint**: `/api/ai/suggestions`
*   **Auth**: `accessToken` cookie (rate-limited: 10 req/min)
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    { "content": "Content to generate suggestions from..." }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Suggestions generated successfully.",
      "data": {
        "suggestions": [
          "Consider adding a section about...",
          "You might want to expand on...",
          "This topic could benefit from..."
        ],
        "tokenUsage": { "model": "nvidia/nemotron-3-ultra-550b-a55b", "promptTokens": 60, "completionTokens": 150, "totalTokens": 210, "responseTime": "1800ms", "finishReason": "stop" }
      }
    }
    ```

---

## Notifications Endpoints — `/api/notifications`

> **All notification endpoints require**:
> 1. Valid `accessToken` cookie (authenticated)
> 2. Users can only read, delete, or mark their own notifications
>
> **Admin-only**: `POST /api/notifications/broadcast` requires `ADMIN` role.

---

### 57. Get My Notifications

*   **Method**: `GET`
*   **Endpoint**: `/api/notifications`
*   **Auth**: `accessToken` cookie
*   **Query Params**:
    *   `page` (optional, default: `1`, min: `1`)
    *   `limit` (optional, default: `20`, range: `1`–`100`)
    *   `type` (optional) — filter by notification type: `LIKE`, `COMMENT`, `COMMENT_REPLY`, `FOLLOW`, `POST_PUBLISHED`, `POST_FEATURED`, `MENTION`, `SYSTEM`
    *   `read` (optional) — filter by read status: `true` or `false`
*   **Description**: Returns paginated list of notifications for the authenticated user, sorted newest first. Each notification includes the actor info and reference type for frontend navigation.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Notifications fetched successfully.",
      "data": {
        "notifications": [
          {
            "id": "clx...",
            "type": "LIKE",
            "title": "New Like",
            "message": "John Doe liked your post",
            "isRead": false,
            "referenceId": "clx...",
            "referenceType": "POST",
            "createdAt": "2026-07-14T10:00:00.000Z",
            "actor": {
              "id": "clx...",
              "name": "John Doe",
              "image": null
            }
          }
        ],
        "pagination": {
          "totalItems": 1,
          "totalPages": 1,
          "currentPage": 1,
          "hasNextPage": false,
          "hasPreviousPage": false
        }
      }
    }
    ```
*   **Error — Invalid Type (400)**:
    ```json
    { "success": false, "message": "Invalid notification type. Must be one of: LIKE, COMMENT, COMMENT_REPLY, FOLLOW, POST_PUBLISHED, POST_FEATURED, MENTION, SYSTEM" }
    ```

---

### 58. Get Unread Count

*   **Method**: `GET`
*   **Endpoint**: `/api/notifications/unread-count`
*   **Auth**: `accessToken` cookie
*   **Description**: Returns the count of unread notifications for the authenticated user.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Unread count fetched successfully.",
      "data": { "count": 12 }
    }
    ```

---

### 59. Mark Notification as Read

*   **Method**: `PATCH`
*   **Endpoint**: `/api/notifications/:id/read`
*   **Auth**: `accessToken` cookie (recipient only)
*   **Params**: `id` — notification CUID
*   **Description**: Marks a single notification as read. Only the recipient can perform this action.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Notification marked as read.",
      "data": {
        "notification": {
          "id": "clx...",
          "isRead": true,
          "actor": { "id": "clx...", "name": "John Doe", "image": null }
        }
      }
    }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You can only mark your own notifications as read." }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "Notification not found." }
    ```

---

### 60. Mark All Notifications as Read

*   **Method**: `PATCH`
*   **Endpoint**: `/api/notifications/read-all`
*   **Auth**: `accessToken` cookie
*   **Description**: Marks every unread notification for the authenticated user as read.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "All notifications marked as read.",
      "data": { "count": 5 }
    }
    ```

---

### 61. Delete Notification

*   **Method**: `DELETE`
*   **Endpoint**: `/api/notifications/:id`
*   **Auth**: `accessToken` cookie (recipient only)
*   **Params**: `id` — notification CUID
*   **Description**: Deletes a single notification. Only the recipient can perform this action.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Notification deleted successfully."
    }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You can only delete your own notifications." }
    ```

---

### 62. Delete All Read Notifications

*   **Method**: `DELETE`
*   **Endpoint**: `/api/notifications/read`
*   **Auth**: `accessToken` cookie
*   **Description**: Deletes all read notifications for the authenticated user.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Read notifications deleted successfully.",
      "data": { "count": 3 }
    }
    ```

---

### 63. Broadcast System Notification (Admin)

*   **Method**: `POST`
*   **Endpoint**: `/api/notifications/broadcast`
*   **Auth**: `accessToken` cookie + `ADMIN` role
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "title": "Maintenance Scheduled",
      "message": "The platform will be down for maintenance on July 20th from 2-4 AM UTC.",
      "userIds": [] 
    }
    ```
*   **Description**: Sends a system notification. If `userIds` is provided (non-empty array), only those users receive it. If omitted or empty, all users receive it.
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "System notification sent successfully.",
      "data": { "count": 42 }
    }
    ```
*   **Error — Validation (400)**:
    ```json
    { "success": false, "message": "Title and message are required." }
    ```
*   **Error — Forbidden (403)**:
    ```json
    { "success": false, "message": "You do not have permission to perform this action." }
    ```

---

## Follow Endpoints — `/api/users`

> **Follow/unfollow** (`POST`, `DELETE`) require `accessToken` cookie.
>
> **Reading** followers/following (`GET`) is public (optional auth).

---

### 64. Follow User

*   **Method**: `POST`
*   **Endpoint**: `/api/users/:userId/follow`
*   **Auth**: `accessToken` cookie
*   **Params**: `userId` — target user CUID
*   **Description**: Follows the specified user. Automatically creates a `FOLLOW` notification for the followed user. You cannot follow yourself.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User followed successfully.",
      "data": {
        "following": true,
        "followerCount": 150,
        "followingCount": 42
      }
    }
    ```
*   **Error — Self-follow (400)**:
    ```json
    { "success": false, "message": "You cannot follow yourself." }
    ```
*   **Error — Already Following (409)**:
    ```json
    { "success": false, "message": "You are already following this user." }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "User not found." }
    ```

---

### 65. Unfollow User

*   **Method**: `DELETE`
*   **Endpoint**: `/api/users/:userId/follow`
*   **Auth**: `accessToken` cookie
*   **Params**: `userId` — target user CUID
*   **Description**: Unfollows the specified user. You cannot unfollow yourself.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User unfollowed successfully.",
      "data": {
        "following": false,
        "followerCount": 149,
        "followingCount": 42
      }
    }
    ```
*   **Error — Not Following (404)**:
    ```json
    { "success": false, "message": "You are not following this user." }
    ```

---

### 66. Get Followers

*   **Method**: `GET`
*   **Endpoint**: `/api/users/:userId/followers`
*   **Auth**: Optional (public read)
*   **Params**: `userId` — user CUID
*   **Query Params**:
    *   `page` (optional, default: `1`, min: `1`)
    *   `limit` (optional, default: `20`, range: `1`–`100`)
*   **Description**: Returns a paginated list of users who follow the specified user.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Followers fetched successfully.",
      "data": {
        "users": [
          { "id": "clx...", "name": "Jane Smith", "image": null }
        ],
        "pagination": {
          "totalItems": 150,
          "totalPages": 8,
          "currentPage": 1,
          "hasNextPage": true,
          "hasPreviousPage": false
        }
      }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "User not found." }
    ```

---

### 67. Get Following

*   **Method**: `GET`
*   **Endpoint**: `/api/users/:userId/following`
*   **Auth**: Optional (public read)
*   **Params**: `userId` — user CUID
*   **Query Params**:
    *   `page` (optional, default: `1`, min: `1`)
    *   `limit` (optional, default: `20`, range: `1`–`100`)
*   **Description**: Returns a paginated list of users that the specified user follows.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Following fetched successfully.",
      "data": {
        "users": [
          { "id": "clx...", "name": "John Doe", "image": null }
        ],
        "pagination": {
          "totalItems": 42,
          "totalPages": 3,
          "currentPage": 1,
          "hasNextPage": true,
          "hasPreviousPage": false
        }
      }
    }
    ```
*   **Error — Not Found (404)**:
    ```json
    { "success": false, "message": "User not found." }
    ```

---

## Error Responses

| Status | Scenario | Message |
|---|---|---|
| `400` | Missing/invalid field | Field-specific validation message |
| `401` | Missing/expired/invalid token | `"No token available. Please log in."` or `"Session expired. Please log in again."` |
| `403` | Email not verified | `"Please verify your email before accessing this feature."` |
| `403` | Not owner or admin | `"You do not have permission to update/delete this comment."` or `"You do not have permission to update/delete this post."` |
| `404` | Resource not found | `"Post not found."` or `"Comment not found."` or `"User not found."` |
| `409` | Duplicate unique field | `"A record with this <field> already exists."` |
| `500` | Unhandled server error | `"Something went wrong. Please try again later."` (prod) |
