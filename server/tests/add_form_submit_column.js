/**
 * Script to add form_submit column to treatment_target_session_forms table
 */

import dotenv from 'dotenv';
import knex from 'knex';
import DBconn from '../config/db.config.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);

async function addFormSubmitColumn() {
  console.log('🔧 Adding form_submit column to treatment_target_session_forms table...\n');

  try {
    // Check if column already exists
    const columns = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .columnInfo();

    if (columns.form_submit) {
      console.log('✅ form_submit column already exists');
      return;
    }

    // Add form_submit column
    await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .alterTable('treatment_target_session_forms', function(table) {
        table.tinyint('form_submit', 1).defaultTo(0).comment('Whether the form has been submitted by the client');
      });

    console.log('✅ form_submit column added successfully');

    // Add indexes
    await db.raw(`
      ALTER TABLE ${process.env.MYSQL_DATABASE}.treatment_target_session_forms 
      ADD INDEX idx_form_submit (form_submit)
    `);

    await db.raw(`
      ALTER TABLE ${process.env.MYSQL_DATABASE}.treatment_target_session_forms 
      ADD INDEX idx_session_form_submit (session_id, form_submit)
    `);

    console.log('✅ Indexes added successfully');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

// Run the script
addFormSubmitColumn().catch(console.error);
