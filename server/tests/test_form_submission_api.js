/**
 * Test Script: Verify Form Submission APIs with Treatment Target Forms
 * 
 * This script tests that the form submission APIs work correctly
 * when FORM_MODE=treatment_target
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');;
const knex = require('knex');;
import DBconn from '../config/db.config.js';
import Feedback from '../models/feedback.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);
const feedback = new Feedback();

async function testFormSubmissionAPI() {
  console.log('🧪 Testing Form Submission APIs with Treatment Target Forms...\n');

  try {
    // Check current FORM_MODE
    const formMode = process.env.FORM_MODE || 'auto';
    console.log(`📋 Current FORM_MODE: ${formMode}`);

    // Find a session with treatment target forms that have been sent but not submitted
    console.log('\n1️⃣ Finding session with sent but unsubmitted treatment target forms...');
    
    const sentForms = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .where('is_sent', 1)
      .where('form_submit', 0)
      .limit(3)
      .select('*');

    if (sentForms.length === 0) {
      console.log('❌ No sent but unsubmitted treatment target forms found.');
      return;
    }

    console.log(`📊 Found ${sentForms.length} sent but unsubmitted forms:`);
    sentForms.forEach((form, index) => {
      console.log(`  ${index + 1}. Session: ${form.session_id}, Form: ${form.form_name}, Sent: ${form.is_sent}, Submitted: ${form.form_submit}`);
    });

    // Test 2: Test generic feedback submission
    console.log('\n2️⃣ Testing Generic Feedback Submission...');
    
    const testForm = sentForms[0];
    
    const genericFeedbackPayload = {
      session_id: testForm.session_id,
      form_id: testForm.form_id,
      client_id: testForm.client_id,
      feedback_json: JSON.stringify({ 
        test: "generic feedback data",
        timestamp: new Date().toISOString()
      }),
      tenant_id: testForm.tenant_id
    };

    console.log('📤 Generic Feedback Payload:', JSON.stringify(genericFeedbackPayload, null, 2));
    
    const genericFeedbackResult = await feedback.postFeedback(genericFeedbackPayload);
    console.log('📋 Generic Feedback Result:', JSON.stringify(genericFeedbackResult, null, 2));

    if (!genericFeedbackResult.error) {
      console.log('✅ Generic feedback submitted successfully');
      
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
      console.log('❌ Generic feedback submission failed:', genericFeedbackResult.message);
    }

    // Test 3: Test specific form submission (PHQ-9)
    console.log('\n3️⃣ Testing Specific Form Submission (PHQ-9)...');
    
    const phq9Form = sentForms.find(form => form.form_name === 'PHQ-9');
    
    if (phq9Form) {
      const phq9FeedbackPayload = {
        session_id: phq9Form.session_id,
        client_id: phq9Form.client_id,
        item1: 2,
        item2: 1,
        item3: 0,
        item4: 1,
        item5: 2,
        item6: 0,
        item7: 1,
        item8: 0,
        item9: 1,
        difficulty_score: 1,
        tenant_id: phq9Form.tenant_id
      };

      console.log('📤 PHQ-9 Feedback Payload:', JSON.stringify(phq9FeedbackPayload, null, 2));
      
      const phq9FeedbackResult = await feedback.postPHQ9Feedback(phq9FeedbackPayload);
      console.log('📋 PHQ-9 Feedback Result:', JSON.stringify(phq9FeedbackResult, null, 2));

      if (!phq9FeedbackResult.error) {
        console.log('✅ PHQ-9 feedback submitted successfully');
        
        // Check if form was marked as submitted
        const updatedPhq9Form = await db
          .withSchema(process.env.MYSQL_DATABASE)
          .from('treatment_target_session_forms')
          .where('session_id', phq9Form.session_id)
          .andWhere('form_id', phq9Form.form_id)
          .first();

        if (updatedPhq9Form) {
          console.log(`📊 PHQ-9 form submission status: ${updatedPhq9Form.form_submit ? 'SUBMITTED' : 'NOT SUBMITTED'}`);
        }
      } else {
        console.log('❌ PHQ-9 feedback submission failed:', phq9FeedbackResult.message);
      }
    } else {
      console.log('⚠️ No PHQ-9 form found for testing');
    }

    // Test 4: Test specific form submission (WHODAS)
    console.log('\n4️⃣ Testing Specific Form Submission (WHODAS)...');
    
    const whodasForm = sentForms.find(form => form.form_name === 'WHODAS');
    
    if (whodasForm) {
      // Create a simple WHODAS payload (first 6 items for testing)
      const whodasFeedbackPayload = {
        session_id: whodasForm.session_id,
        client_id: whodasForm.client_id,
        item1: 2,
        item2: 1,
        item3: 0,
        item4: 1,
        item5: 2,
        item6: 0,
        // Add more items as needed for WHODAS
        tenant_id: whodasForm.tenant_id
      };

      console.log('📤 WHODAS Feedback Payload:', JSON.stringify(whodasFeedbackPayload, null, 2));
      
      const whodasFeedbackResult = await feedback.postWHODASFeedback(whodasFeedbackPayload);
      console.log('📋 WHODAS Feedback Result:', JSON.stringify(whodasFeedbackResult, null, 2));

      if (!whodasFeedbackResult.error) {
        console.log('✅ WHODAS feedback submitted successfully');
        
        // Check if form was marked as submitted
        const updatedWhodasForm = await db
          .withSchema(process.env.MYSQL_DATABASE)
          .from('treatment_target_session_forms')
          .where('session_id', whodasForm.session_id)
          .andWhere('form_id', whodasForm.form_id)
          .first();

        if (updatedWhodasForm) {
          console.log(`📊 WHODAS form submission status: ${updatedWhodasForm.form_submit ? 'SUBMITTED' : 'NOT SUBMITTED'}`);
        }
      } else {
        console.log('❌ WHODAS feedback submission failed:', whodasFeedbackResult.message);
      }
    } else {
      console.log('⚠️ No WHODAS form found for testing');
    }

    // Test 5: Check final status of all forms
    console.log('\n5️⃣ Checking Final Form Submission Status...');
    
    const finalForms = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .whereIn('id', sentForms.map(f => f.id))
      .select('*');

    console.log(`📊 Final status of ${finalForms.length} forms:`);
    finalForms.forEach(form => {
      console.log(`  - ${form.form_name}: Sent=${form.is_sent}, Submitted=${form.form_submit}`);
    });

    console.log('\n🎉 Form Submission API Test Completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testFormSubmissionAPI().catch(console.error);
