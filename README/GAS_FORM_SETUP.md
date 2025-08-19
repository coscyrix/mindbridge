# GAS Form Automatic Sending Setup

This document explains how to set up the GAS (Goal Attainment Scaling) form to be automatically sent when sessions are completed.

## Overview

The GAS form will be automatically sent to clients via email when:
1. A session is marked as "SHOW" (completed)
2. The session has the GAS form assigned to it
3. The form hasn't been sent before for that session

## Setup Steps

### 1. Run the Database Migration

Execute the migration to add the GAS form to the forms table:

```bash
# Run the migration
mysql -u your_username -p your_database < server/migrations/add_gas_form.sql
```

### 2. Run the Setup Script

Execute the setup script to configure the GAS form:

```bash
cd server
node scripts/setup_gas_form.js
```

### 3. Verify Configuration

The GAS form is configured with:
- **Form ID**: 25
- **Form Code**: GAS
- **Frequency Type**: Static
- **Session Positions**: [1, 3, 5] (sends on sessions 1, 3, and 5)
- **Services**: All services (1-17)

## Configuration Options

### Customizing Session Positions

To change when the GAS form is sent, modify the `session_position` in the forms table:

```sql
UPDATE forms 
SET session_position = '[1, 2, 3]' 
WHERE form_id = 25;
```

### Customizing Services

To restrict which services get the GAS form, modify the `svc_ids`:

```sql
UPDATE forms 
SET svc_ids = '[1, 2, 3]' 
WHERE form_id = 25;
```

## How It Works

1. **Session Creation**: When a therapy request is created, forms are automatically assigned to sessions based on the `session_position` configuration.

2. **Session Completion**: When a counselor marks a session as "SHOW", the system:
   - Checks if the session has forms assigned
   - Verifies forms haven't been sent before
   - Sends email notifications with form links

3. **Email Template**: The GAS form uses the standard treatment tools email template with a link to complete the form.

## Email Template

The GAS form email includes:
- Personalized greeting with client name
- Form name (GAS)
- Direct link to complete the form
- Form parameters (form_id, client_id, session_id, target_outcome_id)

## Client Target Outcome Tracking

The GAS form automatically tracks the client's target outcome when submitted:
- Retrieves the client's current target outcome from the `user_target_outcome` table
- Stores the target outcome ID in the `feedback_gas` table
- Links the form submission to the specific treatment goal the client is working on
- Enables analysis of progress against specific target outcomes

## Testing

To test the automatic sending:

1. Create a therapy request with a service that includes the GAS form
2. Mark the first session as "SHOW"
3. Check that the client receives an email with the GAS form link
4. Verify the form can be completed and submitted

## Troubleshooting

### Form Not Being Sent

1. Check if the form exists in the forms table:
   ```sql
   SELECT * FROM forms WHERE form_id = 25;
   ```

2. Verify the session has forms assigned:
   ```sql
   SELECT forms_array FROM session WHERE session_id = YOUR_SESSION_ID;
   ```

3. Check if forms were already sent:
   ```sql
   SELECT * FROM user_forms WHERE session_id = YOUR_SESSION_ID AND form_id = 25;
   ```

### Email Not Being Sent

1. Check email configuration in environment variables
2. Verify the session status is "SHOW"
3. Check server logs for email errors

## Form ID Reference

- **GAS Form**: 25
- **Attendance Form**: 24
- **Consent Form**: 23
- **Other forms**: See feedback.js for complete list

## Environment Variables

Ensure these environment variables are set:
- `BASE_URL`: Application base URL
- `FORMS`: Forms path
- `MYSQL_DATABASE`: Database name 