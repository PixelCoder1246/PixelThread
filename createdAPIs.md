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

## Common Error Responses

| Status | Scenario | Message |
|---|---|---|
| `400` | Missing/invalid field | Field-specific validation message |
| `401` | Missing/expired/invalid token | `"No token provided. Please log in."` or `"Session expired. Please log in again."` |
| `403` | Email not verified | `"Please verify your email before accessing this feature."` |
| `403` | Not owner or admin | `"You do not have permission to update/delete this post."` |
| `404` | Resource not found | `"Post not found."` or `"User not found."` |
| `409` | Duplicate unique field | `"A record with this <field> already exists."` |
| `500` | Unhandled server error | `"Something went wrong. Please try again later."` (prod) |
