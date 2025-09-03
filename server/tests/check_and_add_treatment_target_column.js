/**
 * Script to check and add treatment_target column to thrpy_req table
 */

import dotenv from 'dotenv';
import knex from 'knex';
import DBconn from '../config/db.config.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);

async function checkAndAddTreatmentTargetColumn() {
  console.log('🔍 Checking treatment_target column in thrpy_req table...\n');

  try {
    // Check if the column exists
    const columns = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('thrpy_req')
      .columnInfo();
    
    const hasTreatmentTarget = 'treatment_target' in columns;
    console.log(`treatment_target column exists: ${hasTreatmentTarget ? '✅ YES' : '❌ NO'}`);
    
    if (!hasTreatmentTarget) {
      console.log('\n🛠️ Adding treatment_target column...');
      
      // Add the column
      await db.raw(`
        ALTER TABLE ${process.env.MYSQL_DATABASE}.thrpy_req 
        ADD COLUMN treatment_target VARCHAR(255) NULL AFTER tenant_id
      `);
      
      // Add index
      await db.raw(`
        CREATE INDEX idx_treatment_target ON ${process.env.MYSQL_DATABASE}.thrpy_req(treatment_target)
      `);
      
      console.log('✅ treatment_target column added successfully!');
      
      // Verify the column was added
      const newColumns = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('thrpy_req')
        .columnInfo();
      
      const nowHasTreatmentTarget = 'treatment_target' in newColumns;
      console.log(`Verification: treatment_target column exists: ${nowHasTreatmentTarget ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('✅ Column already exists, no action needed.');
    }
    
    // Show current table structure
    console.log('\n📋 Current thrpy_req table structure:');
    const allColumns = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('thrpy_req')
      .columnInfo();
    
    Object.keys(allColumns).forEach(columnName => {
      const column = allColumns[columnName];
      console.log(`  - ${columnName}: ${column.type}${column.nullable ? ' (nullable)' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

// Run the script
checkAndAddTreatmentTargetColumn().catch(console.error);
