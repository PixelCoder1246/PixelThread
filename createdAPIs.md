# PixelThread API Reference

This file documents all API endpoints created in the project. You can copy the URLs, request bodies, and headers to set up your Postman collections.

## Base URL
*   **Local Development**: `http://localhost:5000` (or whichever port your server is running on)

---

## Public Endpoints

### 1. API Health Check / Ping
*   **Method**: `GET`
*   **Endpoint**: `/`
*   **Description**: Verifies if the PixelThread API is running.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "PixelThread API is running!"
    }
    ```

### 2. Register User
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/register`
*   **Headers**: 
    *   `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "securepassword123"
    }
    ```
*   **Description**: Creates a new user account, hashes their password, and fires an email verification link (via token).
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
          "isEmailVerified": false,
          "createdAt": "2026-06-19T23:33:02.000Z"
        }
      }
    }
    ```

### 3. Login User
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/login`
*   **Headers**: 
    *   `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "securepassword123"
    }
    ```
*   **Cookies Set**:
    *   `accessToken`: JWT access token (Expires in ~15 minutes, HttpOnly, Secure, SameSite=Strict)
    *   `refreshToken`: JWT refresh token (Expires in ~30 days, HttpOnly, Secure, SameSite=Strict)
*   **Description**: Authenticates user credentials. If email is unverified, blocks login with `403 Forbidden`. If verified, registers a new session (hashed in DB), issues access and refresh cookies, and updates last login timestamp.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Login successful.",
      "data": {
        "user": {
          "id": "cl...",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "role": "USER",
          "image": null,
          "isEmailVerified": true,
          "createdAt": "2026-06-19T23:33:02.000Z"
        }
      }
    }
    ```
*   **Error Response (403 Forbidden - Email Unverified)**:
    ```json
    {
      "success": false,
      "message": "Please verify your email before logging in."
    }
    ```

### 4. Verify Email
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/verify-email`
*   **Headers**: 
    *   `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "token": "your_email_verification_token_here"
    }
    ```
*   **Description**: Verifies the user's email address using a valid verification token.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Email verified successfully. You can now log in."
    }
    ```

### 5. Resend Email Verification
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/resend-verification`
*   **Headers**: 
    *   `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "email": "john.doe@example.com"
    }
    ```
*   **Description**: Invalidates previous verification tokens and sends a new email verification link if the account is unverified.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "If your account exists and is unverified, a new verification email has been sent."
    }
    ```

### 6. Forgot Password
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/forgot-password`
*   **Headers**: 
    *   `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "email": "john.doe@example.com"
    }
    ```
*   **Description**: Triggers a password reset token generation and sends a reset link to the email.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "If an account with that email exists, a password reset link has been sent."
    }
    ```

### 7. Reset Password
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/reset-password`
*   **Headers**: 
    *   `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "token": "your_password_reset_token_here",
      "newPassword": "newsecurepassword123"
    }
    ```
*   **Description**: Resets the password using a valid reset token, revokes all current sessions, and requires re-login.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Password reset successfully. Please log in with your new password."
    }
    ```

### 8. Refresh Token Rotation
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/refresh`
*   **Headers**: 
    *   `Cookie: refreshToken=<token>`
*   **Cookies Set**:
    *   `accessToken`: New access token cookie
    *   `refreshToken`: New rotated refresh token cookie
*   **Description**: Rotates refresh token. Reads old refresh token from cookie, verifies signature, checks if session exists and is unrevoked in the database, deletes the old session, registers a new session in DB, and issues new rotated token cookies. No tokens are returned in the JSON response.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Token refreshed."
    }
    ```

---

## Protected Endpoints
*Requires authentication via HttpOnly `accessToken` cookie. Call with `credentials: 'include'` (CORS).*

### 9. Get Current User Info
*   **Method**: `GET`
*   **Endpoint**: `/api/auth/me`
*   **Description**: Retrieves the profile details of the currently authenticated user. Note: Accessible to unverified authenticated users.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Current user fetched.",
      "data": {
        "user": {
          "id": "cl...",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "role": "USER",
          "image": null,
          "isEmailVerified": true,
          "createdAt": "2026-06-19T23:33:02.000Z"
        }
      }
    }
    ```

### 10. Logout User
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/logout`
*   **Description**: Clears `accessToken` and `refreshToken` cookies, hashes the `refreshToken` from the cookie, and deletes the corresponding DB session.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Logged out successfully."
    }
    ```

---

## Verified-Only Restricted Endpoints
*Requires authentication via `accessToken` AND `isEmailVerified: true`.*

### 11. Get Posts
*   **Method**: `GET`
*   **Endpoint**: `/api/posts`
*   **Description**: Retrieves mock posts feed. Blocked for unverified users.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Posts fetched successfully.",
      "data": {
        "posts": [
          { "id": "1", "title": "First Post", "content": "Hello World!" }
        ]
      }
    }
    ```
*   **Error Response (403 Forbidden - Email Unverified)**:
    ```json
    {
      "success": false,
      "message": "Please verify your email before accessing this feature."
    }
    ```

### 12. Create Post
*   **Method**: `POST`
*   **Endpoint**: `/api/posts`
*   **Headers**:
    *   `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "title": "A New Post",
      "content": "Content of the post"
    }
    ```
*   **Description**: Submits a new post. Blocked for unverified users.
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Post created successfully.",
      "data": {
        "post": {
          "id": "abc123xyz",
          "title": "A New Post",
          "content": "Content of the post",
          "authorId": "cl..."
        }
      }
    }
    ```
*   **Error Response (403 Forbidden - Email Unverified)**:
    ```json
    {
      "success": false,
      "message": "Please verify your email before accessing this feature."
    }
    ```
