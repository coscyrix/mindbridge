# Treatment Target Session Forms Template API Documentation

## Overview
The Treatment Target Session Forms Template API provides functionality to manage and copy treatment target form configurations across tenants. This module ensures that new tenants automatically get all the necessary form configurations when they are added to the system.

## Base URL
```
/api/treatment-target-templates
```

## Endpoints

### 1. Get Template Configurations
Retrieves all template configurations (where `tenant_id` is null).

**Endpoint:** `GET /api/treatment-target-templates/templates`

**Description:** Returns all template configurations that serve as the master copy for new tenants.

**Response:**
```json
{
  "message": "Template configurations retrieved successfully",
  "rec": [
    {
      "id": 1,
      "treatment_target": "Anxiety",
      "form_name": "GAD-7",
      "service_name": null,
      "purpose": "Measure anxiety severity and track treatment progress",
      "sessions": "[1, 5, 10, 15, 20]",
      "tenant_id": null,
      "created_at": "2025-08-06 17:40:07",
      "updated_at": "2025-08-06 17:40:07"
    }
  ]
}
```

### 2. Copy Template Configurations to New Tenant
Copies all template configurations to a new tenant.

**Endpoint:** `POST /api/treatment-target-templates/copy-to-tenant`

**Description:** Creates a complete copy of all template configurations for a new tenant. This should be called when a new tenant is added to the system.

**Request Body:**
```json
{
  "tenant_id": 8
}
```

**Response:**
```json
{
  "message": "Successfully copied 12 template configurations to tenant 8",
  "rec": {
    "tenant_id": 8,
    "configurations_copied": 12,
    "configurations": [...]
  }
}
```

**Error Response (if tenant already has configurations):**
```json
{
  "message": "Tenant already has treatment target configurations. Use updateTemplateConfigurationsForTenant to update existing configurations.",
  "error": -1
}
```

### 3. Update Existing Tenant Configurations
Updates existing tenant configurations with the latest template configurations.

**Endpoint:** `POST /api/treatment-target-templates/update-tenant`

**Description:** Updates existing tenant configurations to match the latest template configurations. Can add missing configurations and optionally overwrite existing ones.

**Request Body:**
```json
{
  "tenant_id": 7,
  "overwrite_existing": false
}
```

**Parameters:**
- `tenant_id` (required): The tenant ID to update
- `overwrite_existing` (optional): Whether to overwrite existing configurations (default: false)

**Response:**
```json
{
  "message": "Successfully updated tenant 7 configurations",
  "rec": {
    "tenant_id": 7,
    "configurations_updated": 2,
    "configurations_inserted": 3,
    "configurations_skipped": 7,
    "total_template_configurations": 12
  }
}
```

### 4. Get Tenant Configurations
Retrieves all configurations for a specific tenant.

**Endpoint:** `GET /api/treatment-target-templates/tenant-configurations?tenant_id=7`

**Description:** Returns all treatment target form configurations for a specific tenant.

**Query Parameters:**
- `tenant_id` (required): The tenant ID

**Response:**
```json
{
  "message": "Tenant configurations retrieved successfully",
  "rec": [
    {
      "id": 15,
      "treatment_target": "Depression",
      "form_name": "PHQ-9",
      "service_name": null,
      "purpose": "Measure depression severity and monitor treatment response",
      "sessions": "[1, 5, 10, 15, 20]",
      "tenant_id": 7,
      "created_at": "2025-08-19 08:05:43",
      "updated_at": "2025-08-19 08:05:43"
    }
  ]
}
```

### 5. Compare Tenant with Template
Compares tenant configurations with template configurations to identify differences.

**Endpoint:** `GET /api/treatment-target-templates/compare-tenant?tenant_id=7`

**Description:** Provides a detailed comparison between tenant configurations and template configurations, identifying missing, outdated, and up-to-date configurations.

**Query Parameters:**
- `tenant_id` (required): The tenant ID

**Response:**
```json
{
  "message": "Configuration comparison completed",
  "rec": {
    "tenant_id": 7,
    "total_template_configurations": 12,
    "total_tenant_configurations": 10,
    "missing_configurations": [
      {
        "treatment_target": "PTSD",
        "form_name": "PCL-5",
        "purpose": "Assess PTSD symptoms and treatment progress",
        "sessions": "[1, 5, 10, 15, 20]"
      }
    ],
    "outdated_configurations": [
      {
        "treatment_target": "Anxiety",
        "form_name": "GAD-7",
        "template_purpose": "Updated purpose text",
        "tenant_purpose": "Old purpose text",
        "template_sessions": "[1, 5, 10, 15, 20]",
        "tenant_sessions": "[1, 5, 10]"
      }
    ],
    "up_to_date_configurations": [
      {
        "treatment_target": "Depression",
        "form_name": "PHQ-9"
      }
    ],
    "summary": {
      "missing_count": 1,
      "outdated_count": 1,
      "up_to_date_count": 8
    }
  }
}
```

### 6. Reset Tenant Configurations to Template
Completely resets tenant configurations to match the template exactly.

**Endpoint:** `POST /api/treatment-target-templates/reset-tenant`

**Description:** Deletes all existing tenant configurations and creates a fresh copy from the template. Use with caution as this will overwrite any customizations.

**Request Body:**
```json
{
  "tenant_id": 7
}
```

**Response:**
```json
{
  "message": "Successfully reset tenant 7 configurations to template",
  "rec": {
    "tenant_id": 7,
    "configurations_deleted": 10,
    "configurations_copied": 12
  }
}
```

## Usage Examples

### Setting up a new tenant:
```bash
# 1. Copy template configurations to new tenant
curl -X POST http://localhost:5000/api/treatment-target-templates/copy-to-tenant \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": 8}'

# 2. Verify the copy was successful
curl -X GET "http://localhost:5000/api/treatment-target-templates/tenant-configurations?tenant_id=8"
```

### Updating existing tenant:
```bash
# 1. Compare tenant with template to see what needs updating
curl -X GET "http://localhost:5000/api/treatment-target-templates/compare-tenant?tenant_id=7"

# 2. Update tenant configurations (add missing, don't overwrite existing)
curl -X POST http://localhost:5000/api/treatment-target-templates/update-tenant \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": 7, "overwrite_existing": false}'
```

### Complete reset of tenant configurations:
```bash
# Reset tenant to exactly match template (use with caution)
curl -X POST http://localhost:5000/api/treatment-target-templates/reset-tenant \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": 7}'
```

## Error Handling

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "message": "tenant_id is required",
  "error": -1
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error",
  "error": -1
}
```

## Database Schema

The module works with the existing `treatment_target_feedback_config` table:

```sql
CREATE TABLE treatment_target_feedback_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  treatment_target VARCHAR(255) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NULL,
  purpose TEXT,
  sessions JSON,
  tenant_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id) ON DELETE CASCADE
);
```

**Key Points:**
- Template configurations have `tenant_id = NULL`
- Tenant-specific configurations have `tenant_id = <tenant_id>`
- The module ensures data integrity and prevents duplicate configurations
