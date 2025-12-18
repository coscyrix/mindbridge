# Treatment Target Templates API Documentation

## Overview

The Treatment Target Templates API manages the mapping between **Treatment Targets** (e.g., Anxiety, Depression) and **Assessment Tools** (e.g., GAD-7, PHQ-9), with service-specific session frequencies.

### Data Model

```
┌─────────────────────────────────────────────┐
│  treatment_target_session_forms_template    │
│  (Parent)                                   │
├─────────────────────────────────────────────┤
│  id: 1                                      │
│  treatment_target: "Anxiety"                │
│  form_name: "GAD-7"                         │
│  purpose: "Measure anxiety severity"        │
│  is_active: true                            │
└──────────────────┬──────────────────────────┘
                   │
                   │  ONE parent has MANY children
                   │
    ┌──────────────┼──────────────┬──────────────┐
    ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────┐
│  treatment_target_service_frequencies (Children)    │
├─────────────────────────────────────────────────────┤
│ service: Resiliency │ service: RTW │ service: NULL │
│ sessions: 5         │ sessions: 10 │ sessions: 20  │
│ freq: [1, 4]        │ freq: [1,5,10]│ freq: [1,5,10,15,20] │
└─────────────────────────────────────────────────────┘
```

---

## Base URL

```
/api/treatment-target-templates
```

---

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Template CRUD Endpoints

### 1. Get All Templates

Retrieves all active templates with their service frequencies.

**Request:**

```http
GET /api/treatment-target-templates
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Templates retrieved successfully",
  "rec": [
    {
      "id": 1,
      "treatment_target": "Anxiety",
      "form_name": "GAD-7",
      "purpose": "Measure anxiety severity",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "service_frequencies": [
        {
          "id": 1,
          "template_id": 1,
          "service_ref_id": 1,
          "nbr_of_sessions": 5,
          "sessions": [1, 4],
          "service_template": {
            "template_service_id": 1,
            "service_name": "Resiliency",
            "service_code": "RES",
            "nbr_of_sessions": 5
          }
        },
        {
          "id": 2,
          "template_id": 1,
          "service_ref_id": 2,
          "nbr_of_sessions": 10,
          "sessions": [1, 5, 10],
          "service_template": {
            "template_service_id": 2,
            "service_name": "RTW Ext",
            "service_code": "RTW_EXT",
            "nbr_of_sessions": 10
          }
        }
      ]
    }
  ]
}
```

---

### 2. Get Template by ID

Retrieves a specific template by its ID.

**Request:**

```http
GET /api/treatment-target-templates/:id
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Template ID |

**Response (200 OK):**

```json
{
  "message": "Template retrieved successfully",
  "rec": {
    "id": 1,
    "treatment_target": "Anxiety",
    "form_name": "GAD-7",
    "purpose": "Measure anxiety severity",
    "is_active": true,
    "service_frequencies": [...]
  }
}
```

**Response (404 Not Found):**

```json
{
  "message": "Template not found",
  "error": -1
}
```

---

### 3. Get Templates by Treatment Target

Retrieves all templates for a specific treatment target.

**Request:**

```http
GET /api/treatment-target-templates/by-treatment-target?treatment_target=Anxiety
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `treatment_target` | string | Yes | Treatment target name |

**Response (200 OK):**

```json
{
  "message": "Templates retrieved successfully",
  "rec": [
    {
      "id": 1,
      "treatment_target": "Anxiety",
      "form_name": "GAD-7",
      "service_frequencies": [...]
    },
    {
      "id": 2,
      "treatment_target": "Anxiety",
      "form_name": "WHODAS",
      "service_frequencies": [...]
    }
  ]
}
```

---

### 4. Lookup Template by Treatment Target and Form Name

Retrieves a specific template by treatment target and form name combination.

**Request:**

```http
GET /api/treatment-target-templates/lookup?treatment_target=Anxiety&form_name=GAD-7
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `treatment_target` | string | Yes | Treatment target name |
| `form_name` | string | Yes | Form/tool name |

**Response (200 OK):**

```json
{
  "message": "Template retrieved successfully",
  "rec": {
    "id": 1,
    "treatment_target": "Anxiety",
    "form_name": "GAD-7",
    "purpose": "Measure anxiety severity",
    "service_frequencies": [...]
  }
}
```

---

### 5. Create Template

Creates a new template (without service frequencies).

**Request:**

```http
POST /api/treatment-target-templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "treatment_target": "Anxiety",
  "form_name": "GAD-7",
  "purpose": "Measure anxiety severity",
  "is_active": true
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `treatment_target` | string | Yes | Treatment target name |
| `form_name` | string | Yes | Form/tool name |
| `purpose` | string | No | Purpose description |
| `is_active` | boolean | No | Active status (default: true) |

**Response (201 Created):**

```json
{
  "message": "Template created successfully",
  "rec": {
    "id": 1,
    "treatment_target": "Anxiety",
    "form_name": "GAD-7",
    "purpose": "Measure anxiety severity",
    "is_active": true,
    "service_frequencies": []
  }
}
```

**Response (400 Bad Request):**

```json
{
  "message": "Template with this treatment_target and form_name already exists",
  "error": -1
}
```

---

### 6. Create Template with Service Frequencies

Creates a new template with service frequencies in one transaction.

**Request:**

```http
POST /api/treatment-target-templates/with-frequencies
Authorization: Bearer <token>
Content-Type: application/json

{
  "treatment_target": "Anxiety",
  "form_name": "GAD-7",
  "purpose": "Measure anxiety severity",
  "is_active": true,
  "service_frequencies": [
    {
      "service_ref_id": 1,
      "nbr_of_sessions": 5,
      "sessions": [1, 4]
    },
    {
      "service_ref_id": 2,
      "nbr_of_sessions": 10,
      "sessions": [1, 5, 10]
    },
    {
      "service_ref_id": null,
      "nbr_of_sessions": 20,
      "sessions": [1, 5, 10, 15, 20]
    }
  ]
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `treatment_target` | string | Yes | Treatment target name |
| `form_name` | string | Yes | Form/tool name |
| `purpose` | string | No | Purpose description |
| `is_active` | boolean | No | Active status (default: true) |
| `service_frequencies` | array | Yes | Array of service frequencies |
| `service_frequencies[].service_ref_id` | number/null | No | Service ID (null for default) |
| `service_frequencies[].nbr_of_sessions` | number | Yes | Number of sessions |
| `service_frequencies[].sessions` | number[] | Yes | Session numbers array |

**Response (201 Created):**

```json
{
  "message": "Template with frequencies created successfully",
  "rec": {
    "id": 1,
    "treatment_target": "Anxiety",
    "form_name": "GAD-7",
    "purpose": "Measure anxiety severity",
    "is_active": true,
    "service_frequencies": [
      {
        "id": 1,
        "template_id": 1,
        "service_ref_id": 1,
        "nbr_of_sessions": 5,
        "sessions": [1, 4],
        "service_template": {
          "template_service_id": 1,
          "service_name": "Resiliency",
          "service_code": "RES"
        }
      },
      ...
    ]
  }
}
```

---

### 7. Update Template

Updates an existing template.

**Request:**

```http
PUT /api/treatment-target-templates/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "purpose": "Updated purpose description",
  "is_active": true
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Template ID (URL param) |

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `treatment_target` | string | No | Treatment target name |
| `form_name` | string | No | Form/tool name |
| `purpose` | string | No | Purpose description |
| `is_active` | boolean | No | Active status |

**Response (200 OK):**

```json
{
  "message": "Template updated successfully",
  "rec": {
    "id": 1,
    "treatment_target": "Anxiety",
    "form_name": "GAD-7",
    "purpose": "Updated purpose description",
    ...
  }
}
```

---

### 8. Delete Template

Deletes a template and all its service frequencies (cascade delete).

**Request:**

```http
DELETE /api/treatment-target-templates/:id
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Template ID |

**Response (200 OK):**

```json
{
  "message": "Template deleted successfully"
}
```

---

## Service Frequency Endpoints

### 9. Get Service Frequencies for a Template

Retrieves all service frequencies for a specific template.

**Request:**

```http
GET /api/treatment-target-templates/:templateId/frequencies
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateId` | number | Yes | Template ID |

**Response (200 OK):**

```json
{
  "message": "Service frequencies retrieved successfully",
  "rec": [
    {
      "id": 1,
      "template_id": 1,
      "service_ref_id": 1,
      "nbr_of_sessions": 5,
      "sessions": [1, 4],
      "service_template": {
        "template_service_id": 1,
        "service_name": "Resiliency",
        "service_code": "RES",
        "nbr_of_sessions": 5
      }
    },
    ...
  ]
}
```

---

### 10. Add Service Frequency to Template

Adds a single service frequency to a template.

**Request:**

```http
POST /api/treatment-target-templates/:templateId/frequencies
Authorization: Bearer <token>
Content-Type: application/json

{
  "service_ref_id": 3,
  "nbr_of_sessions": 6,
  "sessions": [1, 5]
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateId` | number | Yes | Template ID (URL param) |

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `service_ref_id` | number/null | No | Service Template ID (null for default) |
| `nbr_of_sessions` | number | Yes | Number of sessions |
| `sessions` | number[] | Yes | Session numbers array |

**Response (201 Created):**

```json
{
  "message": "Service frequency created successfully",
  "rec": {
    "id": 5,
    "template_id": 1,
    "service_ref_id": 3,
    "nbr_of_sessions": 6,
    "sessions": [1, 5],
    "template": {...},
    "service_template": {...}
  }
}
```

---

### 11. Add Multiple Service Frequencies (Bulk)

Adds multiple service frequencies to a template in one request.

**Request:**

```http
POST /api/treatment-target-templates/:templateId/frequencies/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "frequencies": [
    {
      "service_ref_id": 1,
      "nbr_of_sessions": 5,
      "sessions": [1, 4]
    },
    {
      "service_ref_id": 2,
      "nbr_of_sessions": 10,
      "sessions": [1, 5, 10]
    }
  ]
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateId` | number | Yes | Template ID (URL param) |

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `frequencies` | array | Yes | Array of frequency objects |

**Response (201 Created):**

```json
{
  "message": "2 service frequencies created successfully",
  "rec": {
    "count": 2
  }
}
```

---

### 12. Update Service Frequency

Updates an existing service frequency.

**Request:**

```http
PUT /api/treatment-target-templates/frequencies/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessions": [1, 3, 5]
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Frequency ID (URL param) |

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `service_ref_id` | number/null | No | Service ID |
| `nbr_of_sessions` | number | No | Number of sessions |
| `sessions` | number[] | No | Session numbers array |

**Response (200 OK):**

```json
{
  "message": "Service frequency updated successfully",
  "rec": {
    "id": 1,
    "template_id": 1,
    "service_ref_id": 1,
    "nbr_of_sessions": 5,
    "sessions": [1, 3, 5],
    ...
  }
}
```

---

### 13. Delete Service Frequency

Deletes a service frequency.

**Request:**

```http
DELETE /api/treatment-target-templates/frequencies/:id
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Frequency ID |

**Response (200 OK):**

```json
{
  "message": "Service frequency deleted successfully"
}
```

---

### 14. Get Session Frequency (Lookup)

Gets the session frequency for a specific treatment target, form, service, and session count combination.

**Request:**

```http
GET /api/treatment-target-templates/session-frequency?treatment_target=Anxiety&form_name=GAD-7&service_template_id=1&nbr_of_sessions=5
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `treatment_target` | string | Yes | Treatment target name |
| `form_name` | string | Yes | Form/tool name |
| `service_template_id` | number | Yes | Service Template ID |
| `nbr_of_sessions` | number | Yes | Number of sessions |

**Response (200 OK):**

```json
{
  "message": "Session frequency retrieved successfully",
  "rec": {
    "id": 1,
    "template_id": 1,
    "service_ref_id": 1,
    "nbr_of_sessions": 5,
    "sessions": [1, 4],
    "template": {
      "id": 1,
      "treatment_target": "Anxiety",
      "form_name": "GAD-7"
    },
    "service_template": {
      "template_service_id": 1,
      "service_name": "Resiliency"
    }
  }
}
```

**Response (404 Not Found):**

```json
{
  "message": "Session frequency not found",
  "error": -1
}
```

---

## Legacy Endpoints

These endpoints are maintained for backward compatibility.

### 15. Get Template Configurations (Legacy)

```http
GET /api/treatment-target-templates/templates
```

### 16. Copy Templates to Tenant

```http
POST /api/treatment-target-templates/copy-to-tenant
Content-Type: application/json

{
  "tenant_id": 1
}
```

### 17. Update Tenant Configurations

```http
POST /api/treatment-target-templates/update-tenant
Content-Type: application/json

{
  "tenant_id": 1,
  "overwrite_existing": false
}
```

### 18. Get Tenant Configurations

```http
GET /api/treatment-target-templates/tenant-configurations?tenant_id=1
```

### 19. Compare Tenant with Template

```http
GET /api/treatment-target-templates/compare-tenant?tenant_id=1
```

### 20. Reset Tenant to Template

```http
POST /api/treatment-target-templates/reset-tenant
Content-Type: application/json

{
  "tenant_id": 1
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error description",
  "error": -1
}
```

### Common Error Codes

| HTTP Status | Description                             |
| ----------- | --------------------------------------- |
| 400         | Bad Request - Invalid input data        |
| 401         | Unauthorized - Missing or invalid token |
| 404         | Not Found - Resource doesn't exist      |
| 500         | Internal Server Error                   |

---

## Example: Full Workflow

### Step 1: Create a template with frequencies for "Anxiety" + "GAD-7"

```http
POST /api/treatment-target-templates/with-frequencies
Content-Type: application/json

{
  "treatment_target": "Anxiety",
  "form_name": "GAD-7",
  "purpose": "Measure anxiety severity and track treatment progress",
  "service_frequencies": [
    { "service_ref_id": 1, "nbr_of_sessions": 5, "sessions": [1, 4] },
    { "service_ref_id": 2, "nbr_of_sessions": 10, "sessions": [1, 5, 10] },
    { "service_ref_id": 3, "nbr_of_sessions": 6, "sessions": [1, 5] },
    { "service_ref_id": 3, "nbr_of_sessions": 12, "sessions": [1, 5, 10] },
    { "service_ref_id": 4, "nbr_of_sessions": 18, "sessions": [1, 5, 10, 15] },
    { "service_ref_id": 5, "nbr_of_sessions": 16, "sessions": [1, 5, 10, 15] },
    { "service_ref_id": null, "nbr_of_sessions": 20, "sessions": [1, 5, 10, 15, 20] }
  ]
}
```

### Step 2: Query session frequency for a specific service

```http
GET /api/treatment-target-templates/session-frequency?treatment_target=Anxiety&form_name=GAD-7&service_template_id=1&nbr_of_sessions=5
```

**Response:**

```json
{
  "message": "Session frequency retrieved successfully",
  "rec": {
    "sessions": [1, 4]
  }
}
```

### Step 3: Add a new service frequency

```http
POST /api/treatment-target-templates/1/frequencies
Content-Type: application/json

{
  "service_ref_id": 6,
  "nbr_of_sessions": 8,
  "sessions": [1, 7]
}
```

---

## Database Tables

### treatment_target_session_forms_template

| Column           | Type         | Description           |
| ---------------- | ------------ | --------------------- |
| id               | INT          | Primary key           |
| treatment_target | VARCHAR(255) | Treatment target name |
| form_name        | VARCHAR(255) | Assessment tool name  |
| purpose          | TEXT         | Purpose description   |
| is_active        | BOOLEAN      | Active status         |
| created_at       | TIMESTAMP    | Creation timestamp    |
| updated_at       | TIMESTAMP    | Last update timestamp |

### treatment_target_service_frequencies

| Column          | Type      | Description                        |
| --------------- | --------- | ---------------------------------- |
| id              | INT       | Primary key                        |
| template_id     | INT       | FK to parent template              |
| service_ref_id  | INT       | FK to service_templates (nullable) |
| nbr_of_sessions | INT       | Number of sessions                 |
| sessions        | JSON      | Session numbers array              |
| created_at      | TIMESTAMP | Creation timestamp                 |
| updated_at      | TIMESTAMP | Last update timestamp              |
