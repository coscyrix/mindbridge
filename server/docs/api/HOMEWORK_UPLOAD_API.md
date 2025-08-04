# Homework Upload API Documentation

## Overview
This document describes the homework upload functionality with tenant-specific configuration controls. The system allows uploading homework files linked to sessions with the ability to enable/disable this feature per tenant.

## Database Schema

### Tenant Configuration Table
```sql
CREATE TABLE `tenant_configuration` (
  `config_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `feature_name` varchar(100) NOT NULL,
  `feature_value` text,
  `is_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status_yn` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `unique_tenant_feature` (`tenant_id`, `feature_name`)
);
```

### Homework Table (Updated)
```sql
ALTER TABLE `homework` 
ADD COLUMN `homework_file_path` varchar(500) DEFAULT NULL,
ADD COLUMN `session_id` int(11) DEFAULT NULL,
ADD COLUMN `file_size` bigint(20) DEFAULT NULL,
ADD COLUMN `file_type` varchar(100) DEFAULT NULL;
```

## API Endpoints

### 1. Homework Upload

#### POST /api/homework
Upload homework file linked to a session.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `homework_title` (required): Title of the homework
- `tenant_id` (required): Tenant ID
- `session_id` (optional): Session ID to link the homework
- `email` (optional): Email for sending homework attachment
- `homework_file` (optional): File upload

**Example Request:**
```bash
curl -X POST /api/homework \
  -H "Authorization: Bearer <token>" \
  -F "homework_title=Weekly Assignment" \
  -F "tenant_id=123" \
  -F "session_id=456" \
  -F "email=client@example.com" \
  -F "homework_file=@assignment.pdf"
```

**Note:** Files are stored locally and accessible via static URLs like `/uploads/homework/homework_file-1234567890-assignment.pdf`

**Success Response (200):**
```json
{
  "message": "Homework created successfully",
  "rec": [1]
}
```

**Error Response (400):**
```json
{
  "message": "Homework upload is disabled for this tenant",
  "error": -1
}
```

### 2. Get Homework by Session ID

#### GET /api/homework/session/:session_id
Retrieve all homework files for a specific session.

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -X GET /api/homework/session/456 \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**
```json
[
  {
    "homework_id": 1,
    "homework_title": "Weekly Assignment",
    "homework_filename": "assignment.pdf",
    "homework_file_path": "uploads/homework/homework_file-1234567890-assignment.pdf",
    "session_id": 456,
    "tenant_id": 123,
    "file_size": 1024000,
    "file_type": "application/pdf",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**File Access:** The file can be accessed via: `https://your-domain.com/uploads/homework/homework_file-1234567890-assignment.pdf`

### 3. Get Homework by ID

#### GET /api/homework/:homework_id
Retrieve a specific homework by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -X GET /api/homework/1 \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**
```json
{
  "homework_id": 1,
  "homework_title": "Weekly Assignment",
  "homework_filename": "assignment.pdf",
  "homework_file_path": "uploads/homework/homework_file-1234567890-assignment.pdf",
  "session_id": 456,
  "tenant_id": 123,
  "file_size": 1024000,
  "file_type": "application/pdf",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**File Access:** The file can be accessed via: `https://your-domain.com/uploads/homework/homework_file-1234567890-assignment.pdf`

### 4. Delete Homework

#### DELETE /api/homework/:homework_id
Delete a homework file and its associated file.

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -X DELETE /api/homework/1 \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**
```json
{
  "message": "Homework deleted successfully"
}
```

## Tenant Configuration API

### 1. Get Tenant Configuration

#### GET /api/tenant-configuration
Retrieve tenant configuration settings.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `tenant_id` (required): Tenant ID
- `feature_name` (optional): Specific feature name

**Example Request:**
```bash
curl -X GET "/api/tenant-configuration?tenant_id=123&feature_name=homework_upload_enabled" \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**
```json
[
  {
    "config_id": 1,
    "tenant_id": 123,
    "feature_name": "homework_upload_enabled",
    "feature_value": "true",
    "is_enabled": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### 2. Update Tenant Configuration

#### PUT /api/tenant-configuration
Update tenant configuration settings.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tenant_id": 123,
  "feature_name": "homework_upload_enabled",
  "feature_value": "true",
  "is_enabled": true
}
```

**Example Request:**
```bash
curl -X PUT /api/tenant-configuration \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": 123,
    "feature_name": "homework_upload_enabled",
    "is_enabled": false
  }'
```

**Success Response (200):**
```json
{
  "message": "Tenant configuration updated successfully"
}
```

### 3. Check Feature Status

#### GET /api/tenant-configuration/feature-enabled
Check if a specific feature is enabled for a tenant.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `tenant_id` (required): Tenant ID
- `feature_name` (required): Feature name

**Example Request:**
```bash
curl -X GET "/api/tenant-configuration/feature-enabled?tenant_id=123&feature_name=homework_upload_enabled" \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**
```json
{
  "is_enabled": true
}
```

### 4. Get Feature Value

#### GET /api/tenant-configuration/feature-value
Get the value of a specific feature for a tenant.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `tenant_id` (required): Tenant ID
- `feature_name` (required): Feature name

**Example Request:**
```bash
curl -X GET "/api/tenant-configuration/feature-value?tenant_id=123&feature_name=homework_upload_enabled" \
  -H "Authorization: Bearer <token>"
```

**Success Response (200):**
```json
{
  "feature_value": "true"
}
```

## File Upload Details

### Supported File Types
- PDF files (application/pdf)
- Image files (image/jpeg, image/png)
- Document files (application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document)

### File Size Limits
- Maximum file size: 10MB

### File Storage
- Files are stored locally in the `uploads/homework/` directory
- File paths are stored in the database for retrieval
- Files are automatically deleted when homework is deleted
- Files are accessible via static URLs: `/uploads/homework/filename.pdf`

### File Access
- Files are served as static assets from the `/uploads` directory
- Direct access: `https://your-domain.com/uploads/homework/filename.pdf`
- No authentication required for file access (public files)
- File paths in database are relative (e.g., `uploads/homework/filename.pdf`)

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "message": "Missing mandatory fields: homework_title, tenant_id",
  "error": -1
}
```

**400 Bad Request (Feature Disabled):**
```json
{
  "message": "Homework upload is disabled for this tenant",
  "error": -1
}
```

**500 Internal Server Error:**
```json
{
  "message": "Error saving file",
  "error": -1
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **File Validation**: Files are validated for type and size
3. **Tenant Isolation**: Homework files are isolated by tenant
4. **File Cleanup**: Files are automatically deleted when homework is removed

## Usage Examples

### Enable/Disable Homework Upload for a Tenant

```bash
# Disable homework upload
curl -X PUT /api/tenant-configuration \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": 123,
    "feature_name": "homework_upload_enabled",
    "is_enabled": false
  }'

# Enable homework upload
curl -X PUT /api/tenant-configuration \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": 123,
    "feature_name": "homework_upload_enabled",
    "is_enabled": true
  }'
```

### Upload Homework for a Session

```bash
curl -X POST /api/homework \
  -H "Authorization: Bearer <token>" \
  -F "homework_title=Session 5 Homework" \
  -F "tenant_id=123" \
  -F "session_id=456" \
  -F "email=client@example.com" \
  -F "homework_file=@session5_homework.pdf"
```

### Retrieve Homework for a Session

```bash
curl -X GET /api/homework/session/456 \
  -H "Authorization: Bearer <token>"
```

## Migration

You have several migration options depending on your needs:

### Option 1: Complete System Setup (Recommended)
```bash
# Complete migration - drops existing homework table and creates fresh structure
mysql -u username -p database_name < server/migrations/complete_homework_system.sql
```

### Option 2: Safe Migration (Preserves existing data)
```bash
# Safe migration - adds columns to existing homework table
mysql -u username -p database_name < server/migrations/tenant_configuration_safe.sql
```

### Option 3: Simple Migration
```bash
# Simple migration - basic column addition
mysql -u username -p database_name < server/migrations/tenant_configuration.sql
```

### Option 4: Recreate Homework Table Only
```bash
# Only recreate homework table (if you want to start fresh)
mysql -u username -p database_name < server/migrations/homework_table_recreate.sql
```

### What Each Migration Does:

**Complete System Setup:**
1. Creates the `tenant_configuration` table
2. Drops and recreates the `homework` table with all new columns
3. Sets default homework upload configuration for existing tenants
4. Includes verification queries

**Safe Migration:**
1. Creates the `tenant_configuration` table
2. Safely adds new columns to existing `homework` table
3. Sets default configurations for existing tenants

**Simple Migration:**
1. Creates the `tenant_configuration` table
2. Adds new columns to `homework` table (may fail if columns exist)
3. Sets default configurations

**Recreate Homework Table:**
1. Drops existing `homework` table
2. Creates new `homework` table with all required columns
3. Includes performance indexes

## Automatic Tenant Configuration

When a new tenant is created (via the user profile creation with role_id = 3), the system automatically:

1. Creates the tenant record
2. Creates the `ref_fees` entry
3. **Creates default tenant configurations** including:
   - `homework_upload_enabled` = `true` (enabled by default)

This ensures that all new tenants have the homework upload feature enabled by default, and administrators can later disable it if needed.

### Adding Configurations for Existing Tenants

If you have existing tenants that don't have the homework upload configuration, run the provided script:

```bash
# Make the script executable
chmod +x server/scripts/add_missing_tenant_configs.js

# Run the script
node server/scripts/add_missing_tenant_configs.js
```

This script will:
1. Find all active tenants
2. Check if they have the `homework_upload_enabled` configuration
3. Add the configuration for any tenants that don't have it
4. Set the feature to enabled by default 