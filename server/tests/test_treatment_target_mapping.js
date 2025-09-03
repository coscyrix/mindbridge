/**
 * Test Script: Treatment Target Mapping Debug
 * 
 * This script tests the treatment target mapping logic to identify why
 * the treatment_target is not being stored in the therapy request.
 */

import dotenv from 'dotenv';
import knex from 'knex';
import DBconn from '../config/db.config.js';
import UserTargetOutcome from '../models/userTargetOutcome.js';
import Common from '../models/common.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);
const userTargetOutcome = new UserTargetOutcome();
const common = new Common();

async function testTreatmentTargetMapping() {
  console.log('🔍 Testing Treatment Target Mapping...\n');

  try {
    const clientId = 18; // From your test

    console.log('1. Testing getUserTargetOutcomeLatest...');
    try {
      const clientTargetOutcome = await userTargetOutcome.getUserTargetOutcomeLatest({
        user_profile_id: clientId,
      });

      console.log('   Result:', clientTargetOutcome);
      
      if (clientTargetOutcome && clientTargetOutcome.length > 0) {
        const targetOutcomeId = clientTargetOutcome[0].target_outcome_id;
        console.log(`   ✅ Found target outcome ID: ${targetOutcomeId}`);
        
        console.log('\n2. Testing getTargetOutcomeById...');
        const targetOutcome = await common.getTargetOutcomeById(targetOutcomeId);
        console.log('   Result:', targetOutcome);
        
        if (targetOutcome && targetOutcome.length > 0) {
          const treatmentTarget = targetOutcome[0].target_name;
          console.log(`   ✅ Mapped to treatment target: "${treatmentTarget}"`);
        } else {
          console.log('   ❌ No target outcome found in ref_target_outcomes');
        }
      } else {
        console.log('   ❌ No target outcome found for client');
      }
    } catch (error) {
      console.log('   ❌ Error in getUserTargetOutcomeLatest:', error.message);
    }

    console.log('\n3. Direct Database Check...');
    try {
      // Direct query to check client target outcome
      const directResult = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('user_target_outcome')
        .where('user_profile_id', clientId)
        .where('status_enum', 'y')
        .orderBy('created_at', 'desc')
        .first();

      console.log('   Direct query result:', directResult);
      
      if (directResult) {
        const targetOutcome = await db
          .withSchema(process.env.MYSQL_DATABASE)
          .from('ref_target_outcomes')
          .where('target_id', directResult.target_outcome_id)
          .first();

        console.log('   Target outcome from ref_target_outcomes:', targetOutcome);
      }
    } catch (error) {
      console.log('   ❌ Error in direct database check:', error.message);
    }

  } catch (error) {
    console.error('❌ Error in test script:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testTreatmentTargetMapping().catch(console.error);
