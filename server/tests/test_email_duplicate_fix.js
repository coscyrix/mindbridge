/**
 * Test Script: Verify Email Duplicate Fix
 * 
 * This script tests that forms are not sent twice when FORM_MODE=treatment_target
 */

import dotenv from 'dotenv';
import knex from 'knex';
import DBconn from '../config/db.config.js';
import Session from '../models/session.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);
const session = new Session();

async function testEmailDuplicateFix() {
  console.log('🧪 Testing Email Duplicate Fix...\n');

  try {
    // Check current FORM_MODE
    const formMode = process.env.FORM_MODE || 'auto';
    console.log(`📋 Current FORM_MODE: ${formMode}`);

    // Find a session with treatment target forms that haven't been sent yet
    console.log('\n1️⃣ Finding session with unsent treatment target forms...');
    
    const unsentForms = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .where('is_sent', 0)
      .limit(1)
      .first();

    if (!unsentForms) {
      console.log('❌ No unsent treatment target forms found. Cannot test email sending.');
      return;
    }

    console.log(`📊 Found unsent form: Session ${unsentForms.session_id}, Form: ${unsentForms.form_name}`);

    // Check how many forms are currently sent for this session
    console.log('\n2️⃣ Checking current sent status...');
    
    const currentSentForms = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .where('session_id', unsentForms.session_id)
      .where('is_sent', 1)
      .select('*');

    console.log(`📊 Currently sent forms for session ${unsentForms.session_id}: ${currentSentForms.length}`);
    currentSentForms.forEach(form => {
      console.log(`  - ${form.form_name} (sent at: ${form.sent_at})`);
    });

    // Update session to trigger email sending
    console.log('\n3️⃣ Updating session to trigger email sending...');
    
    const sessionUpdatePayload = {
      session_id: unsentForms.session_id,
      session_status: 1, // SHOW status
      notes: "Test session completed - checking for duplicate emails",
      role_id: 1,
      user_profile_id: unsentForms.counselor_id
    };

    console.log('📤 Session Update Payload:', JSON.stringify(sessionUpdatePayload, null, 2));
    
    const sessionUpdateResult = await session.putSessionById(sessionUpdatePayload);
    console.log('📋 Session Update Result:', JSON.stringify(sessionUpdateResult, null, 2));

    if (sessionUpdateResult.error) {
      console.log('❌ Session update failed:', sessionUpdateResult.message);
      return;
    }

    // Wait a moment for email processing
    console.log('\n4️⃣ Waiting for email processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check how many forms are now sent for this session
    console.log('\n5️⃣ Checking updated sent status...');
    
    const updatedSentForms = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .where('session_id', unsentForms.session_id)
      .where('is_sent', 1)
      .select('*');

    console.log(`📊 Updated sent forms for session ${unsentForms.session_id}: ${updatedSentForms.length}`);
    updatedSentForms.forEach(form => {
      console.log(`  - ${form.form_name} (sent at: ${form.sent_at})`);
    });

    // Check for duplicates
    console.log('\n6️⃣ Checking for duplicate emails...');
    
    const formCounts = {};
    updatedSentForms.forEach(form => {
      const key = `${form.form_name}-${form.session_id}`;
      formCounts[key] = (formCounts[key] || 0) + 1;
    });

    let hasDuplicates = false;
    Object.entries(formCounts).forEach(([key, count]) => {
      if (count > 1) {
        console.log(`❌ DUPLICATE FOUND: ${key} sent ${count} times`);
        hasDuplicates = true;
      } else {
        console.log(`✅ No duplicates for: ${key}`);
      }
    });

    if (!hasDuplicates) {
      console.log('\n🎉 SUCCESS: No duplicate emails detected!');
    } else {
      console.log('\n❌ ISSUE: Duplicate emails detected!');
    }

    // Show the difference
    const newSentForms = updatedSentForms.length - currentSentForms.length;
    console.log(`\n📊 Summary:`);
    console.log(`  - Forms sent before: ${currentSentForms.length}`);
    console.log(`  - Forms sent after: ${updatedSentForms.length}`);
    console.log(`  - New forms sent: ${newSentForms}`);

    if (newSentForms > 0) {
      console.log(`  - Expected new forms: 1-2 (depending on session configuration)`);
      if (newSentForms <= 2) {
        console.log(`  ✅ Email sending looks correct (no duplicates)`);
      } else {
        console.log(`  ❌ Too many forms sent - possible duplicates`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testEmailDuplicateFix().catch(console.error);
