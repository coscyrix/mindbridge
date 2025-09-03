# Automatic Attendance Report System

## Overview

The Automatic Attendance Report System automatically sends attendance reports to client emails after every 4 completed therapy sessions. This system integrates with the existing email and feedback infrastructure to provide timely attendance summaries to clients.

## How It Works

### 1. Automatic Trigger
- The system automatically checks for attendance report eligibility whenever a session is updated
- This happens in the `sendTreatmentToolEmail` method in `server/models/emailTmplt.js`
- No manual intervention is required

### 2. Session Counting Logic
- Only counts **non-report sessions** (excludes intake reports, progress reports, discharge reports)
- Only counts **completed sessions** with status 'SHOW' or 'NO-SHOW'
- Attendance reports are triggered at **every 4 completed sessions** (4, 8, 12, 16, 20, etc.)

### 3. Duplicate Prevention
- The system checks if an attendance report has already been sent for each milestone (4, 8, 12, 16, etc.)
- Uses the existing `feedback_attendance` table to track sent reports
- Prevents duplicate emails from being sent at the same milestone

### 4. Report Generation
- Generates a PDF attendance report using the existing `AttendancePDF` template
- Includes:
  - Counselor name
  - Client name
  - Total sessions count
  - Attended sessions count
  - Cancelled sessions count
  - Current date

### 5. Email Delivery
- Sends the attendance report as a PDF attachment
- Uses the existing `attendanceSummaryEmail` template
- Sends to the client's email address on file

## Database Tables Used

### `session` Table
- Tracks individual therapy sessions
- Key fields: `thrpy_req_id`, `session_status`, `is_report`

### `thrpy_req` Table
- Contains therapy request information
- Key fields: `req_id`, `client_id`, `counselor_id`, `thrpy_status`

### `feedback` Table
- Stores feedback records for sessions
- Key fields: `session_id`, `form_id`, `client_id`

### `feedback_attendance` Table
- Stores attendance-specific feedback data
- Key fields: `feedback_id`, `total_sessions`, `total_attended_sessions`, `total_cancelled_sessions`

## Code Structure

### Main Integration Point
```javascript
// In server/models/emailTmplt.js - sendTreatmentToolEmail method
await this.checkAndSendAutomaticAttendanceReport(
  recSession[0].thrpy_req_id,
  data.session_id,
  recThrpy[0],
  recUser[0],
  tenantId
);
```

### Core Methods

#### `checkAndSendAutomaticAttendanceReport()`
- Main logic for determining when to send reports
- Checks session count and prevents duplicates
- Triggers report generation when conditions are met

#### `generateAndSendAttendanceReport()`
- Creates the attendance PDF
- Sends the email with attachment
- Records the feedback for tracking

#### `checkAttendanceFeedbackExists()` (in Feedback class)
- Checks if attendance feedback already exists
- Prevents duplicate reports

## Configuration

### Environment Variables
- `EMAIL_FROM`: Sender email address
- `EMAIL_PASSWORD`: Email password/app password
- `TIMEZONE`: Timezone for date formatting

### Form IDs
- Attendance Form ID: `24`
- This is used to identify attendance-related feedback

## Testing

### Test Script
Run the test script to verify the logic:
```bash
cd server
node scripts/test_attendance_report.js
```

This script will:
- Show ongoing therapy requests
- Count sessions for each request
- Identify which requests should trigger attendance reports
- Check for existing attendance feedback

## Example Workflow

1. **Session 1**: Client attends first session
2. **Session 2**: Client attends second session  
3. **Session 3**: Client attends third session
4. **Session 4**: Client attends fourth session → **🎉 Attendance report automatically sent (4 sessions)**
5. **Session 5**: Client attends fifth session (no report sent)
6. **Session 6**: Client attends sixth session (no report sent)
7. **Session 7**: Client attends seventh session (no report sent)
8. **Session 8**: Client attends eighth session → **🎉 Attendance report automatically sent (8 sessions)**
9. **Session 9**: Client attends ninth session (no report sent)
10. **Session 10**: Client attends tenth session (no report sent)
11. **Session 11**: Client attends eleventh session (no report sent)
12. **Session 12**: Client attends twelfth session → **🎉 Attendance report automatically sent (12 sessions)**

## Benefits

- **Automatic**: No manual intervention required
- **Consistent**: Reports sent at regular intervals
- **Trackable**: All sent reports are recorded in the database
- **Integrated**: Uses existing email and PDF infrastructure
- **Efficient**: Prevents duplicate reports

## Troubleshooting

### Common Issues

1. **Reports not being sent**
   - Check if sessions have correct status ('SHOW' or 'NO-SHOW')
   - Verify `is_report` field is set correctly (0 for regular sessions, 1 for report sessions)
   - Check email configuration in environment variables

2. **Duplicate reports**
   - Verify `checkAttendanceFeedbackExists` method is working
   - Check `feedback_attendance` table for existing records

3. **PDF generation issues**
   - Ensure PDFGenerator middleware is properly configured
   - Check if AttendancePDF template is accessible

### Logs
The system logs all activities to help with debugging:
- Look for "Sending automatic attendance report" messages
- Check for "Attendance report already sent" messages
- Monitor for any error messages in the logs

## Future Enhancements

- **Configurable intervals**: Allow different milestone counts (e.g., every 5 or 6 sessions)
- **Custom templates**: Support for tenant-specific attendance report templates
- **Scheduled reports**: Option to send reports on specific dates regardless of session count
- **Multi-language support**: Support for different languages in attendance reports
