import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;

const db = knex(DBconn.dbConn.development);

async function checkFeeSplits() {
  try {
    console.log('Checking fee split configurations for tenant_id 121...');
    
    // Check if fee_split_management table exists
    const tableExists = await db.schema.hasTable('fee_split_management');
    console.log('fee_split_management table exists:', tableExists);
    
    if (!tableExists) {
      console.log('fee_split_management table does not exist!');
      return;
    }
    
    // Get all fee split configurations for tenant_id 121
    const configs = await db
      .withSchema(`${process.env.MYSQL_DATABASE}`)
      .from('fee_split_management')
      .where('tenant_id', 121)
      .andWhere('status_yn', 1)
      .select('*');
    
    console.log('Fee split configurations for tenant_id 121:', configs);
    
    // Check if there are any counselors for this tenant
    const counselors = await db
      .withSchema(`${process.env.MYSQL_DATABASE}`)
      .from('users')
      .where('tenant_id', 121)
      .andWhere('role_id', 2)
      .andWhere('status_yn', 'y')
      .select('user_id', 'name', 'email');
    
    console.log('Counselors for tenant_id 121:', counselors);
    
    // Check if there are any sessions for this tenant
    const sessions = await db
      .withSchema(`${process.env.MYSQL_DATABASE}`)
      .from('session')
      .where('tenant_id', 121)
      .andWhere('status_yn', 'y')
      .select('session_id', 'counselor_id', 'session_price')
      .limit(5);
    
    console.log('Sample sessions for tenant_id 121:', sessions);
    
  } catch (error) {
    console.error('Error checking fee splits:', error);
  } finally {
    await db.destroy();
  }
}

checkFeeSplits();
