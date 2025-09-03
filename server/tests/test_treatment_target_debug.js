/**
 * Debug Script: Treatment Target Form Attachment
 * 
 * This script helps debug why treatment target forms aren't being attached
 * when creating therapy requests.
 */

import dotenv from 'dotenv';
import knex from 'knex';
import DBconn from '../config/db.config.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);

async function debugTreatmentTargetFormAttachment() {
  console.log('🔍 Debugging Treatment Target Form Attachment...\n');

  try {
    // Test 1: Check environment variable
    console.log('1. Environment Variable Check:');
    console.log(`   FORM_MODE: ${process.env.FORM_MODE || 'NOT SET (defaults to auto)'}`);
    console.log('');

    // Test 2: Check if treatment_target column exists in thrpy_req
    console.log('2. Database Schema Check:');
    try {
      const columns = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('thrpy_req')
        .columnInfo();
      
      const hasTreatmentTarget = 'treatment_target' in columns;
      console.log(`   treatment_target column exists: ${hasTreatmentTarget ? '✅ YES' : '❌ NO'}`);
      
      if (hasTreatmentTarget) {
        console.log(`   treatment_target column type: ${columns.treatment_target.type}`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking schema: ${error.message}`);
    }
    console.log('');

    // Test 3: Check client target outcome
    console.log('3. Client Target Outcome Check:');
    const clientId = 17; // From your test
    try {
      const clientTargetOutcome = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('user_target_outcome')
        .where('user_profile_id', clientId)
        .where('status_enum', 'y')
        .orderBy('created_at', 'desc')
        .first();

      if (clientTargetOutcome) {
        console.log(`   ✅ Client ${clientId} has target outcome: ${clientTargetOutcome.target_outcome_id}`);
        
        // Get target outcome details
        const targetOutcome = await db
          .withSchema(process.env.MYSQL_DATABASE)
          .from('ref_target_outcomes')
          .where('target_id', clientTargetOutcome.target_outcome_id)
          .first();

        if (targetOutcome) {
          console.log(`   ✅ Target outcome name: "${targetOutcome.target_name}"`);
        } else {
          console.log(`   ❌ Target outcome not found in ref_target_outcomes`);
        }
      } else {
        console.log(`   ❌ Client ${clientId} has no target outcome`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking client target outcome: ${error.message}`);
    }
    console.log('');

    // Test 4: Check treatment target feedback config
    console.log('4. Treatment Target Feedback Config Check:');
    try {
      const configs = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('treatment_target_feedback_config')
        .select('treatment_target', 'form_name', 'sessions');

      console.log(`   Found ${configs.length} configurations:`);
      configs.forEach(config => {
        console.log(`     - ${config.treatment_target}: ${config.form_name} at sessions ${config.sessions}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking configs: ${error.message}`);
    }
    console.log('');

    // Test 5: Check therapy request
    console.log('5. Therapy Request Check:');
    const reqId = 5; // From your test
    try {
      const therapyRequest = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('thrpy_req')
        .where('req_id', reqId)
        .first();

      if (therapyRequest) {
        console.log(`   ✅ Therapy request ${reqId} exists`);
        console.log(`   treatment_target: ${therapyRequest.treatment_target || 'NULL'}`);
        console.log(`   client_id: ${therapyRequest.client_id}`);
        console.log(`   service_id: ${therapyRequest.service_id}`);
      } else {
        console.log(`   ❌ Therapy request ${reqId} not found`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking therapy request: ${error.message}`);
    }
    console.log('');

    // Test 6: Check sessions
    console.log('6. Sessions Check:');
    try {
      const sessions = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('session')
        .where('thrpy_req_id', reqId)
        .select('session_id', 'session_number', 'forms_array', 'is_report')
        .orderBy('session_id');

      console.log(`   Found ${sessions.length} sessions:`);
      sessions.forEach(session => {
        console.log(`     - Session ${session.session_id}: forms=${session.forms_array || '[]'}, is_report=${session.is_report}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking sessions: ${error.message}`);
    }
    console.log('');

    // Test 7: Check treatment_target_session_forms
    console.log('7. Treatment Target Session Forms Check:');
    try {
      const treatmentTargetForms = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('treatment_target_session_forms')
        .where('req_id', reqId);

      console.log(`   Found ${treatmentTargetForms.length} treatment target session forms:`);
      treatmentTargetForms.forEach(form => {
        console.log(`     - ${form.treatment_target}: ${form.form_name} for session ${form.session_number}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking treatment target session forms: ${error.message}`);
    }
    console.log('');

    // Test 8: Check user_forms
    console.log('8. User Forms Check:');
    try {
      const userForms = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('user_forms')
        .whereIn('session_id', sessions.map(s => s.session_id));

      console.log(`   Found ${userForms.length} user forms:`);
      userForms.forEach(form => {
        console.log(`     - Session ${form.session_id}: form_id=${form.form_id}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking user forms: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error in debug script:', error);
  } finally {
    await db.destroy();
  }
}

// Run the debug script
debugTreatmentTargetFormAttachment().catch(console.error);
