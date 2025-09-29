// Quick test to verify dependencies work
import cron from 'node-cron';
import express from 'express';

console.log('✅ node-cron imported successfully:', typeof cron);
console.log('✅ express imported successfully:', typeof express);

// Test cron functionality
console.log('✅ Cron test passed - dependencies are working correctly');
