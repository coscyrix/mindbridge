/**
 * Script to check treatment target feedback configurations
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');;
const knex = require('knex');;
import DBconn from '../config/db.config.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);

async function checkTreatmentTargetConfigs() {
  console.log('🔍 Checking Treatment Target Feedback Configurations...\n');

  try {
    // Check all configurations
    console.log('1. All Treatment Target Configurations:');
    const allConfigs = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .select('*');

    console.log(`   Found ${allConfigs.length} configurations:`);
    allConfigs.forEach(config => {
      console.log(`   - ID: ${config.id}, Target: "${config.treatment_target}", Form: "${config.form_name}", Tenant: ${config.tenant_id}`);
    });

    // Check configurations for Depression
    console.log('\n2. Depression Configurations:');
    const depressionConfigs = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .where('treatment_target', 'Depression')
      .select('*');

    console.log(`   Found ${depressionConfigs.length} Depression configurations:`);
    depressionConfigs.forEach(config => {
      console.log(`   - ID: ${config.id}, Form: "${config.form_name}", Tenant: ${config.tenant_id}, Sessions: ${config.sessions}`);
    });

    // Check configurations for tenant_id: 7
    console.log('\n3. Configurations for Tenant ID 7:');
    const tenantConfigs = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .where('tenant_id', 7)
      .select('*');

    console.log(`   Found ${tenantConfigs.length} configurations for tenant 7:`);
    tenantConfigs.forEach(config => {
      console.log(`   - ID: ${config.id}, Target: "${config.treatment_target}", Form: "${config.form_name}"`);
    });

    // Check configurations for Depression AND tenant_id: 7
    console.log('\n4. Depression Configurations for Tenant ID 7:');
    const depressionTenantConfigs = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .where('treatment_target', 'Depression')
      .andWhere('tenant_id', 7)
      .select('*');

    console.log(`   Found ${depressionTenantConfigs.length} Depression configurations for tenant 7:`);
    depressionTenantConfigs.forEach(config => {
      console.log(`   - ID: ${config.id}, Form: "${config.form_name}", Sessions: ${config.sessions}`);
    });

    // Check configurations for Depression with NULL tenant_id
    console.log('\n5. Depression Configurations with NULL tenant_id:');
    const depressionNullTenantConfigs = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .where('treatment_target', 'Depression')
      .andWhereNull('tenant_id')
      .select('*');

    console.log(`   Found ${depressionNullTenantConfigs.length} Depression configurations with NULL tenant_id:`);
    depressionNullTenantConfigs.forEach(config => {
      console.log(`   - ID: ${config.id}, Form: "${config.form_name}", Sessions: ${config.sessions}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

// Run the script
checkTreatmentTargetConfigs().catch(console.error);
