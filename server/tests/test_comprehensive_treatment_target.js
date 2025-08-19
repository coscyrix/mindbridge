/**
 * Comprehensive Test Script: Treatment Target Form Functionality
 * 
 * This script tests all aspects of the treatment target form functionality:
 * 1. Form attachment during therapy request creation
 * 2. Session update with form sending
 * 3. Feedback submission with form status update
 * 4. Reports functionality
 */

import dotenv from 'dotenv';
import knex from 'knex';
import DBconn from '../config/db.config.js';
import ThrpyReq from '../models/thrpyReq.js';
import Session from '../models/session.js';
import Feedback from '../models/feedback.js';
import Report from '../models/report.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);
const thrpyReq = new ThrpyReq();
const session = new Session();
const feedback = new Feedback();
const report = new Report();

async function testComprehensiveTreatmentTarget() {
  console.log('🧪 Comprehensive Treatment Target Form Functionality Test\n');

  try {
    // Test 1: Create a new therapy request with treatment target forms
    console.log('1️⃣ Testing Therapy Request Creation with Treatment Target Forms...');
    
    const therapyRequestPayload = {
      counselor_id: 16,
      client_id: 19, // Use a different client
      service_id: 1601,
      session_format_id: 1,
      intake_dte: "2025-08-21T09:00:00.000Z"
    };

    console.log('📤 Therapy Request Payload:', JSON.stringify(therapyRequestPayload, null, 2));
    
    const therapyRequestResult = await thrpyReq.postThrpyReq(therapyRequestPayload);
    console.log('📋 Therapy Request Result:', JSON.stringify(therapyRequestResult, null, 2));

    if (therapyRequestResult.error) {
      console.log('❌ Therapy request creation failed');
      return;
    }

    const reqId = therapyRequestResult.rec[0].req_id;
    console.log(`✅ Therapy request created with ID: ${reqId}`);

    // Test 2: Check if forms were attached
    console.log('\n2️⃣ Checking Form Attachment...');
    
    const therapyRequestDetails = await thrpyReq.getThrpyReqById({ req_id: reqId });
    console.log('📋 Therapy Request Details:', JSON.stringify(therapyRequestDetails, null, 2));

    if (therapyRequestDetails.rec && therapyRequestDetails.rec[0].session_obj) {
      const sessions = therapyRequestDetails.rec[0].session_obj;
      console.log(`📊 Found ${sessions.length} sessions`);
      
      sessions.forEach((session, index) => {
        console.log(`  Session ${index + 1}: ID=${session.session_id}, Forms=${session.forms_array?.length || 0}, Mode=${session.form_mode}`);
      });
    }

    // Test 3: Update session to trigger form sending
    console.log('\n3️⃣ Testing Session Update (Form Sending)...');
    
    if (therapyRequestDetails.rec && therapyRequestDetails.rec[0].session_obj && therapyRequestDetails.rec[0].session_obj.length > 0) {
      const firstSession = therapyRequestDetails.rec[0].session_obj[0];
      
      const sessionUpdatePayload = {
        session_id: firstSession.session_id,
        session_status: 1, // SHOW status
        notes: "Test session completed",
        role_id: 1,
        user_profile_id: 16
      };

      console.log('📤 Session Update Payload:', JSON.stringify(sessionUpdatePayload, null, 2));
      
      const sessionUpdateResult = await session.putSessionById(sessionUpdatePayload);
      console.log('📋 Session Update Result:', JSON.stringify(sessionUpdateResult, null, 2));

      if (!sessionUpdateResult.error) {
        console.log('✅ Session updated successfully');
        
        // Check if forms were marked as sent
        const treatmentTargetForms = await db
          .withSchema(process.env.MYSQL_DATABASE)
          .from('treatment_target_session_forms')
          .where('session_id', firstSession.session_id)
          .select('*');

        console.log(`📊 Found ${treatmentTargetForms.length} treatment target forms for session ${firstSession.session_id}:`);
        treatmentTargetForms.forEach(form => {
          console.log(`  - Form: ${form.form_name}, Sent: ${form.is_sent ? 'YES' : 'NO'}, Sent At: ${form.sent_at || 'Not set'}`);
        });
      }
    }

    // Test 4: Test feedback submission
    console.log('\n4️⃣ Testing Feedback Submission...');
    
    if (therapyRequestDetails.rec && therapyRequestDetails.rec[0].session_obj && therapyRequestDetails.rec[0].session_obj.length > 0) {
      const firstSession = therapyRequestDetails.rec[0].session_obj[0];
      
      if (firstSession.forms_array && firstSession.forms_array.length > 0) {
        const formId = firstSession.forms_array[0];
        
        const feedbackPayload = {
          session_id: firstSession.session_id,
          form_id: formId,
          client_id: therapyRequestPayload.client_id,
          feedback_json: JSON.stringify({ test: "feedback data" }),
          tenant_id: 7
        };

        console.log('📤 Feedback Payload:', JSON.stringify(feedbackPayload, null, 2));
        
        const feedbackResult = await feedback.postFeedback(feedbackPayload);
        console.log('📋 Feedback Result:', JSON.stringify(feedbackResult, null, 2));

        if (!feedbackResult.error) {
          console.log('✅ Feedback submitted successfully');
          
          // Check if form was marked as submitted
          const updatedForms = await db
            .withSchema(process.env.MYSQL_DATABASE)
            .from('treatment_target_session_forms')
            .where('session_id', firstSession.session_id)
            .andWhere('form_id', formId)
            .select('*');

          if (updatedForms.length > 0) {
            console.log(`📊 Form submission status: ${updatedForms[0].form_submit ? 'SUBMITTED' : 'NOT SUBMITTED'}`);
          }
        }
      }
    }

    // Test 5: Test reports functionality
    console.log('\n5️⃣ Testing Reports Functionality...');
    
    const reportPayload = {
      role_id: 2,
      counselor_id: 16
    };

    console.log('📤 Report Payload:', JSON.stringify(reportPayload, null, 2));
    
    const reportResult = await report.getUserForm(reportPayload);
    console.log('📋 Report Result:', JSON.stringify(reportResult, null, 2));

    if (Array.isArray(reportResult)) {
      console.log(`✅ Reports retrieved successfully. Found ${reportResult.length} form records`);
      
      if (reportResult.length > 0) {
        console.log('📊 Sample report record:', JSON.stringify(reportResult[0], null, 2));
      }
    }

    console.log('\n🎉 Comprehensive Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testComprehensiveTreatmentTarget().catch(console.error);
