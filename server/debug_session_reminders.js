// Debug script to manually trigger the 24-hour session reminder cron job
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
import Session from './models/session.js';

dotenv.config();

async function debugSessionReminders() {
  try {
    console.log('🔍 Testing 24-hour session reminder cron job...\n');
    
    const session = new Session();
    
    console.log('⏰ Running send24HourSessionReminders()...\n');
    const result = await session.send24HourSessionReminders();
    
    console.log('\n✅ Reminder cron job completed!');
    console.log('📊 Results:', JSON.stringify(result, null, 2));
    
    if (result.remindersSent !== undefined) {
      console.log(`\n📧 Reminders sent: ${result.remindersSent}`);
      console.log(`❌ Errors: ${result.errors}`);
      console.log(`⏭️  Skipped: ${result.skipped || 0}`);
      console.log(`🔍 Total sessions checked: ${result.totalChecked}`);
      
      if (result.skipReasons) {
        console.log('\n⏭️  Skip reasons:');
        console.log(`   - Already sent: ${result.skipReasons.alreadySent || 0}`);
        console.log(`   - Outside time window (not 23-25 hours): ${result.skipReasons.timeWindow || 0}`);
        console.log(`   - Client profile not found: ${result.skipReasons.clientProfile || 0}`);
        console.log(`   - Client email not found: ${result.skipReasons.clientEmail || 0}`);
        console.log(`   - Counselor profile not found: ${result.skipReasons.counselorProfile || 0}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error running session reminder cron job:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Exit process
    process.exit(0);
  }
}

// Run the debug
debugSessionReminders();

