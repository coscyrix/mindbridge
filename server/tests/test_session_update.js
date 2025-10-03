/**
 * Test Script: Test Session Update with Treatment Target Forms
 * 
 * This script tests updating a session to "SHOW" status to verify
 * that the treatment target forms are properly marked as sent.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');;
const knex = require('knex');;
import DBconn from '../config/db.config.js';
import Session from '../models/session.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);
const session = new Session();

async function testSessionUpdate() {
  console.log('🧪 Testing Session Update with Treatment Target Forms...\n');

  try {
    // Test updating session 186 (which has treatment target forms)
    const testPayload = {
      session_id: 186,
      session_status: 1, // 1 = SHOW (triggers form sending)
      notes: "Test session completed successfully",
      role_id: 1,
      user_profile_id: 16
    };

    console.log('📤 Test Payload:');
    console.log(JSON.stringify(testPayload, null, 2));
    console.log('');

    console.log('🔄 Updating session...');
    const result = await session.putSessionById(testPayload);

    console.log('📋 Result:');
    console.log(JSON.stringify(result, null, 2));

    if (!result.error) {
      console.log('\n✅ Session updated successfully!');
      
      // Check if treatment target forms were marked as sent
      console.log('\n🔍 Checking treatment target session forms...');
      const treatmentTargetForms = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('treatment_target_session_forms')
        .where('session_id', 186)
        .select('*');

      console.log(`Found ${treatmentTargetForms.length} treatment target forms for session 186:`);
      treatmentTargetForms.forEach(form => {
        console.log(`  - Form: ${form.form_name}, Sent: ${form.is_sent ? 'YES' : 'NO'}, Sent At: ${form.sent_at || 'Not set'}`);
      });
    } else {
      console.log('\n❌ Session update failed:', result.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testSessionUpdate().catch(console.error);
