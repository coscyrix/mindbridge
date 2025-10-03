#!/usr/bin/env node

console.log('🔍 Docker Debug Information');
console.log('========================');

// Check Node.js version
console.log('Node.js version:', process.version);

// Check current working directory
console.log('Current working directory:', process.cwd());

// Check if node_modules exists
const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(process.cwd(), 'node_modules');
console.log('node_modules exists:', fs.existsSync(nodeModulesPath));

if (fs.existsSync(nodeModulesPath)) {
  console.log('node_modules contents:');
  try {
    const contents = fs.readdirSync(nodeModulesPath);
    console.log('Total packages:', contents.length);
    console.log('Has node-cron:', contents.includes('node-cron'));
    
    // Check specific packages
    const importantPackages = ['node-cron', 'express', 'cors', 'dotenv'];
    importantPackages.forEach(pkg => {
      const pkgPath = path.join(nodeModulesPath, pkg);
      console.log(`${pkg}:`, fs.existsSync(pkgPath) ? '✅' : '❌');
    });
  } catch (error) {
    console.log('Error reading node_modules:', error.message);
  }
}

// Try to require node-cron
console.log('\n🔍 Testing node-cron import...');
try {
  const cron = require('node-cron');
  console.log('✅ node-cron imported successfully');
  console.log('node-cron version:', require('node-cron/package.json').version);
} catch (error) {
  console.log('❌ Failed to import node-cron:', error.message);
  console.log('Error code:', error.code);
}

// Check package.json
console.log('\n🔍 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('Package name:', packageJson.name);
  console.log('Dependencies count:', Object.keys(packageJson.dependencies || {}).length);
  console.log('Has node-cron in dependencies:', !!packageJson.dependencies?.['node-cron']);
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('\n========================');
console.log('Debug complete');
