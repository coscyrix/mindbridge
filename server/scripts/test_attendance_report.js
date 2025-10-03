import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');;
import DBconn from '../config/db.config.js';
const knex = require('knex');;
import logger from '../config/winston.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);

/**
 * Test script to verify attendance report functionality
 * This script checks if the logic correctly identifies when to send attendance reports
 */
async function testAttendanceReportLogic() {
  try {
    console.log('🧪 Testing Attendance Report Logic...\n');

    // Get all ongoing therapy requests
    const ongoingRequests = await db
      .withSchema(`${process.env.MYSQL_DATABASE}`)
      .from('thrpy_req')
      .select('req_id', 'client_id', 'counselor_id', 'thrpy_status')
      .where('thrpy_status', 'ONGOING')
      .where('status_yn', 1)
      .limit(5); // Limit to 5 for testing

    console.log(`Found ${ongoingRequests.length} ongoing therapy requests\n`);

    for (const request of ongoingRequests) {
      console.log(`📋 Therapy Request ID: ${request.req_id}`);
      
      // Get all sessions for this therapy request
      const sessions = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .select('session_id', 'session_status', 'is_report', 'intake_date')
        .where('thrpy_req_id', request.req_id)
        .where('status_yn', 1)
        .orderBy('session_id', 'asc');

      // Filter out report sessions and count completed sessions
      const nonReportSessions = sessions.filter(session => session.is_report !== 1);
      const completedSessions = nonReportSessions.filter(session => 
        session.session_status === 'SHOW' || session.session_status === 'NO-SHOW'
      );

      console.log(`  Total sessions: ${sessions.length}`);
      console.log(`  Non-report sessions: ${nonReportSessions.length}`);
      console.log(`  Completed sessions: ${completedSessions.length}`);
      
      // Check if this is a milestone (multiple of 4)
      const isMilestone = completedSessions.length > 0 && completedSessions.length % 4 === 0;
      const milestoneText = isMilestone ? `✅ YES (${completedSessions.length} sessions)` : '❌ NO';
      console.log(`  Should send attendance report: ${milestoneText}`);

      // Check if attendance feedback already exists
      if (completedSessions.length >= 4) {
        const targetSession = completedSessions[3]; // 4th session (0-indexed)
        
        const existingFeedback = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('feedback')
          .select('feedback_id')
          .where('session_id', targetSession.session_id)
          .where('form_id', 24); // Attendance form ID

        console.log(`  Attendance feedback exists: ${existingFeedback.length > 0 ? '✅ YES' : '❌ NO'}`);
        
        if (existingFeedback.length > 0) {
          console.log(`  Feedback ID: ${existingFeedback[0].feedback_id}`);
        }
      }

      console.log(''); // Empty line for readability
    }

    console.log('✅ Attendance report logic test completed!');

  } catch (error) {
    console.error('❌ Error testing attendance report logic:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testAttendanceReportLogic().catch(console.error);
