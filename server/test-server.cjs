#!/usr/bin/env node

console.log('🔍 Testing server imports...');

// Test server.js
console.log('\n=== Testing server.js ===');
try {
  require('./server.js');
  console.log('✅ server.js imports work');
} catch (error) {
  console.log('❌ server.js failed:', error.message);
  console.log('Error stack:', error.stack);
}

console.log('\n=== Test complete ===');
