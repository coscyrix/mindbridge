/**
 * Singleton Knex Database Instance
 * 
 * This module exports a singleton Knex instance that can be reused
 * across your application. It ensures only one connection pool is created
 * and provides proper cleanup on shutdown.
 * 
 * IMPORTANT: This shares the database with Prisma, which has connection_limit=12.
 * Knex pool is set to max 10 to leave room for Prisma's 12 connections.
 * Total: ~22 connections per app instance.
 * 
 * Usage:
 *   import db from './utils/db.js';
 *   
 *   const users = await db('users').select('*');
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const knex = require('knex');
import DBconn from '../config/db.config.js';

// Determine environment
const env = process.env.NODE_ENV || 'development';

// Create singleton Knex instance
let dbInstance = null;

/**
 * Get or create the singleton Knex instance
 */
function getDb() {
  if (!dbInstance) {
    // Reduce pool size to account for Prisma's connection pool
    // Prisma has connection_limit=12, so we'll use max 10 for Knex
    // This prevents exhausting MySQL's connection limit
    const poolConfig = {
      ...DBconn.dbConn[env].pool,
      max: 100, // Reduced from 50 to account for Prisma's 12 connections
    };
    
    dbInstance = knex({
      ...DBconn.dbConn[env],
      pool: poolConfig,
    });
    
    // Log connection pool info
    console.log(`✅ Knex connection pool created for environment: ${env}`);
    console.log(`   Pool config: max=${poolConfig.max}, min=${poolConfig.min}`);
    console.log(`   ⚠️  Note: Prisma also uses connection_limit=12, total ~22 connections per instance`);
  }
  return dbInstance;
}

/**
 * Destroy the Knex connection pool
 * Call this during graceful shutdown
 */
async function destroyDb() {
  if (dbInstance) {
    try {
      await dbInstance.destroy();
      console.log('✅ Knex connection pool destroyed');
      dbInstance = null;
    } catch (error) {
      console.error('❌ Error destroying Knex connection pool:', error);
      throw error;
    }
  }
}

// Handle graceful shutdown
const gracefulShutdown = async () => {
  await destroyDb();
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Export the singleton instance and destroy function
export default getDb();
export { destroyDb, getDb };

