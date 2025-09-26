/**
 * Test Script: Automatic Template Copy for New Tenants
 * 
 * This script tests that treatment target form templates are automatically
 * copied when a new tenant is created
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');;
const knex = require('knex');;
import DBconn from '../config/db.config.js';
import Common from '../models/common.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);
const common = new Common();

async function testAutomaticTemplateCopy() {
  console.log('🧪 Testing Automatic Template Copy for New Tenants...\n');

  try {
    // Test 1: Create a new tenant
    console.log('1️⃣ Creating a new tenant...');
    
    const newTenantData = {
      tenant_name: `Test Tenant ${Date.now()}`,
      admin_fee: 0.15,
      tax_percent: 0.08
    };

    console.log('📤 New Tenant Data:', JSON.stringify(newTenantData, null, 2));
    
    const createTenantResult = await common.postTenant(newTenantData);
    
    if (createTenantResult.error) {
      console.log('❌ Failed to create tenant:', createTenantResult.message);
      return;
    }

    const newTenantId = createTenantResult;
    console.log(`✅ New tenant created with ID: ${newTenantId}`);

    // Test 2: Check if treatment target configurations were copied
    console.log('\n2️⃣ Checking if treatment target configurations were copied...');
    
    const tenantConfigs = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .where('tenant_id', newTenantId)
      .select('*');

    console.log(`📊 Found ${tenantConfigs.length} treatment target configurations for tenant ${newTenantId}`);

    if (tenantConfigs.length > 0) {
      console.log('✅ Treatment target configurations successfully copied!');
      
      // Show some examples
      console.log('\n📋 Sample configurations:');
      tenantConfigs.slice(0, 5).forEach((config, index) => {
        console.log(`  ${index + 1}. ${config.treatment_target} - ${config.form_name}`);
      });
    } else {
      console.log('❌ No treatment target configurations found for the new tenant');
    }

    // Test 3: Check template configurations count
    console.log('\n3️⃣ Comparing with template count...');
    
    const templateConfigs = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms_template')
      .where('is_active', 1)
      .select('*');

    console.log(`📊 Template configurations: ${templateConfigs.length}`);
    console.log(`📊 Tenant configurations: ${tenantConfigs.length}`);

    if (templateConfigs.length === tenantConfigs.length) {
      console.log('✅ All template configurations were copied correctly!');
    } else {
      console.log(`⚠️ Mismatch in configuration counts (expected: ${templateConfigs.length}, actual: ${tenantConfigs.length})`);
    }

    // Test 4: Verify specific configurations
    console.log('\n4️⃣ Verifying specific configurations...');
    
    const expectedConfigurations = [
      'Anxiety - GAD-7',
      'Depression - PHQ-9',
      'PTSD - PCL-5'
    ];

    let allFound = true;
    for (const expectedConfig of expectedConfigurations) {
      const [treatmentTarget, formName] = expectedConfig.split(' - ');
      const found = tenantConfigs.find(config => 
        config.treatment_target === treatmentTarget && config.form_name === formName
      );

      if (found) {
        console.log(`✅ Found: ${expectedConfig}`);
      } else {
        console.log(`❌ Missing: ${expectedConfig}`);
        allFound = false;
      }
    }

    if (allFound) {
      console.log('✅ All expected configurations are present!');
    }

    // Test 5: Check other default configurations
    console.log('\n5️⃣ Checking other default tenant configurations...');
    
    // Check tenant configuration table
    const tenantConfigEntries = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('tenant_configuration')
      .where('tenant_id', newTenantId)
      .select('*');

    console.log(`📊 Found ${tenantConfigEntries.length} tenant configuration entries`);
    tenantConfigEntries.forEach(config => {
      console.log(`  - ${config.feature_name}: ${config.feature_value} (enabled: ${config.is_enabled})`);
    });

    // Check fee split management
    const feeSplitEntries = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('fee_split_management')
      .where('tenant_id', newTenantId)
      .select('*');

    console.log(`📊 Found ${feeSplitEntries.length} fee split management entries`);
    feeSplitEntries.forEach(entry => {
      console.log(`  - Enabled: ${entry.is_fee_split_enabled}, Tenant: ${entry.tenant_share_percentage}%, Counselor: ${entry.counselor_share_percentage}%`);
    });

    // Clean up - delete the test tenant and its configurations
    console.log('\n6️⃣ Cleaning up test data...');
    
    // Delete treatment target configurations
    await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .where('tenant_id', newTenantId)
      .del();
    
    // Delete tenant configurations
    await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('tenant_configuration')
      .where('tenant_id', newTenantId)
      .del();
    
    // Delete fee split management
    await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('fee_split_management')
      .where('tenant_id', newTenantId)
      .del();
    
    // Delete ref_fees
    await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('ref_fees')
      .where('tenant_id', newTenantId)
      .del();
    
    // Delete tenant
    await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('tenant')
      .where('tenant_id', newTenantId)
      .del();
    
    console.log(`🧹 Cleaned up test tenant ${newTenantId} and all its configurations`);

    console.log('\n🎉 Automatic Template Copy Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testAutomaticTemplateCopy().catch(console.error);
