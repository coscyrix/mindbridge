const knex = require('knex');
const DBconn = require('../config/db.config.js');

const db = knex(DBconn.dbConn.development);

async function fixSessionCalculations() {
  try {
    console.log('🔧 Fixing session calculations...\n');

    // Get all sessions that need to be fixed
    const sessionsToFix = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('session as s')
      .join('service as svc', 's.service_id', 'svc.service_id')
      .join('ref_fees as rf', 's.tenant_id', 'rf.tenant_id')
      .select(
        's.session_id',
        's.session_price',
        's.session_taxes',
        's.session_system_amt',
        's.session_counselor_amt',
        'svc.total_invoice',
        'rf.tax_pcnt',
        'rf.counselor_pcnt',
        'rf.system_pcnt'
      );

    console.log(`📊 Found ${sessionsToFix.length} sessions to check\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const session of sessionsToFix) {
      // Calculate expected values using the correct formula
      const expectedTaxes = session.total_invoice * (session.tax_pcnt / 100);
      const expectedSystemAmt = (session.total_invoice + expectedTaxes) * (session.system_pcnt / 100);
      const expectedCounselorAmt = session.total_invoice - expectedTaxes - expectedSystemAmt;

      // Calculate using the old incorrect formula (for comparison)
      const oldSystemAmt = (session.total_invoice + expectedTaxes) * session.system_pcnt;

      // Check if the stored values match expected values
      const taxDiff = Math.abs(session.session_taxes - expectedTaxes);
      const systemDiff = Math.abs(session.session_system_amt - expectedSystemAmt);
      const counselorDiff = Math.abs(session.session_counselor_amt - expectedCounselorAmt);

      const tolerance = 0.01; // Allow for small rounding differences

      // Check if it matches the old formula (indicating it was calculated incorrectly)
      const oldSystemDiff = Math.abs(session.session_system_amt - oldSystemAmt);
      const wasCalculatedIncorrectly = oldSystemDiff < tolerance;

      if (wasCalculatedIncorrectly) {
        console.log(`🔧 Fixing Session ID ${session.session_id}:`);
        console.log(`  Old System Amount: $${session.session_system_amt}`);
        console.log(`  New System Amount: $${expectedSystemAmt.toFixed(4)}`);
        console.log(`  Old Counselor Amount: $${session.session_counselor_amt}`);
        console.log(`  New Counselor Amount: $${expectedCounselorAmt.toFixed(4)}`);

        // Update the session with correct values
        await db
          .withSchema(process.env.MYSQL_DATABASE)
          .from('session')
          .where('session_id', session.session_id)
          .update({
            session_taxes: expectedTaxes,
            session_system_amt: expectedSystemAmt,
            session_counselor_amt: expectedCounselorAmt
          });

        fixedCount++;
        console.log(`  ✅ Fixed!\n`);
      } else {
        skippedCount++;
      }
    }

    console.log(`📋 SUMMARY:`);
    console.log(`✅ Fixed sessions: ${fixedCount}`);
    console.log(`⏭️ Skipped sessions: ${skippedCount}`);
    console.log(`📊 Total processed: ${sessionsToFix.length}`);

    if (fixedCount > 0) {
      console.log(`\n🎉 Successfully fixed ${fixedCount} sessions with incorrect calculations!`);
    } else {
      console.log(`\n✅ No sessions needed fixing - all calculations are correct!`);
    }

  } catch (error) {
    console.error('❌ Error fixing session calculations:', error);
  } finally {
    await db.destroy();
  }
}

// Run the fix
fixSessionCalculations();
