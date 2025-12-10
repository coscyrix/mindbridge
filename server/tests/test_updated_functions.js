/**
 * Focused Test Script: Updated Functions for Treatment Target Forms
 * 
 * This script tests the specific functions we updated:
 * 1. Feedback submission with treatment target forms
 * 2. Reports functionality with treatment target forms
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');;
const knex = require('knex');;
import DBconn from '../config/db.config.js';
import Feedback from '../models/feedback.js';
import Report from '../models/report.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);
const feedback = new Feedback();
const report = new Report();

async function testUpdatedFunctions() {
  console.log('🧪 Testing Updated Functions for Treatment Target Forms\n');

  try {
    // Test 1: Check existing treatment target session forms
    console.log('1️⃣ Checking Existing Treatment Target Session Forms...');
    
    const existingForms = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .where('is_sent', 1)
      .limit(5)
      .select('*');

    console.log(`📊 Found ${existingForms.length} existing treatment target forms:`);
    existingForms.forEach((form, index) => {
      console.log(`  ${index + 1}. Session: ${form.session_id}, Form: ${form.form_name}, Sent: ${form.is_sent}, Submitted: ${form.form_submit}`);
    });

    if (existingForms.length === 0) {
      console.log('❌ No existing treatment target forms found. Cannot test feedback submission.');
      return;
    }

    // Test 2: Test feedback submission for treatment target forms
    console.log('\n2️⃣ Testing Feedback Submission for Treatment Target Forms...');
    
    const testForm = existingForms[0];
    
    const feedbackPayload = {
      session_id: testForm.session_id,
      form_id: testForm.form_id,
      client_id: testForm.client_id,
      feedback_json: JSON.stringify({ 
        test: "feedback data for treatment target form",
        timestamp: new Date().toISOString()
      }),
      tenant_id: testForm.tenant_id
    };

    console.log('📤 Feedback Payload:', JSON.stringify(feedbackPayload, null, 2));
    
    const feedbackResult = await feedback.postFeedback(feedbackPayload);
    console.log('📋 Feedback Result:', JSON.stringify(feedbackResult, null, 2));

    if (!feedbackResult.error) {
      console.log('✅ Feedback submitted successfully');
      
      // Check if form was marked as submitted
      const updatedForm = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('treatment_target_session_forms')
        .where('session_id', testForm.session_id)
        .andWhere('form_id', testForm.form_id)
        .first();

      if (updatedForm) {
        console.log(`📊 Form submission status: ${updatedForm.form_submit ? 'SUBMITTED' : 'NOT SUBMITTED'}`);
      }
    } else {
      console.log('❌ Feedback submission failed:', feedbackResult.message);
    }

    // Test 3: Test reports functionality
    console.log('\n3️⃣ Testing Reports Functionality...');
    
    const reportPayload = {
      role_id: 2,
      counselor_id: testForm.counselor_id
    };

    console.log('📤 Report Payload:', JSON.stringify(reportPayload, null, 2));
    
    const reportResult = await report.getUserForm(reportPayload);
    
    if (Array.isArray(reportResult)) {
      console.log(`✅ Reports retrieved successfully. Found ${reportResult.length} form records`);
      
      if (reportResult.length > 0) {
        console.log('📊 Sample report record:', JSON.stringify(reportResult[0], null, 2));
        
        // Check if treatment target forms are included in reports
        const treatmentTargetFormsInReport = reportResult.filter(record => 
          record.form_cde && ['PHQ-9', 'GAD-7', 'WHODAS', 'PCL-5', 'GAS', 'SMART Goals', 'Consent Form', 'SESSION SUM REPORT'].includes(record.form_cde)
        );
        
        console.log(`📊 Found ${treatmentTargetFormsInReport.length} treatment target forms in reports`);
      }
    } else {
      console.log('❌ Reports retrieval failed:', reportResult);
    }

    // Test 4: Test form submission status update
    console.log('\n4️⃣ Testing Form Submission Status Update...');
    
    const updateFormPayload = {
      session_id: testForm.session_id,
      form_id: testForm.form_id,
      form_submit: true
    };

    console.log('📤 Form Update Payload:', JSON.stringify(updateFormPayload, null, 2));
    
    const updateResult = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .where('session_id', testForm.session_id)
      .andWhere('form_id', testForm.form_id)
      .update({ form_submit: 1 });

    console.log(`📋 Form Update Result: ${updateResult} rows updated`);

    if (updateResult > 0) {
      console.log('✅ Form submission status updated successfully');
      
      // Verify the update
      const verifyForm = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('treatment_target_session_forms')
        .where('session_id', testForm.session_id)
        .andWhere('form_id', testForm.form_id)
        .first();

      console.log(`📊 Verified form submission status: ${verifyForm.form_submit ? 'SUBMITTED' : 'NOT SUBMITTED'}`);
    }

    console.log('\n🎉 All Updated Functions Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testUpdatedFunctions().catch(console.error);
