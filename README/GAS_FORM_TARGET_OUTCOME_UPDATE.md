# GAS Form Client Target Outcome Integration

## Overview

This update enhances the GAS (Goal Attainment Scaling) form to automatically track and store the client's target outcome ID when the form is submitted. This enables better analysis of client progress against specific treatment goals.

## Changes Made

### 1. Database Schema Updates

#### New Migration: `server/migrations/add_client_target_outcome_to_gas.sql`
- Adds `client_target_outcome_id` column to `feedback_gas` table
- Creates foreign key constraint to `ref_target_outcomes` table
- Adds index for better query performance

#### Updated Migration: `server/migrations/feedback_gas.sql`
- Updated the base table creation to include the new column
- Ensures new deployments will have the correct schema

### 2. Backend Code Changes

#### Updated Model: `server/models/feedback.js`
- Added `UserTargetOutcome` import and initialization
- Modified `postGASFeedback` method to:
  - Use target outcome ID from request if provided, otherwise retrieve from database
  - Store the target outcome ID in the GAS feedback record
  - Handle cases where client has no target outcome assigned

#### Updated Email Model: `server/models/emailTmplt.js`
- Added `UserTargetOutcome` import and initialization
- Modified `sendTreatmentToolEmail` method to:
  - Retrieve client's target outcome ID when generating form emails
  - Pass target outcome ID to email template for inclusion in form links

#### Updated Email Template: `server/utils/emailTmplt.js`
- Modified `treatmentToolsEmail` function to accept target outcome ID parameter
- Updated email template to include target outcome ID in form links

### 3. Frontend Code Changes

#### Updated GAS Form Page: `client/pages/patient-forms/gas.js`
- Modified to extract `target_outcome_id` from URL query parameters
- Pass target outcome ID to GasForm component

#### Updated GAS Form Component: `client/components/Forms/PatientForms/GASForm/index.js`
- Modified to accept `target_outcome_id` as a prop
- Include target outcome ID in form submission payload

### 4. Documentation Updates

#### Updated API Documentation: `server/docs/api/GAS_FORM_API.md`
- Updated database schema documentation
- Added feature description for automatic target outcome tracking
- Updated table structure to include new column
- Added documentation for optional `target_outcome_id` parameter

#### Updated Setup Documentation: `GAS_FORM_SETUP.md`
- Added section explaining client target outcome tracking
- Described how the system automatically links form submissions to treatment goals
- Updated email template documentation to include target outcome ID parameter

### 5. Testing

#### New Test Script: `server/scripts/test_gas_target_outcome.js`
- Verifies database schema changes
- Checks existing data structure
- Validates integration with client target outcomes

## How It Works

1. **Email Generation**: When a session is marked as "SHOW", the system:
   - Checks if the session has GAS forms assigned
   - Retrieves the client's current target outcome ID
   - Generates an email with the target outcome ID included in the form link

2. **Form Submission**: When a client submits a GAS form, the system:
   - Validates the session and prevents duplicate submissions
   - Uses the target outcome ID from the email link (if provided) or retrieves it from database
   - Stores the form data along with the target outcome ID

3. **Data Retrieval**: The system uses `getUserTargetOutcomeLatest()` to get the most recent active target outcome for the client

4. **Storage**: The target outcome ID is stored in the `client_target_outcome_id` column of the `feedback_gas` table

## Benefits

- **Enhanced Analytics**: Link form submissions to specific treatment goals
- **Progress Tracking**: Monitor client progress against their assigned target outcomes
- **Data Integrity**: Maintain referential integrity with foreign key constraints
- **Backward Compatibility**: Existing data remains unaffected

## Deployment Steps

1. **Run Database Migration**:
   ```bash
   mysql -u root -p mindbridge < server/migrations/add_client_target_outcome_to_gas.sql
   ```

2. **Deploy Code Changes**:
   - Update `server/models/feedback.js`
   - Deploy the updated code

3. **Verify Integration**:
   ```bash
   cd server
   node scripts/test_gas_target_outcome.js
   ```

## Database Schema

### Before
```sql
CREATE TABLE feedback_gas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goal VARCHAR(255) NOT NULL,
  total_score INT NOT NULL,
  responses_json JSON NOT NULL,
  feedback_id INT NOT NULL,
  tenant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id) ON DELETE CASCADE
);
```

### After
```sql
CREATE TABLE feedback_gas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goal VARCHAR(255) NOT NULL,
  total_score INT NOT NULL,
  responses_json JSON NOT NULL,
  feedback_id INT NOT NULL,
  tenant_id INT NOT NULL,
  client_target_outcome_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id) ON DELETE CASCADE,
  FOREIGN KEY (client_target_outcome_id) REFERENCES ref_target_outcomes(target_id) ON DELETE SET NULL,
  INDEX idx_feedback_id (feedback_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_client_target_outcome_id (client_target_outcome_id)
);
```

## Testing

To test the integration:

1. Ensure a client has a target outcome assigned
2. Submit a GAS form for that client
3. Verify the `client_target_outcome_id` is populated in the database
4. Run the test script to validate the setup

## Troubleshooting

### Migration Issues
- Ensure database user has ALTER TABLE permissions
- Check for existing foreign key constraints
- Verify `ref_target_outcomes` table exists

### Data Issues
- Check if client has active target outcome in `user_target_outcome` table
- Verify `status_enum = 'y'` for active target outcomes
- Ensure client_id matches user_profile_id in target outcome records

## Future Enhancements

- Add reporting features to analyze progress by target outcome
- Include target outcome information in form submission responses
- Create dashboards showing progress against specific goals
