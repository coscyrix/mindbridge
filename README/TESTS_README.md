# Test Files for Treatment Target Form Functionality

This folder contains all test scripts and utilities for the treatment target form attachment system.

## Test Scripts

### Core Functionality Tests

- **`test_updated_functions.js`** - Tests the updated functions for treatment target forms:
  - Feedback submission with treatment target forms
  - Reports functionality with treatment target forms
  - Form submission status updates

- **`test_comprehensive_treatment_target.js`** - Comprehensive end-to-end test:
  - Therapy request creation with treatment target forms
  - Session update with form sending
  - Feedback submission
  - Reports functionality

- **`test_session_update.js`** - Tests session update functionality:
  - Updates session to "SHOW" status
  - Verifies treatment target forms are marked as sent

### Database Schema Tests

- **`add_form_submit_column.js`** - Adds `form_submit` column to `treatment_target_session_forms` table
- **`check_and_add_treatment_target_column.js`** - Adds `treatment_target` column to `thrpy_req` table
- **`check_session_number_column.js`** - Adds `session_number` column to `session` table
- **`check_treatment_target_configs.js`** - Checks treatment target feedback configurations

### Debug and Troubleshooting Tests

- **`test_treatment_target_debug.js`** - Comprehensive debug script to diagnose issues
- **`test_treatment_target_mapping.js`** - Tests treatment target mapping logic
- **`test_new_therapy_request.js`** - Tests new therapy request creation
- **`test_fixed_therapy_request.js`** - Tests fixed therapy request creation
- **`test_session_update_payload.js`** - Tests session update payload compatibility

## Running Tests

To run any test, navigate to the server directory and execute:

```bash
node tests/[test-file-name].js
```

## Test Categories

### 1. **Database Schema Tests**
These tests ensure the database has all required columns and tables:
- `add_form_submit_column.js`
- `check_and_add_treatment_target_column.js`
- `check_session_number_column.js`

### 2. **Functionality Tests**
These tests verify the core functionality works correctly:
- `test_updated_functions.js`
- `test_comprehensive_treatment_target.js`
- `test_session_update.js`

### 3. **Debug Tests**
These tests help diagnose and troubleshoot issues:
- `test_treatment_target_debug.js`
- `test_treatment_target_mapping.js`
- `check_treatment_target_configs.js`

## Environment Requirements

All tests require:
- `.env` file with database configuration
- `FORM_MODE` environment variable set (auto, service, or treatment_target)
- Database with proper schema and sample data

## Notes

- Most tests are designed to work with existing data
- Some tests create new data (therapy requests, sessions)
- All tests include proper cleanup and error handling
- Tests can be run individually or as a suite 