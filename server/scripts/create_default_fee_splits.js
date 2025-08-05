import db from '../config/db.config.js';
import logger from '../config/winston.js';

/**
 * Script to create default fee split management entries for existing tenants
 * Run this script to ensure all existing tenants have default fee split configurations
 */
async function createDefaultFeeSplitsForExistingTenants() {
  try {
    console.log('Starting to create default fee split management entries for existing tenants...');

    // Get all tenants
    const tenants = await db
      .withSchema(`${process.env.MYSQL_DATABASE}`)
      .from('tenant')
      .select('tenant_id', 'tenant_name');

    console.log(`Found ${tenants.length} tenants`);

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const tenant of tenants) {
      try {
        // Check if default fee split management already exists
        const existingFeeSplit = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('fee_split_management')
          .where('tenant_id', tenant.tenant_id)
          .whereNull('counselor_user_id')
          .andWhere('status_yn', 1)
          .first();

        if (existingFeeSplit) {
          console.log(`✓ Tenant ${tenant.tenant_name} (ID: ${tenant.tenant_id}) already has fee split management`);
          skippedCount++;
          continue;
        }

        // Create default fee split management entry
        const defaultFeeSplitData = {
          tenant_id: tenant.tenant_id,
          counselor_user_id: null, // Default configuration for all counselors
          is_fee_split_enabled: 0, // Disabled by default
          tenant_share_percentage: 0, // 0% for tenant
          counselor_share_percentage: 100, // 100% for counselor
          status_yn: 1
        };

        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('fee_split_management')
          .insert(defaultFeeSplitData);

        console.log(`✓ Created default fee split management for tenant ${tenant.tenant_name} (ID: ${tenant.tenant_id})`);
        createdCount++;

      } catch (error) {
        console.error(`✗ Error creating fee split management for tenant ${tenant.tenant_name} (ID: ${tenant.tenant_id}):`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total tenants processed: ${tenants.length}`);
    console.log(`Default fee splits created: ${createdCount}`);
    console.log(`Already existed (skipped): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some tenants had errors. Check the logs above for details.');
    } else {
      console.log('\n✅ All tenants processed successfully!');
    }

  } catch (error) {
    console.error('Fatal error:', error);
    logger.error('Error in createDefaultFeeSplitsForExistingTenants:', error);
  } finally {
    // Close database connection
    await db.destroy();
    console.log('Database connection closed');
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultFeeSplitsForExistingTenants()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default createDefaultFeeSplitsForExistingTenants; 