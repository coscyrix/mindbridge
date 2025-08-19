/**
 * Debug Script: Test Database Connection for Template Module
 */

import dotenv from 'dotenv';
import knex from 'knex';
import DBconn from '../config/db.config.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);

async function debugTemplateDB() {
  console.log('🔍 Debugging Template Database Connection...\n');

  try {
    // Test 1: Check if we can connect to the database
    console.log('1️⃣ Testing database connection...');
    
    const testQuery = await db.raw('SELECT 1 as test');
    console.log('✅ Database connection successful:', testQuery[0][0]);

    // Test 2: Check if the template table exists
    console.log('\n2️⃣ Testing if treatment_target_session_forms_template table exists...');
    
    const templateTableExists = await db.schema.hasTable('treatment_target_session_forms_template');
    console.log('✅ Template table exists:', templateTableExists);

    // Test 3: Check if the feedback config table exists
    console.log('\n3️⃣ Testing if treatment_target_feedback_config table exists...');
    
    const feedbackTableExists = await db.schema.hasTable('treatment_target_feedback_config');
    console.log('✅ Feedback config table exists:', feedbackTableExists);

    // Test 4: Check template table records
    console.log('\n4️⃣ Checking template table records...');
    
    const templateRecords = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms_template')
      .where('is_active', 1)
      .select('*');
    
    console.log('✅ Template records found:', templateRecords.length);
    
    if (templateRecords.length > 0) {
      console.log('📋 Sample template record:', JSON.stringify(templateRecords[0], null, 2));
    }

    // Test 5: Check feedback config table records
    console.log('\n5️⃣ Checking feedback config table records...');
    
    const feedbackRecords = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .count('* as total');
    
    console.log('✅ Total feedback config records:', feedbackRecords[0].total);

    // Test 6: Check for tenant records
    console.log('\n6️⃣ Checking for tenant records...');
    
    const tenantRecords = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .whereNotNull('tenant_id')
      .select('*');
    
    console.log('✅ Tenant records found:', tenantRecords.length);
    
    if (tenantRecords.length > 0) {
      console.log('📋 Sample tenant record:', JSON.stringify(tenantRecords[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Error stack:', error.stack);
  } finally {
    await db.destroy();
  }
}

// Run the debug
debugTemplateDB().catch(console.error);
