# Connections Routes

Base path: /api/connections

Authentication

- All routes require Authorization: Bearer <accessToken>.
- CSRF required for POST, PUT, DELETE (x-csrf-token header).

Rate Limiting

- 20 requests per minute per IP (applied to all connections endpoints).

General Model

- connection fields (minimum set used here):
  id
  user_id
  connection_name (string, required on create)
  reach_out_priority (integer 0–10)
  reminder_frequency_days (integer > 0)
  notes (text)
  connection_type (string)
  know_from (string)
  created_at
  last_contacted_at

Endpoints

1. GET /api/connections/page/:page
   Purpose

- Paginated list (50 per page) of user’s connections, ranked then alphabetized.

Inputs

- Headers: Authorization: Bearer <accessToken>
- Params: page (integer >= 1)

Responses

- 200: {
  connections: [ { id, connection_name, reach_out_priority, reminder_frequency_days, created_at, last_contacted_at }, ... ],
  page: number,
  hasNext: boolean
  }
- 401: { message: "Missing access token" } or { message: "Invalid or expired access token" }
- 500: { error: "Internal Server Error" }

2. GET /api/connections/id/:connectionId
   Purpose

- Full details of a single connection.

Inputs

- Headers: Authorization
- Params: connectionId (integer)

Responses

- 200: { connection: { all connection columns } }
- 401: auth errors
- 404: { error: "Connection not found" }
- 500: { error: "Internal Server Error" }

3. GET /api/connections/search/:query
   Purpose

- Search by connection_name (ILIKE %query%).

Inputs

- Headers: Authorization
- Params: query (string)

Responses

- 200: { connections: [ { id, connection_name, reach_out_priority, reminder_frequency_days, created_at, last_contacted_at } ] }
- 401: auth errors
- 500: { error: "Internal Server Error" }

4. POST /api/connections
   Purpose

- Create a new connection.

Inputs

- Headers: Authorization, x-csrf-token
- Body (JSON):
  {
  connection_name: string (required, max 100),
  reminder_frequency_days: integer > 0 (required),
  reach_out_priority: integer 0–10 (optional; defaults to 0 when omitted),
  notes: string (optional; defaults to empty string when omitted),
  connection_type: string (optional; defaults to "acquaintance" when omitted, max 50),
  know_from: string (optional; defaults to empty string when omitted)
  }

Responses

- 201: { connection: { id, connection_name, reach_out_priority, reminder_frequency_days, created_at, last_contacted_at } }
- 400: { error: "...validation message..." }
- 401: auth errors
- 500: { error: "Internal Server Error" }

5. PUT /api/connections/:connectionId
   Purpose

- Partial update of a connection (only provided fields change; omitted fields remain unchanged).

Inputs

- Headers: Authorization, x-csrf-token
- Params: connectionId (integer)
- Body (JSON any subset):
  {
  connection_name,
  reach_out_priority,
  reminder_frequency_days,
  notes,
  connection_type,
  know_from
  }

Responses

- 200: { connection: { id, connection_name, reach_out_priority, reminder_frequency_days, created_at, last_contacted_at } }
- 400: { error: "...validation message..." }
- 401: auth errors
- 404: { error: "Connection not found" }
- 500: { error: "Internal Server Error" }

6. DELETE /api/connections/:connectionId
   Purpose

- Remove a connection.

Inputs

- Headers: Authorization, x-csrf-token
- Params: connectionId (integer)

Responses

- 204: (no content)
- 401: auth errors
- 404: { error: "Connection not found" }
- 500: { error: "Internal Server Error" }

Operational Notes

- Ranking formula used in pagination and search orders by priority plus time since last contact vs reminder frequency.
- hasNext indicates if another page is available; next page = page + 1 when hasNext = true.
- For future enhancements (e.g., marking last_contacted_at), add a PATCH endpoint.

Validation Summary

- connection_name: required on create; max 100 chars.
- reach_out_priority: integer 0–10.
- reminder_frequency_days: integer > 0.
- connection_type: max 50 chars.
- know_from: max 255 chars.

Security

- All endpoints protected by JWT access token middleware.
- CSRF enforced for mutating requests.
- Rate limiting helps prevent enumeration
