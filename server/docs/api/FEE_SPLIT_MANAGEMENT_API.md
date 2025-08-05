# Fee Split Management API Documentation

## Overview
The Fee Split Management API allows tenants to configure how fees are split between the tenant and counselor. When fee split is enabled, the system allows customizing the percentage allocation between tenant and counselor shares. The API supports both tenant-wide defaults and counselor-specific configurations using the user table with role_id.

## Database Schema
The API uses a dedicated `fee_split_management` table with counselor-specific support via user table:

```sql
CREATE TABLE `fee_split_management` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `counselor_user_id` int(11) DEFAULT NULL,
  `is_fee_split_enabled` tinyint(1) DEFAULT 0,
  `tenant_share_percentage` int(3) DEFAULT 0,
  `counselor_share_percentage` int(3) DEFAULT 100,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status_yn` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_counselor_fee_split` (`tenant_id`, `counselor_user_id`),
  CONSTRAINT `fk_fee_split_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenant` (`tenant_id`),
  CONSTRAINT `fk_fee_split_counselor_user` FOREIGN KEY (`counselor_user_id`) REFERENCES `user` (`user_id`)
);
```

## Base URL
```
/api/fee-split-management
```

## Authentication
All endpoints require authentication. Include the authentication token in the request headers.

## Endpoints

### 1. Get Fee Split Configuration
**GET** `/api/fee-split-management/configuration`

Retrieves the default configuration and all counselor-specific configurations for a tenant.

#### Query Parameters
- `tenant_id` (required): The ID of the tenant

#### Response Structure
```json
{
  "success": true,
  "data": {
    "default_configuration": {
      "is_fee_split_enabled": false,
      "tenant_share_percentage": 0,
      "counselor_share_percentage": 100,
      "counselor_user_id": null
    },
    "counselor_specific_configurations": [
      {
        "is_fee_split_enabled": true,
        "tenant_share_percentage": 30,
        "counselor_share_percentage": 70,
        "counselor_user_id": 5,
        "counselor_info": {
          "user_id": 5,
          "name": "John Doe",
          "email": "john.doe@example.com"
        }
      },
      {
        "is_fee_split_enabled": false,
        "tenant_share_percentage": 0,
        "counselor_share_percentage": 100,
        "counselor_user_id": 6,
        "counselor_info": {
          "user_id": 6,
          "name": "Jane Smith",
          "email": "jane.smith@example.com"
        }
      }
    ]
  }
}
```

#### Response Behavior
- **Always returns all counselors** for the tenant (role_id = 2)
- **Default configuration**: Used when no counselor-specific config exists
- **Counselor-specific configurations**: Array of all counselors with their configs
- **Fallback logic**: If counselor has no specific config, uses default values
- **Counselor info**: Includes basic counselor details (name, email, etc.)

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/fee-split-management/configuration?tenant_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Example Responses

**Scenario 1: 2 Counselors, 1 has specific config**
```json
{
  "success": true,
  "data": {
    "default_configuration": {
      "is_fee_split_enabled": true,
      "tenant_share_percentage": 30,
      "counselor_share_percentage": 70,
      "counselor_user_id": null
    },
    "counselor_specific_configurations": [
      {
        "is_fee_split_enabled": true,
        "tenant_share_percentage": 25,
        "counselor_share_percentage": 75,
        "counselor_user_id": 5,
        "counselor_info": {
          "user_id": 5,
          "name": "John Doe",
          "email": "john.doe@example.com"
        }
      },
      {
        "is_fee_split_enabled": true,
        "tenant_share_percentage": 30,
        "counselor_share_percentage": 70,
        "counselor_user_id": 6,
        "counselor_info": {
          "user_id": 6,
          "name": "Jane Smith",
          "email": "jane.smith@example.com"
        }
      }
    ]
  }
}
```

**Scenario 2: 3 Counselors, none have specific configs**
```json
{
  "success": true,
  "data": {
    "default_configuration": {
      "is_fee_split_enabled": false,
      "tenant_share_percentage": 0,
      "counselor_share_percentage": 100,
      "counselor_user_id": null
    },
    "counselor_specific_configurations": [
      {
        "is_fee_split_enabled": false,
        "tenant_share_percentage": 0,
        "counselor_share_percentage": 100,
        "counselor_user_id": 5,
        "counselor_info": {
          "user_id": 5,
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com"
        }
      },
      {
        "is_fee_split_enabled": false,
        "tenant_share_percentage": 0,
        "counselor_share_percentage": 100,
        "counselor_user_id": 6,
        "counselor_info": {
          "user_id": 6,
          "first_name": "Jane",
          "last_name": "Smith",
          "email": "jane.smith@example.com"
        }
      },
      {
        "is_fee_split_enabled": false,
        "tenant_share_percentage": 0,
        "counselor_share_percentage": 100,
        "counselor_user_id": 7,
        "counselor_info": {
          "user_id": 7,
          "name": "Bob Johnson",
          "email": "bob.johnson@example.com"
        }
      }
    ]
  }
}
```

---

### 2. Create Fee Split Configuration
**POST** `/api/fee-split-management/configuration`

Creates a new fee split configuration for a tenant or counselor.

#### Request Body
```json
{
  "tenant_id": 1,
  "counselor_user_id": 5,
  "is_fee_split_enabled": true,
  "tenant_share_percentage": 30,
  "counselor_share_percentage": 70
}
```

#### Validation Rules
- `tenant_id` (required): Must be a valid tenant ID
- `counselor_user_id` (optional): Must be a valid user ID with counselor role if provided
- `is_fee_split_enabled` (required): Must be a boolean value
- `tenant_share_percentage` (required when enabled): Must be between 0-100
- `counselor_share_percentage` (required when enabled): Must be between 0-100
- When `is_fee_split_enabled` is true, the sum of percentages must equal 100
- Configuration must not already exist for the tenant/counselor combination

#### Response
```json
{
  "success": true,
  "message": "Fee split configuration created successfully",
  "data": {
    "id": 1,
    "is_fee_split_enabled": true,
    "tenant_share_percentage": 30,
    "counselor_share_percentage": 70,
    "counselor_user_id": 5
  }
}
```

#### Example Requests
```bash
# Create tenant-wide configuration
curl -X POST "http://localhost:5000/api/fee-split-management/configuration" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tenant_id": 1,
    "is_fee_split_enabled": true,
    "tenant_share_percentage": 30,
    "counselor_share_percentage": 70
  }'

# Create counselor-specific configuration
curl -X POST "http://localhost:5000/api/fee-split-management/configuration" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tenant_id": 1,
    "counselor_user_id": 5,
    "is_fee_split_enabled": true,
    "tenant_share_percentage": 25,
    "counselor_share_percentage": 75
  }'
```

---

### 3. Update Fee Split Configuration
**PUT** `/api/fee-split-management/configuration`

Updates the fee split configuration for a tenant or counselor.

#### Request Body
```json
{
  "tenant_id": 1,
  "counselor_user_id": 5,
  "is_fee_split_enabled": true,
  "tenant_share_percentage": 30,
  "counselor_share_percentage": 70
}
```

#### Validation Rules
- `tenant_id` (required): Must be a valid tenant ID
- `counselor_user_id` (optional): Must be a valid user ID with counselor role if provided
- `is_fee_split_enabled` (required): Must be a boolean value
- `tenant_share_percentage` (required when enabled): Must be between 0-100
- `counselor_share_percentage` (required when enabled): Must be between 0-100
- When `is_fee_split_enabled` is true, the sum of percentages must equal 100

#### Response
```json
{
  "success": true,
  "message": "Fee split configuration updated successfully",
  "data": {
    "is_fee_split_enabled": true,
    "tenant_share_percentage": 30,
    "counselor_share_percentage": 70,
    "counselor_user_id": 5
  }
}
```

#### Example Requests
```bash
# Update tenant-wide configuration
curl -X PUT "http://localhost:5000/api/fee-split-management/configuration" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tenant_id": 1,
    "is_fee_split_enabled": true,
    "tenant_share_percentage": 30,
    "counselor_share_percentage": 70
  }'

# Update counselor-specific configuration
curl -X PUT "http://localhost:5000/api/fee-split-management/configuration" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tenant_id": 1,
    "counselor_user_id": 5,
    "is_fee_split_enabled": true,
    "tenant_share_percentage": 25,
    "counselor_share_percentage": 75
  }'
```

---

### 3. Check if Fee Split is Enabled
**GET** `/api/fee-split-management/enabled`

Quick check to see if fee split is enabled for a tenant or counselor.

#### Query Parameters
- `tenant_id` (required): The ID of the tenant
- `counselor_user_id` (optional): The ID of the counselor user

#### Response
```json
{
  "success": true,
  "is_fee_split_enabled": false
}
```

#### Example Requests
```bash
# Check tenant-wide setting
curl -X GET "http://localhost:5000/api/fee-split-management/enabled?tenant_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check counselor-specific setting
curl -X GET "http://localhost:5000/api/fee-split-management/enabled?tenant_id=1&counselor_user_id=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Get Fee Split Percentages
**GET** `/api/fee-split-management/percentages`

Retrieves the current fee split percentages for a tenant or counselor.

#### Query Parameters
- `tenant_id` (required): The ID of the tenant
- `counselor_user_id` (optional): The ID of the counselor user

#### Response
```json
{
  "success": true,
  "data": {
    "tenant_share_percentage": 0,
    "counselor_share_percentage": 100
  }
}
```

#### Example Requests
```bash
# Get tenant-wide percentages
curl -X GET "http://localhost:5000/api/fee-split-management/percentages?tenant_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get counselor-specific percentages
curl -X GET "http://localhost:5000/api/fee-split-management/percentages?tenant_id=1&counselor_user_id=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Validate Fee Split Configuration
**POST** `/api/fee-split-management/validate`

Validates a fee split configuration without saving it.

#### Request Body
```json
{
  "tenant_id": 1,
  "counselor_user_id": 5,
  "is_fee_split_enabled": true,
  "tenant_share_percentage": 30,
  "counselor_share_percentage": 70
}
```

#### Response
```json
{
  "success": true,
  "message": "Fee split configuration is valid"
}
```

#### Example Request
```bash
curl -X POST "http://localhost:5000/api/fee-split-management/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tenant_id": 1,
    "counselor_user_id": 5,
    "is_fee_split_enabled": true,
    "tenant_share_percentage": 30,
    "counselor_share_percentage": 70
  }'
```

---

### 6. Get All Fee Split Configurations (Admin)
**GET** `/api/fee-split-management/all`

Retrieves all fee split configurations across all tenants. Admin access required.

#### Query Parameters
- `tenant_id` (optional): Filter by specific tenant ID

#### Response
```json
{
  "success": true,
  "data": [
    {
      "tenant_id": 1,
      "counselor_user_id": null,
      "is_fee_split_enabled": true,
      "tenant_share_percentage": 30,
      "counselor_share_percentage": 70,
      "created_at": "2024-12-01T10:00:00.000Z",
      "updated_at": "2024-12-01T10:00:00.000Z"
    },
    {
      "tenant_id": 1,
      "counselor_user_id": 5,
      "is_fee_split_enabled": true,
      "tenant_share_percentage": 25,
      "counselor_share_percentage": 75,
      "created_at": "2024-12-01T10:00:00.000Z",
      "updated_at": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

#### Example Requests
```bash
# Get all configurations
curl -X GET "http://localhost:5000/api/fee-split-management/all" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get configurations for specific tenant
curl -X GET "http://localhost:5000/api/fee-split-management/all?tenant_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. Get Counselor-Specific Configurations
**GET** `/api/fee-split-management/counselor-configurations`

Retrieves all counselor-specific configurations for a tenant.

#### Query Parameters
- `tenant_id` (required): The ID of the tenant

#### Response
```json
{
  "success": true,
  "data": [
    {
      "counselor_user_id": 5,
      "is_fee_split_enabled": true,
      "tenant_share_percentage": 25,
      "counselor_share_percentage": 75,
      "created_at": "2024-12-01T10:00:00.000Z",
      "updated_at": "2024-12-01T10:00:00.000Z"
    },
    {
      "counselor_user_id": 8,
      "is_fee_split_enabled": false,
      "tenant_share_percentage": 0,
      "counselor_share_percentage": 100,
      "created_at": "2024-12-01T10:00:00.000Z",
      "updated_at": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/fee-split-management/counselor-configurations?tenant_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. Get Counselors by Tenant
**GET** `/api/fee-split-management/counselors`

Retrieves all counselors (users with counselor role) for a tenant.

#### Query Parameters
- `tenant_id` (required): The ID of the tenant

#### Response
```json
{
  "success": true,
  "data": [
    {
      "user_id": 5,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    },
    {
      "user_id": 8,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com"
    }
  ]
}
```

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/fee-split-management/counselors?tenant_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 9. Delete Fee Split Configuration
**DELETE** `/api/fee-split-management/configuration/:tenant_id/:counselor_user_id?`

Soft deletes a fee split configuration for a tenant or counselor.

#### Path Parameters
- `tenant_id` (required): The ID of the tenant
- `counselor_user_id` (optional): The ID of the counselor user

#### Response
```json
{
  "success": true,
  "message": "Fee split configuration deleted successfully"
}
```

#### Example Requests
```bash
# Delete tenant-wide configuration
curl -X DELETE "http://localhost:5000/api/fee-split-management/configuration/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete counselor-specific configuration
curl -X DELETE "http://localhost:5000/api/fee-split-management/configuration/1/5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Tenant ID is required"
}
```

### 400 Bad Request - Validation Error
```json
{
  "message": "Tenant and counselor share percentages must sum to 100% when fee split is enabled"
}
```

### 400 Bad Request - Service Error
```json
{
  "message": "Error updating fee split configuration",
  "error": -1
}
```

---

## Business Logic

### Configuration Hierarchy
1. **Counselor-Specific**: When `counselor_user_id` is provided, uses counselor-specific configuration
2. **Tenant-Wide Default**: When `counselor_user_id` is null, uses tenant-wide default
3. **System Default**: When no configuration exists, defaults to 0% tenant, 100% counselor

### Default Configuration
- When fee split is disabled (`is_fee_split_enabled: false`):
  - `tenant_share_percentage`: 0
  - `counselor_share_percentage`: 100
  - System defaults to full fee allocation to counselor

### When Fee Split is Enabled
- `tenant_share_percentage` + `counselor_share_percentage` must equal 100
- Both percentages must be between 0 and 100
- The configuration is stored in the dedicated `fee_split_management` table

### Data Storage
The fee split configuration is stored in the `fee_split_management` table:
- `tenant_id`: The tenant identifier (required)
- `counselor_user_id`: The counselor user identifier (optional, null for tenant-wide)
- `is_fee_split_enabled`: Boolean flag for feature enablement
- `tenant_share_percentage`: Integer 0-100
- `counselor_share_percentage`: Integer 0-100
- `status_yn`: Active status flag (soft delete support)

### Counselor Identification
- Counselors are identified as users with `role_id = 2` (counselor role)
- The system queries the `user` table to find counselors for a tenant
- Counselor-specific configurations reference the `user_id` from the user table

---

## Integration Notes

### Frontend Integration
1. Use the `/configuration` endpoint to load the current settings
2. Use the `/validate` endpoint to validate user input before saving
3. Use the `/configuration` PUT endpoint to save changes
4. Use the `/enabled` endpoint for quick status checks
5. Use the `/counselor-configurations` endpoint to get all counselor-specific settings
6. Use the `/counselors` endpoint to get available counselors for a tenant

### Default Behavior
- New tenants will have fee split disabled by default
- When disabled, the system assumes 100% allocation to counselor
- The UI should hide percentage fields when fee split is disabled
- The UI should show percentage fields and validate sum=100% when enabled
- Counselor-specific configurations override tenant-wide defaults

### Database Migration
Run the migration to create the table and set up default configurations:
```bash
mysql -u username -p database_name < migrations/fee_split_management.sql
``` 