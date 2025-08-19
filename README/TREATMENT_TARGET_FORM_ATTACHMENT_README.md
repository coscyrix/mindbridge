# Treatment Target Form Attachment

## Overview

The Treatment Target Form Attachment feature extends the existing session form attachment system to support form attachment based on treatment targets in addition to the traditional service-based approach. This allows for more personalized and targeted form scheduling based on the client's specific treatment goals.

## Features

- **Environment Variable Control**: Use `FORM_MODE` environment variable to control form attachment behavior
- **Exclusive Form Modes**: Use either service-based OR treatment target-based forms per session (never both)
- **Automatic Mode Detection**: System automatically detects which form type to use based on availability
- **Service-Based Mode**: Traditional form attachment based on service type (default when no treatment target forms exist)
- **Treatment Target-Based Mode**: Form attachment based on client's treatment target and session numbers (takes precedence when available)
- **Backward Compatibility**: Existing service-based form attachment continues to work exactly as before
- **Treatment Target Configuration**: Configure which forms should be sent at specific session numbers for different treatment targets
- **Multi-Tenant Support**: Support for tenant-specific configurations
- **Flexible Session Scheduling**: Support for various session number patterns and special values
- **Template Management**: Comprehensive template system for managing form configurations across tenants
- **Automatic Tenant Setup**: New tenants automatically receive all treatment target form templates upon creation

## Architecture

### Components

1. **TreatmentTargetFeedbackConfig Model**: Handles treatment target-based form configuration and loading
2. **ThrpyReq Model**: Extended with mode-based form loading capability
3. **Service Layer**: Business logic for form attachment modes
4. **Controller Layer**: API endpoints for form attachment
5. **Database**: Treatment target feedback configuration table

### Database Schema

#### treatment_target_feedback_config Table
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

## API Endpoints

### 1. Load Session Forms with Mode Selection
- **Endpoint**: `POST /api/thrpyReq/load-session-forms`
- **Purpose**: Load session forms using either service-based or treatment target-based mode
- **Authentication**: Required

### 2. Load Session Forms by Treatment Target (Direct)
- **Endpoint**: `POST /api/treatment-target-feedback-config/load-session-forms`
- **Purpose**: Direct endpoint to load session forms based on treatment target configuration
- **Authentication**: Required

## Usage

### Environment Variable Configuration

Set the `FORM_MODE` environment variable in your `.env` file:

```bash
# .env file
FORM_MODE=auto  # auto, service, or treatment_target
```

**Available Options:**
- **`FORM_MODE=auto`** (default) - Automatically detects and uses treatment target forms if they exist, otherwise uses service-based forms
- **`FORM_MODE=service`** - Always uses service-based form attachment (traditional behavior)
- **`FORM_MODE=treatment_target`** - Always uses treatment target-based form attachment (if available)

### Exclusive Form Modes

The system automatically uses **either** service-based **or** treatment target-based forms per session:

### Automatic Mode Detection
```javascript
// The system automatically detects which form type to use based on FORM_MODE:
// - If FORM_MODE=auto and treatment target forms exist → Use treatment target forms
// - If FORM_MODE=auto and no treatment target forms → Use service-based forms
// - If FORM_MODE=service → Always use service-based forms
// - If FORM_MODE=treatment_target → Always use treatment target forms

const response = await api.get('/api/thrpyReq/?req_id=123');
// Response includes form_mode: "treatment_target" or "service"
```

### Manual Form Loading
```javascript
// Load forms using environment variable setting (no mode needed)
const response = await api.post('/api/thrpyReq/load-session-forms', {
  req_id: 123
});
// Backend automatically uses FORM_MODE environment variable
```

### Form Mode Logic

**Environment Variable Control:**
1. **FORM_MODE=auto** → Automatically detects and uses appropriate form type
2. **FORM_MODE=service** → Always uses service-based forms
3. **FORM_MODE=treatment_target** → Always uses treatment target forms (if available)
4. **No Frontend Changes** → Everything controlled by environment variable
5. **Never Both** → Only one form type per session

### Backward Compatibility

**Existing functionality remains unchanged:**
- Service-based form attachment continues to work exactly as before
- No changes to existing APIs or workflows
- Treatment target forms take precedence when available

## Configuration

### Automatic Tenant Setup

When a new tenant is created in the system, the following happens automatically:

1. **Template Copying**: All active treatment target form templates are automatically copied to the new tenant
2. **Default Configurations**: The new tenant receives configurations for:
   - Anxiety: GAD-7, WHODAS forms
   - Depression: PHQ-9, WHODAS forms
   - PTSD: PCL-5, WHODAS forms
   - General Mental Health: GAS, SMART Goals, Consent Form, Attendance forms
3. **Immediate Availability**: Forms are immediately available for use with treatment target-based sessions
4. **Consistency**: All tenants receive the same baseline form configurations
5. **Customization**: Tenants can later modify or add to these configurations as needed

### Manual Treatment Target Configuration

For existing tenants or custom configurations:

1. **Create Configuration**: Use the treatment target feedback config API to create configurations
2. **Define Session Patterns**: Specify which sessions should trigger specific forms
3. **Set Treatment Targets**: Configure forms for specific treatment targets (Anxiety, Depression, etc.)

### Example Configuration
```json
{
  "treatment_target": "Anxiety",
  "form_name": "GAD-7",
  "purpose": "Measure anxiety severity and track treatment progress",
  "sessions": [1, 5, 10, 15, 20],
  "tenant_id": 1
}
```

## Treatment Targets

The system supports the following treatment targets:

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
4. Creates treatment_target_session_forms records for each attached form
5. Integrates with email system for automatic form sending
6. Updates sent status when forms are sent

## Integration Points

### Existing System Integration
- **Treatment Target Session Forms**: Dedicated table for treatment target-based forms
- **User Forms**: Continues to handle service-based forms
- **Sessions**: Updates the same session.forms_array field
- **Authentication**: Uses existing authentication and authorization
- **Tenant Support**: Integrates with existing multi-tenant architecture

### Email Integration
- **Automatic Email Sending**: When sessions are marked as "SHOW", forms are automatically sent
- **Sent Status Tracking**: Updates is_sent and sent_at fields in treatment_target_session_forms table
- **Duplicate Prevention**: Checks if forms have already been sent before sending
- **Email Templates**: Uses the same email templates and delivery mechanisms
- **Form Submission Tracking**: Integrates with existing form submission workflows

## Error Handling

The system provides comprehensive error handling for various scenarios:

- **Missing Required Fields**: Validates all required parameters
- **Invalid Mode**: Ensures mode is either 'service' or 'treatment_target'
- **No Configurations**: Handles cases where no treatment target configurations exist
- **Form Not Found**: Gracefully handles missing form references
- **Database Errors**: Proper error handling for database operations

## Testing

### Test Script
Run the test script to verify the functionality:
```bash
cd server
node scripts/test_treatment_target_form_attachment.js
```

### Manual Testing
1. Create a therapy request
2. Use the API to load forms with treatment target mode
3. Verify forms are attached to the correct sessions
4. Check user_forms records are created properly

## Security Considerations

1. **Authentication**: All endpoints require valid authentication tokens
2. **Authorization**: Users can only access data within their tenant
3. **Input Validation**: All input parameters are validated before processing
4. **SQL Injection Protection**: Uses parameterized queries to prevent SQL injection

## Performance Considerations

1. **Indexing**: Proper database indexes for efficient queries
2. **Batch Operations**: Efficient batch processing for form attachment
3. **Caching**: Consider caching treatment target configurations for better performance
4. **Database Connections**: Proper connection management and cleanup

## Future Enhancements

1. **Dynamic Configuration**: Allow runtime configuration changes
2. **Advanced Scheduling**: Support for more complex session patterns
3. **Analytics**: Track form completion rates by treatment target
4. **Integration**: Better integration with treatment planning systems

## Troubleshooting

### Common Issues

1. **No Forms Attached**: Check if treatment target configurations exist
2. **Wrong Forms Attached**: Verify session numbers in configuration
3. **Database Errors**: Check database connectivity and permissions
4. **Authentication Issues**: Verify token validity and permissions

### Debugging

1. **Enable Logging**: Check server logs for detailed error messages
2. **Database Queries**: Verify data exists in treatment_target_feedback_config table
3. **API Testing**: Use Postman or similar tools to test API endpoints
4. **Configuration Validation**: Ensure form names exist in forms table

## Support

For issues or questions regarding the Treatment Target Form Attachment feature:

1. Check the API documentation in `/server/docs/api/TREATMENT_TARGET_FORM_ATTACHMENT_API.md`
2. Review the test script for usage examples
3. Check server logs for error details
4. Contact the development team for technical support
