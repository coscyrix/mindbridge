#!/usr/bin/env node

/**
 * Script to add missing tenant configurations for existing tenants
 * Run this script after running the migration to ensure all existing tenants have the required configurations
 */

import DBconn from '../config/db.config.js';
import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex(DBconn.dbConn.development);

async function addMissingTenantConfigs() {
  try {
    console.log('🔍 Checking for tenants without homework upload configuration...');

    // Get all active tenants
    const tenants = await db
      .withSchema(`${process.env.MYSQL_DATABASE}`)
      .select('tenant_id', 'tenant_name')
      .from('tenant')
      .where('status_yn', 1);

    console.log(`Found ${tenants.length} active tenants`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const tenant of tenants) {
      // Check if homework_upload_enabled configuration exists for this tenant
      const existingConfig = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('config_id')
        .from('tenant_configuration')
        .where('tenant_id', tenant.tenant_id)
        .andWhere('feature_name', 'homework_upload_enabled')
        .first();

      if (!existingConfig) {
        // Add missing configuration
        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('tenant_configuration')
          .insert({
            tenant_id: tenant.tenant_id,
            feature_name: 'homework_upload_enabled',
            feature_value: 'true',
            is_enabled: 1
          });

        console.log(`✅ Added homework upload config for tenant: ${tenant.tenant_name} (ID: ${tenant.tenant_id})`);
        addedCount++;
      } else {
        console.log(`⏭️  Skipped tenant: ${tenant.tenant_name} (ID: ${tenant.tenant_id}) - config already exists`);
        skippedCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`- Total tenants processed: ${tenants.length}`);
    console.log(`- Configurations added: ${addedCount}`);
    console.log(`- Configurations skipped: ${skippedCount}`);

    if (addedCount > 0) {
      console.log('\n✅ Successfully added missing tenant configurations!');
    } else {
      console.log('\nℹ️  All tenants already have the required configurations.');
    }

  } catch (error) {
    console.error('❌ Error adding tenant configurations:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run the script
addMissingTenantConfigs(); 