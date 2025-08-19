# Fee Split Management Module

## Overview
The Fee Split Management module allows tenants to configure how fees are split between the tenant and counselor. This module provides a complete backend implementation for managing fee split configurations with proper validation and business logic.

## Features
- ✅ Enable/disable fee split functionality
- ✅ Configure tenant and counselor share percentages
- ✅ Real-time validation (percentages must sum to 100%)
- ✅ Default configuration handling
- ✅ Complete API endpoints with authentication
- ✅ Comprehensive error handling
- ✅ Database migration support
- ✅ Dedicated table for fee split management
- ✅ Admin endpoints for bulk operations

## Architecture

### Components
1. **Model** (`models/feeSplitManagement.js`): Database operations and data persistence
2. **Service** (`services/feeSplitManagementService.js`): Business logic and validation
3. **Controller** (`controllers/feeSplitManagementController.js`): API endpoint handlers
4. **Routes** (`routes/feeSplitManagement.js`): Route definitions
5. **Migration** (`migrations/fee_split_management.sql`): Database setup

### Data Flow
```
Frontend → Controller → Service → Model → Database
    ↑                                    ↓
    ← Response ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

## Database Schema

The module uses a dedicated `fee_split_management` table:

```sql
CREATE TABLE `fee_split_management` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `is_fee_split_enabled` tinyint(1) DEFAULT 0,
  `tenant_share_percentage` int(3) DEFAULT 0,
  `counselor_share_percentage` int(3) DEFAULT 100,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status_yn` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_fee_split` (`tenant_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_is_enabled` (`is_fee_split_enabled`),
  CONSTRAINT `fk_fee_split_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenant` (`tenant_id`) ON DELETE CASCADE
);
```

### Table Structure
- `id`: Primary key
- `tenant_id`: References the tenant table (unique constraint)
- `is_fee_split_enabled`: Boolean flag (0=disabled, 1=enabled)
- `tenant_share_percentage`: Integer 0-100
- `counselor_share_percentage`: Integer 0-100
- `created_at`: Record creation timestamp
- `updated_at`: Record update timestamp
- `status_yn`: Active status flag (soft delete support)

## API Endpoints

### Base URL
```
/api/fee-split-management
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/configuration` | Get current fee split configuration |
| PUT | `/configuration` | Update fee split configuration |
| GET | `/enabled` | Check if fee split is enabled |
| GET | `/percentages` | Get current fee split percentages |
| POST | `/validate` | Validate configuration without saving |
| GET | `/all` | Get all configurations (admin) |
| DELETE | `/configuration/:tenant_id` | Delete configuration |

### Authentication
All endpoints require authentication. Include the authentication token in request headers:
```
Authorization: Bearer YOUR_TOKEN
```

## Business Logic

### Default Configuration
- **Fee Split Disabled**: `tenant_share_percentage: 0`, `counselor_share_percentage: 100`
- **Fee Split Enabled**: Custom percentages that must sum to 100%

### Validation Rules
1. `tenant_id` is required for all operations
2. `is_fee_split_enabled` must be a boolean value
3. When enabled, both percentages are required
4. Percentages must be between 0 and 100
5. When enabled, percentages must sum to exactly 100%

### Error Handling
- Comprehensive validation at service layer
- Proper HTTP status codes (400 for validation errors)
- Detailed error messages for debugging
- Graceful fallbacks for missing configurations

## Installation & Setup

### 1. Database Migration
Run the migration to create the table and set up default configurations:
```bash
mysql -u username -p database_name < migrations/fee_split_management.sql
```

### 2. Server Restart
Restart the server to load the new routes:
```bash
npm start
```

### 3. Testing
Run the test script to verify functionality:
```bash
node tests/api/test_fee_split_api.js
```

## Usage Examples

### Frontend Integration

#### 1. Load Configuration
```javascript
const response = await fetch('/api/fee-split-management/configuration?tenant_id=1', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const config = await response.json();
```

#### 2. Update Configuration
```javascript
const updateData = {
  tenant_id: 1,
  is_fee_split_enabled: true,
  tenant_share_percentage: 30,
  counselor_share_percentage: 70
};

const response = await fetch('/api/fee-split-management/configuration', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updateData)
});
```

#### 3. Validate Before Saving
```javascript
const validateData = {
  tenant_id: 1,
  is_fee_split_enabled: true,
  tenant_share_percentage: 30,
  counselor_share_percentage: 70
};

const response = await fetch('/api/fee-split-management/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(validateData)
});
```

#### 4. Admin Operations
```javascript
// Get all configurations
const allConfigs = await fetch('/api/fee-split-management/all', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Delete configuration
const deleteResponse = await fetch('/api/fee-split-management/configuration/1', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Configuration Options

### Environment Variables
No additional environment variables are required. The module uses existing database configuration.

### Default Values
- New tenants: Fee split disabled (100% to counselor)
- Missing configurations: Graceful fallback to defaults
- Error scenarios: Safe defaults to prevent system issues

## Security Considerations

### Authentication
- All endpoints require valid authentication tokens
- Tenant isolation ensures data privacy
- No cross-tenant data access

### Validation
- Input validation at multiple layers
- SQL injection prevention through parameterized queries
- XSS protection through proper JSON handling

### Data Integrity
- Database constraints prevent invalid configurations
- Transaction safety for configuration updates
- Audit trail through timestamps
- Soft delete support for data retention

## Monitoring & Logging

### Logging
The module uses Winston logger for:
- Error tracking
- Debug information
- Performance monitoring

### Error Tracking
- Comprehensive error messages
- Stack traces for debugging
- HTTP status codes for client handling

## Troubleshooting

### Common Issues

#### 1. Configuration Not Found
**Problem**: API returns default values instead of saved configuration
**Solution**: Check if the tenant exists and migration has been run

#### 2. Validation Errors
**Problem**: Percentages don't sum to 100%
**Solution**: Ensure both percentages are provided and sum to exactly 100

#### 3. Authentication Errors
**Problem**: 401 Unauthorized responses
**Solution**: Verify authentication token is valid and included in headers

#### 4. Database Errors
**Problem**: Foreign key constraint violations
**Solution**: Ensure tenant exists before creating fee split configuration

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=fee-split-management
```

## Future Enhancements

### Planned Features
- [ ] Bulk configuration updates
- [ ] Configuration history tracking
- [ ] Advanced validation rules
- [ ] Integration with billing system
- [ ] Configuration templates
- [ ] Audit logging for configuration changes

### Performance Optimizations
- [ ] Caching for frequently accessed configurations
- [ ] Database query optimization
- [ ] Response compression
- [ ] Index optimization

## Support

For issues or questions:
1. Check the API documentation (`docs/api/FEE_SPLIT_MANAGEMENT_API.md`)
2. Review the test script for usage examples
3. Check server logs for error details
4. Verify database migration has been applied

## Contributing

When contributing to this module:
1. Follow the existing code patterns
2. Add comprehensive tests
3. Update documentation
4. Ensure backward compatibility
5. Follow the validation and error handling patterns
6. Test with the dedicated table structure 

## Installation

1. **Run the database migration** to create the fee split management table:
   ```bash
   mysql -u your_username -p your_database < migrations/fee_split_management.sql
   ```

2. **Create default fee split configurations for existing tenants** (optional):
   ```bash
   node scripts/create_default_fee_splits.js
   ```

3. **Restart your server** to load the new routes and controllers.

## Automatic Configuration Creation

The system automatically creates default fee split management entries when:

### **New Tenant Creation**
When a new tenant is created via the `postTenant` method, the system automatically creates a default fee split configuration with:
- `is_fee_split_enabled: false` (disabled by default)
- `tenant_share_percentage: 0` (0% for tenant)
- `counselor_share_percentage: 100` (100% for counselor)
- `counselor_user_id: null` (applies to all counselors)

### **Existing Tenants**
For existing tenants that don't have fee split management entries, you can run the utility script:
```bash
node scripts/create_default_fee_splits.js
```

This script will:
- Find all tenants without fee split management
- Create default configurations for them
- Skip tenants that already have configurations
- Provide a summary of the operation 