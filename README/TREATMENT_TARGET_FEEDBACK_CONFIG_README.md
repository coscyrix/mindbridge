# Treatment Target Feedback Configuration Module

## Overview

The Treatment Target Feedback Configuration module allows you to define which feedback forms should be sent at specific session numbers for different treatment targets. This module provides a flexible way to configure conditional feedback form sending based on treatment targets and session numbers.

## Features

- **Treatment Target Based Configuration**: Define feedback forms for specific treatment targets (e.g., Anxiety, Depression, PTSD)
- **Session-Based Scheduling**: Specify which sessions should trigger specific feedback forms
- **Multi-Tenant Support**: Support for tenant-specific configurations
- **Flexible Session Values**: Support for numeric sessions, special values like "Trans 1", "Trans last", "OTR", "-OTR"
- **Bulk Operations**: Bulk create configurations from JSON data
- **Session Checking**: Check if a session should trigger feedback forms

## Database Schema

### Table: `treatment_target_feedback_config`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `treatment_target` | VARCHAR(255) | Treatment target (e.g., "Anxiety", "Depression") |
| `form_name` | VARCHAR(255) | Form name (e.g., "GAD-7", "PHQ-9") |
| `service_name` | VARCHAR(255) | Service name (optional, e.g., "Individual Therapy", "Group Therapy") |
| `purpose` | TEXT | Purpose description |
| `sessions` | JSON | Array of session numbers or special values |
| `tenant_id` | INT | Tenant ID (nullable for multi-tenant support) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## Validation Rules

### Unique Combination Constraint

The system enforces a unique combination constraint for `treatment_target`, `form_name`, `service_name`, and `tenant_id`. This means:

1. **Global Configurations** (`tenant_id = null`): Only one configuration can exist for a specific `treatment_target` + `form_name` + `service_name` combination globally.

2. **Tenant-Specific Configurations** (`tenant_id = specific_value`): Only one configuration can exist for a specific `treatment_target` + `form_name` + `service_name` combination within the same tenant.

3. **Cross-Tenant Configurations**: The same `treatment_target` + `form_name` + `service_name` combination can exist for different tenants (including global vs tenant-specific).

4. **Service-Specific Configurations**: Different `service_name` values can exist for the same `treatment_target` + `form_name` combination.

#### Examples:

✅ **Allowed:**
- Global: `{treatment_target: "Anxiety", form_name: "GAD-7", service_name: null, tenant_id: null}`
- Global: `{treatment_target: "Anxiety", form_name: "GAD-7", service_name: "Individual Therapy", tenant_id: null}`
- Global: `{treatment_target: "Anxiety", form_name: "GAD-7", service_name: "Group Therapy", tenant_id: null}`
- Tenant A: `{treatment_target: "Anxiety", form_name: "GAD-7", service_name: "Individual Therapy", tenant_id: 123}`
- Tenant B: `{treatment_target: "Anxiety", form_name: "GAD-7", service_name: "Individual Therapy", tenant_id: 456}`

❌ **Not Allowed:**
- Global: `{treatment_target: "Anxiety", form_name: "GAD-7", service_name: "Individual Therapy", tenant_id: null}` (already exists)
- Global: `{treatment_target: "Anxiety", form_name: "GAD-7", service_name: "Individual Therapy", tenant_id: null}` (duplicate)
- Tenant A: `{treatment_target: "Anxiety", form_name: "GAD-7", service_name: "Individual Therapy", tenant_id: 123}` (already exists)
- Tenant A: `{treatment_target: "Anxiety", form_name: "GAD-7", service_name: "Individual Therapy", tenant_id: 123}` (duplicate)

#### Error Response:

When attempting to create a duplicate combination, the API returns:

```json
{
  "message": "Configuration with treatment_target \"Anxiety\", form_name \"GAD-7\" and service \"Individual Therapy\" already exists globally",
  "error": -1
}
```

Or for tenant-specific duplicates:

```json
{
  "message": "Configuration with treatment_target \"Anxiety\", form_name \"GAD-7\" and service \"Individual Therapy\" already exists for tenant 123",
  "error": -1
}
```

## API Endpoints

### Base URL: `/api/treatment-target-feedback-config`

#### 1. Create Configuration
```http
POST /api/treatment-target-feedback-config
```

**Request Body:**
```json
{
  "treatment_target": "Anxiety",
  "form_name": "GAD-7",
  "service_name": "Individual Therapy",
  "purpose": "Measure anxiety severity and track treatment progress",
  "sessions": [1, 5, 10, 15, 20],
  "tenant_id": null
}
```

#### 2. Update Configuration
```http
PUT /api/treatment-target-feedback-config/:id
```

#### 3. Get Configuration by ID
```http
GET /api/treatment-target-feedback-config/:id
```

#### 4. Get All Configurations
```http
GET /api/treatment-target-feedback-config
```

**Query Parameters:**
- `treatment_target` - Filter by treatment target
- `form_name` - Filter by form name
- `tenant_id` - Filter by tenant ID

#### 5. Check Session Feedback Forms
```http
POST /api/treatment-target-feedback-config/check-session
```

**Request Body:**
```json
{
  "treatment_target": "Anxiety",
  "session_number": 5,
  "tenant_id": null
}
```

#### 6. Delete Configuration
```http
DELETE /api/treatment-target-feedback-config/:id
```

#### 7. Get Treatment Targets
```http
GET /api/treatment-target-feedback-config/treatment-targets/list
```

#### 8. Get Form Names
```http
GET /api/treatment-target-feedback-config/form-names/list
```

#### 9. Get Service Names
```http
GET /api/treatment-target-feedback-config/service-names/list
```

#### 10. Bulk Create Configurations
```http
POST /api/treatment-target-feedback-config/bulk
```

**Request Body:**
```json
{
  "configs": [
    {
      "treatment_target": "Anxiety",
      "form_name": "GAD-7",
      "purpose": "Measure anxiety severity",
      "sessions": [1, 5, 10, 15, 20],
      "tenant_id": null
    }
  ]
}
```

## Session Value Normalization

The module supports various session value formats and normalizes them:

### Supported Formats:

1. **Numeric Sessions**: `"Sessions 1, 5, 10, 15, 20"` → `[1, 5, 10, 15, 20]`
2. **Transition Sessions**: `"Trans 1 & last"` → `["Trans 1", "Trans last"]`
3. **OTR Values**: `"OTR & -OTR"` → `["OTR", "-OTR"]`
4. **Single Session**: `"Session 1"` → `[1]`

### Normalization Rules:

- **"Sessions 1 & 5"** → `[1, 5]`
- **"Trans 1 & last"** → `["Trans 1", "Trans last"]`
- **"OTR & -OTR"** → `["OTR", "-OTR"]`
- **"Session 1"** → `[1]`

## Usage Examples

### 1. Basic Configuration

```javascript
// Create a configuration for Anxiety treatment
const config = {
  treatment_target: "Anxiety",
  form_name: "GAD-7",
  purpose: "Measure anxiety severity and track treatment progress",
  sessions: [1, 5, 10, 15, 20],
  tenant_id: null
};

// POST to /api/treatment-target-feedback-config
```

### 2. Check Session Feedback Forms

```javascript
// Check if session 5 should trigger feedback forms for Anxiety
const sessionCheck = {
  treatment_target: "Anxiety",
  session_number: 5,
  tenant_id: null
};

// POST to /api/treatment-target-feedback-config/check-session
// Returns forms that should be sent for this session
```

### 3. Bulk Configuration from Table Data

```javascript
// Convert table data to JSON format
const tableData = [
  {
    treatment_target: "Anxiety",
    tool: "GAD-7",
    purpose: "Measure anxiety severity",
    frequency: "Sessions 1, 5, 10, 15, 20"
  }
];

// Use the service to convert and bulk create
const service = new TreatmentTargetFeedbackConfigService();
const jsonData = service.convertTableToJSON(tableData);
const result = await service.bulkCreateFromJSON(jsonData);
```

## Integration with Existing Feedback System

The Treatment Target Feedback Configuration module integrates with the existing feedback system:

1. **Session Completion**: When a session is completed, the system checks if feedback forms should be sent
2. **Form Selection**: Based on the treatment target and session number, the system determines which forms to send
3. **Form Sending**: The existing feedback system handles the actual form sending logic

### Integration Flow:

```
Session Completed
       ↓
Check Treatment Target
       ↓
Check Session Number
       ↓
Get Forms to Send
       ↓
Send Feedback Forms
```

## Setup and Installation

### 1. Run Migration

```sql
-- Run the migration file
source server/migrations/treatment_target_feedback_config.sql;
```

### 2. Run Setup Script

```bash
# Run the setup script to create sample configurations
node server/scripts/setup_treatment_target_config.js
```

### 3. Test the API

```bash
# Test session checking
curl -X POST http://localhost:5000/api/treatment-target-feedback-config/check-session \
  -H "Content-Type: application/json" \
  -d '{
    "treatment_target": "Anxiety",
    "session_number": 5,
    "tenant_id": null
  }'
```

## Configuration Examples

### Example 1: Anxiety Treatment

```json
{
  "treatment_target": "Anxiety",
  "tools": [
    {
      "form_name": "GAD-7",
      "purpose": "Measure anxiety severity and track treatment progress",
      "sessions": [1, 5, 10, 15, 20],
      "tenant_id": null
    },
    {
      "form_name": "WHODAS",
      "purpose": "Assess functional impairment due to anxiety",
      "sessions": [1, 10, 20],
      "tenant_id": null
    }
  ]
}
```

### Example 2: Depression Treatment

```json
{
  "treatment_target": "Depression",
  "tools": [
    {
      "form_name": "PHQ-9",
      "purpose": "Measure depression severity and monitor treatment response",
      "sessions": [1, 5, 10, 15, 20],
      "tenant_id": null
    },
    {
      "form_name": "WHODAS",
      "purpose": "Assess functional impairment due to depression",
      "sessions": [1, 10, 20],
      "tenant_id": null
    }
  ]
}
```

### Example 3: General Mental Health

```json
{
  "treatment_target": "General Mental Health",
  "tools": [
    {
      "form_name": "GAS",
      "purpose": "Goal Attainment Scaling for treatment goal tracking",
      "sessions": ["Trans 1", "Trans last"],
      "tenant_id": null
    },
    {
      "form_name": "SMART Goals",
      "purpose": "Track progress on specific treatment goals",
      "sessions": ["OTR", "-OTR"],
      "tenant_id": null
    },
    {
      "form_name": "Consent Form",
      "purpose": "Document informed consent for treatment",
      "sessions": [1],
      "tenant_id": null
    }
  ]
}
```

## Error Handling

The module includes comprehensive error handling:

- **Validation Errors**: Missing required fields, invalid data types
- **Database Errors**: Connection issues, constraint violations
- **Business Logic Errors**: Invalid session numbers, treatment targets not found

### Common Error Responses:

```json
{
  "message": "Missing required fields: treatment_target, form_name, sessions",
  "error": -1
}
```

## Logging

The module uses Winston for logging:

- **Info Level**: Successful operations, configuration changes
- **Error Level**: Database errors, validation failures
- **Debug Level**: Detailed operation tracking

## Performance Considerations

- **Indexes**: Database indexes on `treatment_target`, `form_name`, `tenant_id`
- **Caching**: Consider caching frequently accessed configurations
- **Bulk Operations**: Use bulk create for large datasets

## Security

- **Input Validation**: All inputs are validated before processing
- **SQL Injection Protection**: Uses parameterized queries
- **Tenant Isolation**: Multi-tenant support with proper isolation

## Troubleshooting

### Common Issues:

1. **Migration Fails**: Check database permissions and connection
2. **API Returns 404**: Ensure routes are properly registered
3. **Session Check Returns No Forms**: Verify treatment target and session number match configuration

### Debug Commands:

```bash
# Check if table exists
mysql -u username -p database_name -e "DESCRIBE treatment_target_feedback_config;"

# Check sample data
mysql -u username -p database_name -e "SELECT * FROM treatment_target_feedback_config LIMIT 5;"

# Test API endpoint
curl -X GET http://localhost:5000/api/treatment-target-feedback-config
```

## Future Enhancements

- **UI Management**: Web interface for managing configurations
- **Advanced Scheduling**: More complex scheduling rules
- **Analytics**: Usage statistics and reporting
- **Integration**: Deeper integration with session management system 