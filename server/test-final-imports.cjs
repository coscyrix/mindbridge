#!/usr/bin/env node

console.log('🔍 Testing final imports after fixes...');

// Test server.js
console.log('\n=== Testing server.js ===');
try {
  require('./server.js');
  console.log('✅ server.js imports successfully');
} catch (error) {
  console.log('❌ server.js failed:', error.message);
}

// Test a few key route files
const routeFiles = [
  'routes/user.js',
  'routes/userProfile.js', 
  'routes/feedback.js',
  'routes/session.js',
  'routes/service.js'
];

console.log('\n=== Testing route files ===');
routeFiles.forEach(file => {
  try {
    require(`./${file}`);
    console.log(`✅ ${file} imports successfully`);
  } catch (error) {
    console.log(`❌ ${file} failed:`, error.message);
  }
});

console.log('\n🎉 Import testing complete!');
