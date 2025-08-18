# Treatment Target Form Attachment API

## Overview

This API provides functionality to attach forms to sessions based on treatment targets, in addition to the existing service-based form attachment. The system now supports two modes of form attachment with a **switch functionality**:

1. **Service-Based**: Traditional form attachment based on service type (default behavior)
2. **Treatment Target-Based**: Form attachment based on client's treatment target and session numbers (new functionality)

### Environment Variable Control (Primary Control)

The system is controlled **entirely** by the environment variable `FORM_MODE`:

- **FORM_MODE=auto** (default) - Automatically detects and uses treatment target forms if they exist, otherwise uses service-based forms
- **FORM_MODE=service** - Always uses service-based form attachment (traditional behavior)
- **FORM_MODE=treatment_target** - Always uses treatment target-based form attachment (if available)

### No Frontend Changes Required

- **Frontend remains unchanged** - No UI switches or mode selection needed
- **Backend handles everything** - Environment variable controls all behavior
- **Automatic treatment target detection** - Backend automatically gets treatment target from therapy request
- **Seamless integration** - Existing frontend code works without modification

## Endpoints

### 1. Load Session Forms with Mode Selection

**Endpoint:** `POST /api/thrpyReq/load-session-forms`

**Description:** Load session forms using either service-based or treatment target-based mode.

**Authentication:** Required

**Request Body:**
```json
{
  "req_id": 123
  // No mode or treatment_target needed - backend handles everything via FORM_MODE
}
```

**Environment Variable (Required):**
```bash
# Set in .env file
FORM_MODE=auto  # auto, service, or treatment_target
```

**Response (Success):**
```json
{
  "message": "Treatment target session forms loaded successfully"
}
```

**Response (Error):**
```json
{
  "message": "Missing required field: req_id",
  "error": -1
}
```

**Example Usage:**

**Auto Mode (Uses Environment Variable):**
```bash
curl -X POST /api/thrpyReq/load-session-forms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "req_id": 123
  }'
```

**Service-Based Mode:**
```bash
curl -X POST /api/thrpyReq/load-session-forms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "req_id": 123,
    "mode": "service"
  }'
```

**Treatment Target-Based Mode:**
```bash
curl -X POST /api/thrpyReq/load-session-forms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "req_id": 123,
    "mode": "treatment_target",
    "treatment_target": "Anxiety"
  }'
```

### 2. Load Session Forms by Treatment Target (Direct)

**Endpoint:** `POST /api/treatment-target-feedback-config/load-session-forms`

**Description:** Direct endpoint to load session forms based on treatment target configuration.

**Authentication:** Required

**Request Body:**
```json
{
  "req_id": 123,
  "treatment_target": "Anxiety",
  "counselor_id": 456,
  "tenant_id": 1
}
```

**Response (Success):**
```json
{
  "message": "Treatment target session forms loaded successfully"
}
```

**Response (Error):**
```json
{
  "message": "No treatment target feedback configurations found",
  "error": -1
}
```

### 3. Get Therapy Request with Treatment Target Forms

**Endpoint:** `GET /api/thrpyReq/with-treatment-target-forms`

**Description:** Get therapy request data with enhanced session information including treatment target forms.

**Authentication:** Required

**Query Parameters:**
- `req_id` (optional): Therapy request ID
- `counselor_id` (optional): Counselor ID
- `client_id` (optional): Client ID
- `tenant_id` (optional): Tenant ID

**Response:**
```json
[
  {
    "req_id": 3,
    "counselor_id": 9,
    "client_id": 11,
    "service_id": 1546,
    "session_obj": [
      {
        "session_id": 41,
        "forms_array": [16, 20],           // Treatment target forms ONLY (if they exist)
        "form_mode": "treatment_target",   // Indicates which mode is active
        "session_status": "SHOW",
        // ... other session fields
      },
      {
        "session_id": 42,
        "forms_array": [22, 25],           // Service-based forms ONLY (if no treatment target forms)
        "form_mode": "service",            // Indicates which mode is active
        "session_status": "SCHEDULED",
        // ... other session fields
      }
    ]
    // ... other therapy request fields
  }
]
```

**Form Mode Logic:**
- **If treatment target forms exist** → Use treatment target forms, `form_mode: "treatment_target"`
- **If no treatment target forms** → Use service-based forms, `form_mode: "service"`
- **Never both** → Only one form type per session

### 4. Get Treatment Target Session Forms by Request ID

**Endpoint:** `GET /api/treatment-target-session-forms/by-request?req_id=123`

**Description:** Get all treatment target session forms for a specific therapy request.

**Authentication:** Required

**Query Parameters:**
- `req_id` (required): Therapy request ID
- `tenant_id` (optional): Tenant ID (will be taken from token if not provided)

**Response (Success):**
```json
{
  "message": "Treatment target session forms retrieved successfully",
  "rec": [
    {
      "id": 1,
      "req_id": 123,
      "session_id": 456,
      "client_id": 789,
      "counselor_id": 101,
      "treatment_target": "Anxiety",
      "form_name": "GAD-7",
      "form_id": 1,
      "config_id": 1,
      "purpose": "Measure anxiety severity and track treatment progress",
      "session_number": 1,
      "is_sent": 0,
      "sent_at": null,
      "tenant_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 4. Get Treatment Target Session Forms by Session ID

**Endpoint:** `GET /api/treatment-target-session-forms/by-session?session_id=456`

**Description:** Get all treatment target session forms for a specific session.

**Authentication:** Required

**Query Parameters:**
- `session_id` (required): Session ID
- `tenant_id` (optional): Tenant ID (will be taken from token if not provided)

### 5. Get Treatment Target Session Forms by Client ID

**Endpoint:** `GET /api/treatment-target-session-forms/by-client?client_id=789`

**Description:** Get all treatment target session forms for a specific client.

**Authentication:** Required

**Query Parameters:**
- `client_id` (required): Client ID
- `tenant_id` (optional): Tenant ID (will be taken from token if not provided)

### 6. Update Treatment Target Session Form Sent Status

**Endpoint:** `PUT /api/treatment-target-session-forms/sent-status`

**Description:** Update the sent status of a treatment target session form.

**Authentication:** Required

**Request Body:**
```json
{
  "id": 1,
  "is_sent": true
}
```

### 6.1. Update Treatment Target Session Forms by Session ID

**Endpoint:** `PUT /api/treatment-target-session-forms/by-session`

**Description:** Update the sent status of all treatment target session forms for a specific session.

**Authentication:** Required

**Request Body:**
```json
{
  "session_id": 456,
  "is_sent": true
}
```

### 7. Get Forms to Send for a Session

**Endpoint:** `GET /api/treatment-target-session-forms/forms-to-send?session_id=456`

**Description:** Get all forms that need to be sent for a specific session.

**Authentication:** Required

**Query Parameters:**
- `session_id` (required): Session ID
- `tenant_id` (optional): Tenant ID (will be taken from token if not provided)

### 8. Get Treatment Target Session Forms Statistics

**Endpoint:** `GET /api/treatment-target-session-forms/stats?req_id=123`

**Description:** Get statistics for treatment target session forms.

**Authentication:** Required

**Query Parameters:**
- `req_id` (optional): Therapy request ID
- `client_id` (optional): Client ID
- `tenant_id` (optional): Tenant ID (will be taken from token if not provided)

**Response (Success):**
```json
{
  "message": "Treatment target session forms statistics retrieved successfully",
  "rec": [
    {
      "treatment_target": "Anxiety",
      "form_name": "GAD-7",
      "total_forms": 5,
      "sent_forms": 3,
      "pending_forms": 2
    }
  ]
}
```

## Treatment Target Values

The following treatment targets are supported:

- Anxiety
- Depression
- Stress Management
- Relationship Issues
- Grief and Loss
- Trauma and PTSD
- Self-Esteem and Self-Confidence Issues
- Addiction and Substance Abuse
- Identity and Self-Exploration
- Family and Parenting Issues
- Work and Career-Related Issues
- Chronic Illness and Health-Related Concerns
- Anger Management
- Eating Disorders and Body Image Issues
- Life Transitions
- Coping with Disability
- Other

## How It Works

### Service-Based Mode
1. Retrieves forms configured for the specific service
2. Attaches forms to sessions based on form configuration (static/dynamic)
3. Creates user_forms records for each attached form

### Treatment Target-Based Mode
1. Retrieves treatment target feedback configurations for the specified treatment target
2. Checks which sessions should have forms based on the session numbers in the configuration
3. Attaches forms to the appropriate sessions
4. Creates user_forms records for each attached form

## Database Schema

### Treatment Target Feedback Configuration Table
```sql
CREATE TABLE treatment_target_feedback_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  treatment_target VARCHAR(255) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NULL,
  purpose TEXT,
  sessions JSON NOT NULL,
  tenant_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_treatment_target (treatment_target),
  INDEX idx_form_name (form_name),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_treatment_tenant (treatment_target, tenant_id),
  
  UNIQUE KEY unique_treatment_form_tenant (treatment_target, form_name, tenant_id)
);
```

### Treatment Target Session Forms Table
```sql
CREATE TABLE treatment_target_session_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  req_id INT NOT NULL,
  session_id INT NOT NULL,
  client_id INT NOT NULL,
  counselor_id INT NOT NULL,
  treatment_target VARCHAR(255) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  form_id INT NOT NULL,
  config_id INT NOT NULL,
  purpose TEXT,
  session_number INT NOT NULL,
  is_sent TINYINT(1) DEFAULT 0,
  sent_at TIMESTAMP NULL,
  tenant_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better query performance
  INDEX idx_req_id (req_id),
  INDEX idx_session_id (session_id),
  INDEX idx_client_id (client_id),
  INDEX idx_counselor_id (counselor_id),
  INDEX idx_treatment_target (treatment_target),
  INDEX idx_form_name (form_name),
  INDEX idx_form_id (form_id),
  INDEX idx_config_id (config_id),
  INDEX idx_session_number (session_number),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_is_sent (is_sent),
  INDEX idx_req_session (req_id, session_id),
  INDEX idx_client_session (client_id, session_id),
  INDEX idx_treatment_session (treatment_target, session_number),
  
  -- Foreign key constraints
  FOREIGN KEY (req_id) REFERENCES thrpy_req(req_id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES session(session_id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES user_profile(user_profile_id) ON DELETE CASCADE,
  FOREIGN KEY (counselor_id) REFERENCES user_profile(user_profile_id) ON DELETE CASCADE,
  FOREIGN KEY (form_id) REFERENCES forms(form_id) ON DELETE CASCADE,
  FOREIGN KEY (config_id) REFERENCES treatment_target_feedback_config(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate form assignments for the same session
  UNIQUE KEY unique_session_form (session_id, form_id, treatment_target)
);
```

### Example Configuration Data
```sql
INSERT INTO treatment_target_feedback_config 
(treatment_target, form_name, purpose, sessions, tenant_id) VALUES
('Anxiety', 'GAD-7', 'Measure anxiety severity and track treatment progress', '[1, 5, 10, 15, 20]', NULL),
('Anxiety', 'WHODAS', 'Assess functional impairment due to anxiety', '[1, 10, 20]', NULL),
('Depression', 'PHQ-9', 'Measure depression severity and monitor treatment response', '[1, 5, 10, 15, 20]', NULL),
('PTSD', 'PCL-5', 'Assess PTSD symptoms and treatment progress', '[1, 5, 10, 15, 20]', NULL);
```

## Error Handling

The API returns appropriate error messages for various scenarios:

- **Missing required fields**: When req_id, mode, or treatment_target (when applicable) are missing
- **Invalid mode**: When mode is not "service" or "treatment_target"
- **No configurations found**: When no treatment target feedback configurations exist for the specified treatment target
- **Form not found**: When a form_name in the configuration doesn't exist in the forms table
- **Database errors**: When there are issues with database operations

## Security Considerations

1. **Authentication**: All endpoints require valid authentication tokens
2. **Authorization**: Users can only access data within their tenant
3. **Input Validation**: All input parameters are validated before processing
4. **SQL Injection Protection**: Uses parameterized queries to prevent SQL injection

## Integration with Existing System

The new functionality integrates seamlessly with the existing system:

1. **Backward Compatibility**: Existing service-based form attachment continues to work unchanged
2. **Shared Infrastructure**: Uses the same user_forms and session tables
3. **Consistent API**: Follows the same patterns and conventions as existing endpoints
4. **Error Handling**: Uses the same error handling patterns as the rest of the system

## Usage Examples

### Frontend Integration
```javascript
// Service-based form attachment
const serviceResponse = await api.post('/api/thrpyReq/load-session-forms', {
  req_id: 123,
  mode: 'service'
});

// Treatment target-based form attachment
const treatmentTargetResponse = await api.post('/api/thrpyReq/load-session-forms', {
  req_id: 123,
  mode: 'treatment_target',
  treatment_target: 'Anxiety'
});
```

### Backend Integration
```javascript
// In your service layer
const thrpyReqService = new ThrpyReqService();
const result = await thrpyReqService.loadSessionFormsWithMode({
  req_id: 123,
  mode: 'treatment_target',
  treatment_target: 'Anxiety',
  tenant_id: 1
});
```
