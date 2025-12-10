import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file BEFORE importing db config
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Try multiple possible .env locations
const envPaths = [
  path.resolve(__dirname, '..', '.env'),           // server/.env (most likely)
  path.resolve(process.cwd(), 'server', '.env'),   // From project root
  path.resolve(process.cwd(), '.env'),              // Current directory
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Loaded .env from: ${envPath}\n`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found. Trying environment variables...\n');
}

const knex = require('knex');

// Create DB connection directly (don't import config that was already evaluated)
const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_URL || 'localhost',
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
    timezone: 'Z',
    dateStrings: true,
  },
});

/**
 * Inspect Database Schema - Similar to Prisma's schema visibility
 * Usage: node server/scripts/inspect-schema.js [tableName]
 * Example: node server/scripts/inspect-schema.js user_forms
 * Example: node server/scripts/inspect-schema.js (shows all tables)
 */

async function inspectSchema() {
  try {
    const tableName = process.argv[2];
    const database = process.env.MYSQL_DATABASE;

    // Debug: Check if .env is loaded
    if (!database) {
      console.error('\n❌ ERROR: Environment variables not loaded!\n');
      console.error('Looking for .env file in:');
      console.error(`  - ${path.resolve(process.cwd(), 'server', '.env')}`);
      console.error(`  - ${path.resolve(process.cwd(), '.env')}`);
      console.error('\nMake sure your .env file exists with:');
      console.error('  MYSQL_DATABASE=mind_bridge_db');
      console.error('  MYSQL_USERNAME=your_username');
      console.error('  MYSQL_PASSWORD=your_password');
      console.error('  MYSQL_URL=localhost');
      console.error('  MYSQL_PORT=3306\n');
      process.exit(1);
    }

    if (tableName) {
      // Show specific table schema
      await showTableSchema(database, tableName);
    } else {
      // Show all tables and views
      await showAllTables(database);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error inspecting schema:', error);
    process.exit(1);
  }
}

async function showAllTables(database) {
  console.log('\n📊 DATABASE SCHEMA OVERVIEW\n');
  console.log(`Database: ${database}\n`);

  // Get all tables
  const tables = await db.raw(`
    SELECT 
      TABLE_NAME as name,
      TABLE_TYPE as type,
      TABLE_ROWS as \`rows\`,
      TABLE_COMMENT as comment
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = ?
    ORDER BY TABLE_TYPE, TABLE_NAME
  `, [database]);

  const tablesList = tables[0];

  // Group by type
  const views = tablesList.filter(t => t.type === 'VIEW');
  const regularTables = tablesList.filter(t => t.type === 'BASE TABLE');

  console.log(`📋 TABLES (${regularTables.length}):`);
  console.log('─'.repeat(80));
  regularTables.forEach(table => {
    console.log(`  • ${table.name.padEnd(40)} (${table.rows || 0} rows)`);
  });

  if (views.length > 0) {
    console.log(`\n👁️  VIEWS (${views.length}):`);
    console.log('─'.repeat(80));
    views.forEach(view => {
      console.log(`  • ${view.name}`);
    });
  }

  console.log('\n💡 TIP: Run with table name to see columns:');
  console.log('   node server/scripts/inspect-schema.js user_forms\n');
}

async function showTableSchema(database, tableName) {
  console.log(`\n📋 TABLE/VIEW SCHEMA: ${tableName}\n`);

  // Check if it's a view
  const viewCheck = await db.raw(`
    SELECT TABLE_NAME 
    FROM information_schema.VIEWS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
  `, [database, tableName]);

  const isView = viewCheck[0].length > 0;

  // Get columns
  const columns = await db.raw(`
    SELECT 
      COLUMN_NAME as name,
      COLUMN_TYPE as type,
      IS_NULLABLE as nullable,
      COLUMN_KEY as key_type,
      COLUMN_DEFAULT as default_value,
      EXTRA as extra,
      COLUMN_COMMENT as comment
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION
  `, [database, tableName]);

  if (columns[0].length === 0) {
    console.log(`❌ Table/View '${tableName}' not found!\n`);
    console.log('Run without arguments to see all available tables.\n');
    return;
  }

  console.log(`Type: ${isView ? '👁️  VIEW' : '📋 TABLE'}`);
  console.log('─'.repeat(100));
  console.log('COLUMN NAME'.padEnd(30) + 'TYPE'.padEnd(25) + 'NULL?'.padEnd(8) + 'KEY'.padEnd(8) + 'EXTRA');
  console.log('─'.repeat(100));

  columns[0].forEach(col => {
    const name = col.name.padEnd(30);
    const type = col.type.padEnd(25);
    const nullable = (col.nullable === 'YES' ? '✓' : '✗').padEnd(8);
    const key = (col.key_type || '-').padEnd(8);
    const extra = col.extra || '-';
    
    console.log(`${name}${type}${nullable}${key}${extra}`);
    
    if (col.comment) {
      console.log(`  └─ Comment: ${col.comment}`);
    }
  });

  // Show indexes if it's a table
  if (!isView) {
    const indexes = await db.raw(`
      SHOW INDEX FROM ${database}.${tableName}
    `);

    if (indexes[0].length > 0) {
      console.log('\n📌 INDEXES:');
      console.log('─'.repeat(100));
      
      const indexMap = {};
      indexes[0].forEach(idx => {
        if (!indexMap[idx.Key_name]) {
          indexMap[idx.Key_name] = {
            name: idx.Key_name,
            unique: idx.Non_unique === 0,
            columns: []
          };
        }
        indexMap[idx.Key_name].columns.push(idx.Column_name);
      });

      Object.values(indexMap).forEach(idx => {
        const type = idx.unique ? '🔑 UNIQUE' : '📍 INDEX';
        console.log(`  ${type} ${idx.name}: (${idx.columns.join(', ')})`);
      });
    }
  }

  // If it's a view, show the view definition
  if (isView) {
    console.log('\n🔍 VIEW DEFINITION:');
    console.log('─'.repeat(100));
    const viewDef = await db.raw(`SHOW CREATE VIEW ${database}.${tableName}`);
    if (viewDef[0][0]) {
      console.log(viewDef[0][0]['Create View']);
    }
  }

  console.log('\n');
}

// Run the script
inspectSchema();

