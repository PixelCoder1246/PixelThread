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

## User Endpoints — `/api/users`

---

### 16. Get Posts by User
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

### 17. Search Posts
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

### 18. Record a View

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

### 19. Get Analytics for a Post

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

### 20. Get My Overall Analytics

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

### 21. Get Analytics for All My Posts

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

### 22. Top Performing Posts

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

### 23. Admin Platform Analytics

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

### 24. Toggle Post Like

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

### 25. Toggle Comment Like

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

### 26. Get Post Likes

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

### 27. Get Comment Likes

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

### 28. Get Post Like Status

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

### 29. Get Comment Like Status

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

### 30. Get Threaded Comments (Root + All Nested Replies)

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

### 31. Create Root Comment

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

### 32. Reply to Any Comment (Unlimited Depth)

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

### 33. Get Full Reply Subtree

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

### 34. Update Comment

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

### 35. Delete Comment (Cascading)

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

## Common Error Responses

| Status | Scenario | Message |
|---|---|---|
| `400` | Missing/invalid field | Field-specific validation message |
| `401` | Missing/expired/invalid token | `"No token available. Please log in."` or `"Session expired. Please log in again."` |
| `403` | Email not verified | `"Please verify your email before accessing this feature."` |
| `403` | Not owner or admin | `"You do not have permission to update/delete this comment."` or `"You do not have permission to update/delete this post."` |
| `404` | Resource not found | `"Post not found."` or `"Comment not found."` or `"User not found."` |
| `409` | Duplicate unique field | `"A record with this <field> already exists."` |
| `500` | Unhandled server error | `"Something went wrong. Please try again later."` (prod) |
