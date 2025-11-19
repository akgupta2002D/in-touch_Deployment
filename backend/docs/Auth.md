# Authentication Routes

This document outlines all authentication-related endpoints, expected inputs, side effects, and responses.

Base path: /api/auth

Token model
- Access token: JWT in Authorization header (Bearer <token>), short-lived (30m).
- Refresh token: JWT in HttpOnly cookie refreshToken, long-lived (7d), rotated on refresh.
- Cookies: HttpOnly; SameSite=None and Secure in production, Lax in dev.

Prerequisites
- Server middleware: cors({ origin: FRONTEND_URL, credentials: true }), cookie-parser, passport.initialize().
- Env vars: ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, FRONTEND_URL, BACKEND_URL, NODE_ENV, DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, EMAIL_USER, EMAIL_PASS.

Conventions
- Content-Type: application/json for POST bodies.
- Client must send credentials (cookies) on refresh route.
- Protected APIs elsewhere should require Authorization: Bearer <accessToken>.

1) POST /verify-token
Purpose
- Diagnostic endpoint to validate an access token.

Inputs
- Body: { token: string }

Responses
- 200: { valid: true, userId: number }
- 401: { valid: false, message: "Invalid or expired access token" }

2) POST /verify-refresh-token
Purpose
- Diagnostic endpoint to validate a refresh token string (not the cookie).

Inputs
- Body: { token: string }

Responses
- 200: { valid: true, userId: number }
- 401: { valid: false, message: "Invalid or expired refresh token" }

3) POST /token/refresh
Purpose
- Exchange a valid refresh token (cookie) for a new access token. Rotates refresh cookie.

Inputs
- Headers: none required
- Cookies: refreshToken (HttpOnly)
- Body: none

Responses
- 200: { accessToken: string }
  - Side effect: sets a new refreshToken HttpOnly cookie.
- 401: { message: "Missing refresh token" } or { message: "Invalid or expired refresh token" }
- 404: { message: "User not found" }
- 500: { message: "Server error" }

Client notes
- Axios call must include withCredentials: true.

4) POST /login
Purpose
- Email/password login. Issues access token and sets refresh cookie.

Inputs
- Body: { email: string, password: string }

Responses
- 200: { accessToken: string }
  - Side effect: sets refreshToken HttpOnly cookie.
- 401: { message: "Invalid email or password" }

5) POST /signup
Purpose
- Create user and send email verification link. Does not log in the user.

Inputs
- Body: { username: string, email: string, password: string, display_name: string }

Responses
- 201: { message: "User registered successfully. Please check your email." }
- 400: { message: "Email already in use" } or { message: "Username already in use" }
- 500: { message: "Error registering user" }

6) GET /verify-email
Purpose
- Verify user’s email via token delivered in email.

Inputs
- Query: token: string, id: number

Responses
- 200: { message: "Email verified successfully!" }
- 400: 
  - { message: "Missing token or user ID" }
  - { message: "No verification token found. Please request a new one." }
  - { message: "Token has expired. Please request a new one." }
  - { message: "Invalid verification token." }
- 404: { message: "User not found" }
- 200: { message: "Email already verified." } (idempotent success)
- 500: { message: "Server error during verification." }

7) POST /logout
Purpose
- Clear refresh cookie and log out.

Inputs
- None

Responses
- 200: { message: "Logged out successfully" }
  - Side effect: clears refreshToken HttpOnly cookie.

8) POST /reset-password
Purpose
- Initiate password reset by sending email with reset link.

Inputs
- Body: { email: string }

Responses
- 200: { message: "If an account exists, a reset link has been sent." }
  - Side effect: stores hashed reset token and expiry; sends email with link:
    - ${FRONTEND_URL}/reset-password?token=<plain>&id=<userId>
- 500: { message: "Server error" }

9) POST /reset-password/complete
Purpose
- Complete password reset using token and user id.

Inputs
- Body: { token: string, id: number, newPassword: string }

Responses
- 200: { message: "Password has been reset successfully." }
- 400:
  - { message: "Missing required fields" }
  - { message: "Reset link has expired." }
  - { message: "Invalid reset token." }
- 404: { message: "User not found" }
- 500: { message: "Server error" }

10) GET /google
Purpose
- Start Google OAuth flow.

Inputs
- None (initiates redirect)

Responses
- 302 Redirect to Google OAuth consent screen.

11) GET /google/callback
Purpose
- Handle Google OAuth callback, issue tokens, and redirect to frontend.

Inputs
- Query from Google (handled by passport)

Responses
- 302 Redirect to:
  - Success: ${FRONTEND_URL}/connections?token=<accessToken> (if user.username exists)
  - Success: ${FRONTEND_URL}/complete-profile?token=<accessToken> (if username is null)
  - Failure: ${FRONTEND_URL}?error=auth_failed or ?error=server_error
  - Side effects: sets refreshToken HttpOnly cookie.

Operational notes
- Access token usage on protected APIs:
  - Send Authorization: Bearer <accessToken>.
  - On 401 (expired/invalid), call POST /api/auth/token/refresh with credentials to get a new access token, then retry once.
- CSRF and CORS:
  - Restrict CORS origin to your frontend.
  - Refresh route returns JSON; third-party sites can’t read it due to CORS, but keep allowed origin strict.
- Token rotation/revocation:
  - Current setup does not persist refresh tokens. For revocation, store hashed refresh tokens per user and validate/rotate in DB.
