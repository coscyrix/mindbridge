/**
 * Test Script: Test Fixed Therapy Request Creation
 * 
 * This script tests creating a new therapy request with the fixed
 * treatment target mapping and form loading.
 */

import dotenv from 'dotenv';
import knex from 'knex';
import DBconn from '../config/db.config.js';
import ThrpyReq from '../models/thrpyReq.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);
const thrpyReq = new ThrpyReq();

async function testFixedTherapyRequest() {
  console.log('🧪 Testing Fixed Therapy Request Creation...\n');

  try {
    // Test payload similar to your original request
    const testPayload = {
      counselor_id: 16,
      client_id: 18, // Client with Depression target outcome
      service_id: 1601,
      session_format_id: 1,
      intake_dte: "2025-08-22T07:00:00.000Z",
      tenant_id: 7
    };

    console.log('📤 Test Payload:');
    console.log(JSON.stringify(testPayload, null, 2));

    console.log('🔄 Creating therapy request...');
    const result = await thrpyReq.postThrpyReq(testPayload);

    console.log('📋 Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.rec && result.rec.length > 0) {
      const therapyRequest = result.rec[0];
      console.log('\n🔍 Analysis:');
      console.log(`   req_id: ${therapyRequest.req_id}`);
      console.log(`   treatment_target: ${therapyRequest.treatment_target || 'NULL'}`);
      console.log(`   client_id: ${therapyRequest.client_id}`);
      console.log(`   service_id: ${therapyRequest.service_id}`);
      
      if (therapyRequest.session_obj && therapyRequest.session_obj.length > 0) {
        console.log(`   sessions: ${therapyRequest.session_obj.length}`);
        console.log(`   first session forms: ${JSON.stringify(therapyRequest.session_obj[0].forms_array || [])}`);
        console.log(`   first session form_mode: ${therapyRequest.session_obj[0].form_mode || 'N/A'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testFixedTherapyRequest().catch(console.error);
