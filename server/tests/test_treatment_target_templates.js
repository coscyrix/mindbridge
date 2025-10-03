/**
 * Test Script: Treatment Target Session Forms Template Module
 * 
 * This script tests the template module functionality for copying
 * treatment target form configurations to new tenants
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');;
const knex = require('knex');;
import DBconn from '../config/db.config.js';
import TreatmentTargetSessionFormsTemplate from '../models/treatmentTargetSessionFormsTemplate.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);
const templateModule = new TreatmentTargetSessionFormsTemplate();

async function testTreatmentTargetTemplates() {
  console.log('🧪 Testing Treatment Target Session Forms Template Module...\n');

  try {
    // Test 1: Get template configurations
    console.log('1️⃣ Testing Get Template Configurations...');
    
    const templateResult = await templateModule.getTemplateConfigurations();
    console.log('📋 Template Configurations Result:', JSON.stringify(templateResult, null, 2));

    if (!templateResult.error && templateResult.rec) {
      console.log(`✅ Found ${templateResult.rec.length} template configurations`);
      
      // Show some examples
      templateResult.rec.slice(0, 3).forEach((config, index) => {
        console.log(`  ${index + 1}. ${config.treatment_target} - ${config.form_name} (${config.purpose})`);
      });
    } else {
      console.log('❌ Failed to get template configurations');
      return;
    }

    // Test 2: Compare existing tenant with template
    console.log('\n2️⃣ Testing Compare Tenant with Template...');
    
    const compareResult = await templateModule.compareTenantWithTemplate({ tenant_id: 7 });
    console.log('📋 Compare Result:', JSON.stringify(compareResult, null, 2));

    if (!compareResult.error && compareResult.rec) {
      console.log(`✅ Comparison completed:`);
      console.log(`  - Template configurations: ${compareResult.rec.total_template_configurations}`);
      console.log(`  - Tenant configurations: ${compareResult.rec.total_tenant_configurations}`);
      console.log(`  - Missing: ${compareResult.rec.summary.missing_count}`);
      console.log(`  - Outdated: ${compareResult.rec.summary.outdated_count}`);
      console.log(`  - Up to date: ${compareResult.rec.summary.up_to_date_count}`);
    }

    // Test 3: Test copying to a new tenant (simulated)
    console.log('\n3️⃣ Testing Copy Template Configurations to New Tenant...');
    
    // Create a test tenant ID that doesn't exist
    const testTenantId = 999;
    
    // First, check if this tenant already has configurations
    const existingConfigs = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feedback_config')
      .where('tenant_id', testTenantId)
      .first();

    if (existingConfigs) {
      console.log(`⚠️ Test tenant ${testTenantId} already has configurations, skipping copy test`);
    } else {
      const copyResult = await templateModule.copyTemplateConfigurationsToTenant({ tenant_id: testTenantId });
      console.log('📋 Copy Result:', JSON.stringify(copyResult, null, 2));

      if (!copyResult.error) {
        console.log(`✅ Successfully copied ${copyResult.rec.configurations_copied} configurations to tenant ${testTenantId}`);
        
        // Verify the copy worked
        const verifyConfigs = await db
          .withSchema(process.env.MYSQL_DATABASE)
          .from('treatment_target_feedback_config')
          .where('tenant_id', testTenantId)
          .select('*');

        console.log(`✅ Verification: Found ${verifyConfigs.length} configurations for tenant ${testTenantId}`);
        
        // Clean up - delete the test configurations
        await db
          .withSchema(process.env.MYSQL_DATABASE)
          .from('treatment_target_feedback_config')
          .where('tenant_id', testTenantId)
          .del();
        
        console.log(`🧹 Cleaned up test configurations for tenant ${testTenantId}`);
      } else {
        console.log('❌ Failed to copy template configurations');
      }
    }

    // Test 4: Test update existing tenant configurations
    console.log('\n4️⃣ Testing Update Template Configurations for Existing Tenant...');
    
    const updateResult = await templateModule.updateTemplateConfigurationsForTenant({ 
      tenant_id: 7,
      overwrite_existing: false 
    });
    console.log('📋 Update Result:', JSON.stringify(updateResult, null, 2));

    if (!updateResult.error) {
      console.log(`✅ Update completed:`);
      console.log(`  - Updated: ${updateResult.rec.configurations_updated}`);
      console.log(`  - Inserted: ${updateResult.rec.configurations_inserted}`);
      console.log(`  - Skipped: ${updateResult.rec.configurations_skipped}`);
    } else {
      console.log('❌ Failed to update template configurations');
    }

    // Test 5: Get tenant configurations
    console.log('\n5️⃣ Testing Get Tenant Configurations...');
    
    const tenantConfigsResult = await templateModule.getTenantConfigurations({ tenant_id: 7 });
    console.log('📋 Tenant Configurations Result:', JSON.stringify(tenantConfigsResult, null, 2));

    if (!tenantConfigsResult.error && tenantConfigsResult.rec) {
      console.log(`✅ Found ${tenantConfigsResult.rec.length} configurations for tenant 7`);
      
      // Show some examples
      tenantConfigsResult.rec.slice(0, 3).forEach((config, index) => {
        console.log(`  ${index + 1}. ${config.treatment_target} - ${config.form_name} (${config.purpose})`);
      });
    }

    console.log('\n🎉 Treatment Target Templates Module Test Completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testTreatmentTargetTemplates().catch(console.error);
