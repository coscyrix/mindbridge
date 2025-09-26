import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;

const db = knex(DBconn.dbConn.development);

async function enableFeeSplits() {
  try {
    console.log('Enabling fee splits for tenant_id 121...');
    
    // Check if fee_split_management table exists
    const tableExists = await db.schema.hasTable('fee_split_management');
    console.log('fee_split_management table exists:', tableExists);
    
    if (!tableExists) {
      console.log('fee_split_management table does not exist!');
      return;
    }
    
    // Enable fee splits for tenant_id 121 with 20% tenant share
    const result = await db
      .withSchema(`${process.env.MYSQL_DATABASE}`)
      .from('fee_split_management')
      .where('tenant_id', 121)
      .whereNull('counselor_user_id') // Default tenant-wide configuration
      .update({
        is_fee_split_enabled: 1,
        tenant_share_percentage: 20,
        counselor_share_percentage: 80,
        updated_at: new Date()
      });
    
    if (result === 0) {
      // If no record exists, create one
      const insertResult = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .insert({
          tenant_id: 121,
          counselor_user_id: null,
          is_fee_split_enabled: 1,
          tenant_share_percentage: 20,
          counselor_share_percentage: 80
        });
      
      console.log('Created new fee split configuration for tenant_id 121');
    } else {
      console.log('Updated existing fee split configuration for tenant_id 121');
    }
    
    // Verify the configuration
    const config = await db
      .withSchema(`${process.env.MYSQL_DATABASE}`)
      .from('fee_split_management')
      .where('tenant_id', 121)
      .whereNull('counselor_user_id')
      .first();
    
    console.log('Current fee split configuration for tenant_id 121:', config);
    
  } catch (error) {
    console.error('Error enabling fee splits:', error);
  } finally {
    await db.destroy();
  }
}

enableFeeSplits();
