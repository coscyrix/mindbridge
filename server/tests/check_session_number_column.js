/**
 * Script to check and add session_number column to session table
 */

import dotenv from 'dotenv';
import knex from 'knex';
import DBconn from '../config/db.config.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);

async function checkAndAddSessionNumberColumn() {
  console.log('🔍 Checking session_number column in session table...\n');

  try {
    // Check if the column exists
    const columns = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('session')
      .columnInfo();
    
    const hasSessionNumber = 'session_number' in columns;
    console.log(`session_number column exists: ${hasSessionNumber ? '✅ YES' : '❌ NO'}`);
    
    if (!hasSessionNumber) {
      console.log('\n🛠️ Adding session_number column...');
      
      // Add the column
      await db.raw(`
        ALTER TABLE ${process.env.MYSQL_DATABASE}.session 
        ADD COLUMN session_number INT NULL AFTER session_id
      `);
      
      // Add index
      await db.raw(`
        CREATE INDEX idx_session_number ON ${process.env.MYSQL_DATABASE}.session(session_number)
      `);
      
      console.log('✅ session_number column added successfully!');
      
      // Update existing sessions with session numbers
      console.log('\n🔄 Updating existing sessions with session numbers...');
      const sessions = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('session')
        .select('session_id', 'thrpy_req_id')
        .orderBy('thrpy_req_id', 'asc')
        .orderBy('session_id', 'asc');
      
      let currentReqId = null;
      let sessionCounter = 1;
      
      for (const session of sessions) {
        if (session.thrpy_req_id !== currentReqId) {
          currentReqId = session.thrpy_req_id;
          sessionCounter = 1;
        }
        
        await db
          .withSchema(process.env.MYSQL_DATABASE)
          .from('session')
          .where('session_id', session.session_id)
          .update({ session_number: sessionCounter });
        
        sessionCounter++;
      }
      
      console.log(`✅ Updated ${sessions.length} sessions with session numbers`);
      
      // Verify the column was added
      const newColumns = await db
        .withSchema(process.env.MYSQL_DATABASE)
        .from('session')
        .columnInfo();
      
      const nowHasSessionNumber = 'session_number' in newColumns;
      console.log(`Verification: session_number column exists: ${nowHasSessionNumber ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('✅ Column already exists, no action needed.');
    }
    
    // Show current table structure
    console.log('\n📋 Current session table structure:');
    const allColumns = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('session')
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
checkAndAddSessionNumberColumn().catch(console.error);
