# Session Homework Stats API

## Overview

This API endpoint fetches all therapy requests (clients) for a counselor along with their names, total sessions, and total homework sent across all sessions.

## Endpoint

```
GET /api/session/homework-stats
```

## Authentication

This endpoint requires authentication. Include the JWT token in the request headers.

## Query Parameters

| Parameter      | Type   | Required    | Description                                         |
| -------------- | ------ | ----------- | --------------------------------------------------- |
| `role_id`      | number | Yes         | User's role ID (2: Counselor, 3: Manager, 4: Admin) |
| `counselor_id` | number | Conditional | Required for role_id=2 and optional for role_id=3,4 |
| `tenant_id`    | number | Optional    | Filter by tenant ID (useful for managers)           |
| `client_id`    | number | Optional    | Filter by specific client                           |
| `start_date`   | date   | Optional    | Filter sessions from this date (YYYY-MM-DD)         |
| `end_date`     | date   | Optional    | Filter sessions until this date (YYYY-MM-DD)        |

## Role-Based Access

### Counselor (role_id = 2)

- **MUST** provide `counselor_id`
- Can optionally filter by `client_id`
- Will only see their own sessions within their tenant

### Manager (role_id = 3)

- Can provide `tenant_id` to see all counselors in the tenant
- Can provide `counselor_id` to filter by specific counselor
- Can use `start_date` and `end_date` for date range filtering

### Admin (role_id = 4)

- Can access all sessions
- Can filter by `counselor_id`, `start_date`, `end_date`

## Response Format

### Success Response (200 OK)

```json
[
  {
    "thrpy_req_id": 321,
    "client_id": 456,
    "client_first_name": "John",
    "client_last_name": "Doe",
    "counselor_id": 789,
    "tenant_id": 1,
    "total_sessions": 5,
    "total_homework_sent": 8,
    "first_session_date": "2025-01-01T00:00:00.000Z",
    "last_session_date": "2025-01-15T00:00:00.000Z"
  },
  {
    "thrpy_req_id": 322,
    "client_id": 457,
    "client_first_name": "Jane",
    "client_last_name": "Smith",
    "counselor_id": 789,
    "tenant_id": 1,
    "total_sessions": 3,
    "total_homework_sent": 0,
    "first_session_date": "2025-01-10T00:00:00.000Z",
    "last_session_date": "2025-01-16T00:00:00.000Z"
  }
]
```

### Error Response (400 Bad Request)

```json
{
  "message": "Missing mandatory fields",
  "error": -1
}
```

## Example Requests

### Counselor Fetching Their Sessions

```bash
GET /api/session/homework-stats?role_id=2&counselor_id=789
```

### Counselor Fetching Sessions for Specific Client

```bash
GET /api/session/homework-stats?role_id=2&counselor_id=789&client_id=456
```

### Manager Fetching All Sessions in Their Tenant

```bash
GET /api/session/homework-stats?role_id=3&tenant_id=1
```

### Manager Fetching Sessions for Specific Counselor

```bash
GET /api/session/homework-stats?role_id=3&tenant_id=1&counselor_id=789
```

### Manager Fetching Sessions with Date Range

```bash
GET /api/session/homework-stats?role_id=3&tenant_id=1&start_date=2025-01-01&end_date=2025-01-31
```

### Admin Fetching All Sessions for a Counselor

```bash
GET /api/session/homework-stats?role_id=4&counselor_id=789
```

## Response Fields

| Field                  | Type   | Description                                              |
| ---------------------- | ------ | -------------------------------------------------------- |
| `thrpy_req_id`         | number | Therapy request ID (unique per client)                   |
| `client_id`            | number | Client's user profile ID                                 |
| `client_first_name`    | string | Client's first name                                      |
| `client_last_name`     | string | Client's last name                                       |
| `counselor_id`         | number | Counselor's user profile ID                              |
| `tenant_id`            | number | Tenant/organization ID                                   |
| `total_sessions`       | number | Total number of sessions for this client                 |
| `total_homework_sent`  | number | Total homework assignments sent across all sessions      |
| `first_session_date`   | date   | Date of the first session                                |
| `last_session_date`    | date   | Date of the most recent session                          |

## Notes

1. The API groups results by `thrpy_req_id` (therapy request/client)
2. Only returns therapy requests with `status_yn = 'y'` (active sessions)
3. Only therapy requests with `thrpy_status = 'ONGOING'` are included
4. Results are ordered by `last_session_date` in descending order (most recent first)
5. The `total_homework_sent` will be 0 if no homework has been assigned across any sessions
6. The `total_sessions` counts all distinct sessions for that therapy request
7. The API uses a LEFT JOIN with the homework table, so all clients are returned regardless of whether they have homework or not

## Implementation Details

### Files Modified/Created

- `server/models/session.js` - Added `getSessionsWithHomeworkStats()` method
- `server/services/session.js` - Added `getSessionsWithHomeworkStats()` service method
- `server/controllers/session.js` - Added `getSessionsWithHomeworkStats()` controller method
- `server/routes/session.js` - Added `/homework-stats` route

### Database Query

The API performs a LEFT JOIN between the `v_session` view and the `homework` table, grouping by `thrpy_req_id` to show:
- Total distinct sessions per client
- Total homework sent across all sessions for each client
- Date range of sessions (first and last session dates)
