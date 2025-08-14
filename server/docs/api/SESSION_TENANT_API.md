# Session API - Tenant-Based Data Access

## Overview
The Session API has been enhanced to support tenant-based data access when `role_id=3` and `tenant_id` is provided. This allows managers to view session data for all counselors within their tenant.

## Feature Details

### When Tenant Data is Shown
- **Condition**: `role_id=3` AND `tenant_id` is provided in the request
- **Purpose**: Show session data for all counselors within the specified tenant
- **Scope**: 
  - If `counselor_id` is provided: Show data for that specific counselor only
  - If no `counselor_id` is provided: Show data for ALL counselors in the specified tenant

### API Endpoints

#### GET /api/session/today
Retrieves today's and tomorrow's sessions with tenant-based filtering.

**Query Parameters:**
- `role_id` (required): User role ID
- `tenant_id` (required for tenant-wide access): Tenant ID
- `counselor_id` (optional): Specific counselor ID
  - When `role_id=3` and `tenant_id` is provided without `counselor_id`, shows data for ALL counselors in that tenant
  - When `counselor_id` is provided, shows data for that specific counselor only
- `user_timezone` (optional): User's timezone for date formatting

**Response Structure:**
```json
{
  "session_today": [
    {
      "session_id": 123,
      "counselor_id": 169,
      "client_id": 170,
      "tenant_id": 121,
      "intake_date": "2025-01-15",
      "thrpy_status": "ONGOING",
      // ... other session fields
    }
  ],
  "session_tomorrow": [
    // Similar structure for tomorrow's sessions
  ]
}
```

## Usage Examples

### Show All Counselors for a Tenant
```
GET /api/session/today?role_id=3&tenant_id=121
```
- Returns sessions for ALL counselors in tenant_id 121
- Shows comprehensive view of the entire tenant's session data

### Show Specific Counselor
```
GET /api/session/today?role_id=3&tenant_id=121&counselor_id=169
```
- Returns sessions for counselor_id 169 only
- Shows data for that specific counselor

### Default Behavior (No tenant_id provided)
```
GET /api/session/today?role_id=3
```
- Returns 400 error - requires either tenant_id or counselor_id

## Error Handling
- **400 Bad Request**: When `role_id=3` is provided without `tenant_id` or `counselor_id`
- **400 Bad Request**: When `role_id` is missing
- **400 Bad Request**: When `role_id=2` or `role_id=4` is provided without `counselor_id`

## Database Dependencies
- `v_session` view: Provides session data with counselor and tenant information
- `user_profile` table: Contains counselor profile information
- `users` table: Contains user information and role mapping

## Role-Based Access Control

### Role ID = 2 (Counselor)
- Requires `counselor_id` parameter
- Shows only sessions for the specified counselor

### Role ID = 3 (Manager)
- Option 1: Provide `tenant_id` to see all counselors in that tenant
- Option 2: Provide `counselor_id` to see specific counselor's sessions
- Option 3: Provide both `tenant_id` and `counselor_id` (counselor_id takes precedence)

### Role ID = 4 (Admin)
- No additional filtering required
- Shows all sessions across all tenants

## Testing

### Test Cases
1. **Tenant-wide access**: Verify that `role_id=3` with `tenant_id` shows all counselors' data
2. **Specific counselor access**: Verify that `role_id=3` with `counselor_id` shows only that counselor's data
3. **Error handling**: Verify proper error responses for missing required fields
4. **Data filtering**: Verify that all returned sessions belong to the specified tenant

### Running Tests
```bash
cd server
npm test -- tests/api/test_reports_api.js
```

## Integration Notes

### Frontend Integration
The frontend can now:
1. Show comprehensive tenant-wide session data for managers
2. Allow managers to view all counselors' sessions within their tenant
3. Maintain backward compatibility with existing counselor-specific queries

### Default Behavior
- New tenants will work with the existing logic
- The API maintains backward compatibility
- Existing integrations will continue to work as expected
