# Users Routes

Base path: /api/users

Authentication

- All routes require a valid Access Token: Authorization: Bearer <accessToken>.
- Access token obtained via login or refresh flow.
- CSRF: Mutating requests (PUT, DELETE) must include x-csrf-token header (handled by frontend axios setup).

Rate Limiting

- Applied globally to /api/users (30 requests per minute per IP).

Endpoints

1. GET /api/users
   Purpose

- Fetch the authenticated user’s profile.

Inputs

- Headers: Authorization: Bearer <accessToken>

Responses

- 200: { user: { id, email, display_name, username, created_at, last_login_at, profile_picture_url, bio, personality_type, nearest_city, hobbies: string[] } }
- 401: { message: "Missing access token" } or { message: "Invalid or expired access token" }
- 404: { error: "User not found" }
- 500: { error: "Internal Server Error" }

2. PUT /api/users
   Purpose

- Partially update the authenticated user’s profile (only provided fields change; omitted fields remain unchanged).

Inputs

- Headers: Authorization: Bearer <accessToken>, x-csrf-token
- Body (JSON, any subset of the following fields; omitted fields are unchanged):
  {
  username: string,
  display_name: string,
  profile_picture_url: string,
  bio: string,
  personality_type: string,
  nearest_city: string,
  hobbies: string[] // optional; up to 4 items, each <= 25 chars
  }

Responses

- 200: { user: { id, email, username, display_name, profile_picture_url, bio, personality_type, nearest_city, hobbies: string[], created_at } }
- 400: { error: "Username already in use" } (unique violation)
- 401: { message: "Missing access token" } or { message: "Invalid or expired access token" }
- 404: { error: "User not found" }
- 500: { error: "Internal Server Error" }

Notes

- Server performs a partial update. If you omit a field, it remains unchanged in the database.
- Validation enforced server-side (aligned with schema):
  - display_name ≤ 100 chars
  - username ≤ 50 chars (unique)
  - bio ≤ 500 chars
  - personality_type ≤ 50 chars
  - nearest_city ≤ 100 chars
  - hobbies: array up to 4 items; each hobby name ≤ 25 chars
- Consider adding client-side validation for username length/pattern.

3. DELETE /api/users
   Purpose

- Delete the authenticated user’s account.

Inputs

- Headers: Authorization: Bearer <accessToken>, x-csrf-token

Responses

- 204: (no content)
- 401: { message: "Missing access token" } or { message: "Invalid or expired access token" }
- 404: { error: "User not found" }
- 500: { error: "Internal Server Error" }

Operational Notes

- After a 204 response, frontend should clear any stored tokens and redirect to landing.
- If you want soft deletes later, replace DELETE with a status flag.
