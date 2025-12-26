#!/usr/bin/env node

/**
 * Script to help convert raw SQL migrations to Prisma format
 * 
 * This script:
 * 1. Sets up the DATABASE_URL environment variable from existing config
 * 2. Provides instructions for running Prisma introspection
 * 
 * Usage:
 *   node scripts/convert-to-prisma.js
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../#Environment Configuration.env') });

const MYSQL_URL = process.env.MYSQL_URL;
const MYSQL_USERNAME = process.env.MYSQL_USERNAME;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_PORT = process.env.MYSQL_PORT || '3306';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

if (!MYSQL_URL || !MYSQL_USERNAME || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
  console.error('❌ Missing required database configuration in environment file');
  console.error('Required: MYSQL_URL, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE');
  process.exit(1);
}

// Construct DATABASE_URL for Prisma
const DATABASE_URL = `mysql://${encodeURIComponent(MYSQL_USERNAME)}:${encodeURIComponent(MYSQL_PASSWORD)}@${MYSQL_URL}:${MYSQL_PORT}/${MYSQL_DATABASE}`;

console.log('🔧 Prisma Migration Helper');
console.log('==========================\n');

console.log('📋 Database Configuration:');
console.log(`   Host: ${MYSQL_URL}`);
console.log(`   Port: ${MYSQL_PORT}`);
console.log(`   Database: ${MYSQL_DATABASE}`);
console.log(`   User: ${MYSQL_USERNAME}\n`);

// Check if .env file exists
const envPath = join(__dirname, '../.env');
const envExamplePath = join(__dirname, '../.env.example');

if (!existsSync(envPath)) {
  console.log('📝 Creating .env file with DATABASE_URL...');
  writeFileSync(envPath, `# Prisma Database URL\nDATABASE_URL="${DATABASE_URL}"\n`);
  console.log('✅ Created .env file\n');
} else {
  // Check if DATABASE_URL exists in .env
  const envContent = readFileSync(envPath, 'utf-8');
  if (!envContent.includes('DATABASE_URL')) {
    console.log('📝 Adding DATABASE_URL to existing .env file...');
    writeFileSync(envPath, `${envContent}\n# Prisma Database URL\nDATABASE_URL="${DATABASE_URL}"\n`);
    console.log('✅ Updated .env file\n');
  } else {
    console.log('✅ DATABASE_URL already exists in .env file\n');
  }
}

console.log('🚀 Next Steps:');
console.log('==============\n');
console.log('1. Install Prisma dependencies:');
console.log('   npm install\n');
console.log('2. Run Prisma database introspection to generate schema:');
console.log('   npm run prisma:db:pull\n');
console.log('   This will automatically convert your existing database tables');
console.log('   into Prisma schema models.\n');
console.log('3. Generate Prisma Client:');
console.log('   npm run prisma:generate\n');
console.log('4. (Optional) Open Prisma Studio to view your database:');
console.log('   npm run prisma:studio\n');
console.log('📚 For more information, see: PRISMA_MIGRATION_GUIDE.md\n');

