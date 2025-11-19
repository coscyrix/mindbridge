const knex = require('knex');

// Database connection will be initialized dynamically
let db = null;

async function getDb() {
  if (!db) {
    const DBconn = await import('../config/db.config.js');
    db = knex(DBconn.default.dbConn.development);
  }
  return db;
}

async function verifySessionCalculations() {
  try {
    console.log('🔍 Verifying session calculations...\n');

    // Get all sessions with their service and ref_fees data
    const sessions = await await getDb()
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
      )
      .limit(10); // Limit for testing

    console.log(`📊 Found ${sessions.length} sessions to verify\n`);

    let incorrectSessions = [];
    let correctSessions = [];

    sessions.forEach((session, index) => {
      console.log(`\n--- Session ${index + 1} (ID: ${session.session_id}) ---`);
      console.log(`Service Total Invoice: $${session.total_invoice}`);
      console.log(`Tax Percentage: ${session.tax_pcnt}%`);
      console.log(`System Percentage: ${session.system_pcnt}%`);
      console.log(`Counselor Percentage: ${session.counselor_pcnt}%`);

      // Calculate expected values using the correct formula
      const expectedTaxes = session.total_invoice * (session.tax_pcnt / 100);
      const expectedSystemAmt = (session.total_invoice + expectedTaxes) * (session.system_pcnt / 100);
      const expectedCounselorAmt = session.total_invoice - expectedTaxes - expectedSystemAmt;

      // Calculate using the old incorrect formula (for comparison)
      const oldSystemAmt = (session.total_invoice + expectedTaxes) * session.system_pcnt;

      console.log(`\n📈 Expected Values (Correct Formula):`);
      console.log(`  Taxes: $${expectedTaxes.toFixed(2)}`);
      console.log(`  System Amount: $${expectedSystemAmt.toFixed(2)}`);
      console.log(`  Counselor Amount: $${expectedCounselorAmt.toFixed(2)}`);

      console.log(`\n📉 Old Formula (Incorrect):`);
      console.log(`  System Amount: $${oldSystemAmt.toFixed(2)}`);

      console.log(`\n💾 Stored Values:`);
      console.log(`  Taxes: $${session.session_taxes}`);
      console.log(`  System Amount: $${session.session_system_amt}`);
      console.log(`  Counselor Amount: $${session.session_counselor_amt}`);

      // Check if the stored values match expected values
      const taxDiff = Math.abs(session.session_taxes - expectedTaxes);
      const systemDiff = Math.abs(session.session_system_amt - expectedSystemAmt);
      const counselorDiff = Math.abs(session.session_counselor_amt - expectedCounselorAmt);

      const tolerance = 0.01; // Allow for small rounding differences

      if (taxDiff > tolerance || systemDiff > tolerance || counselorDiff > tolerance) {
        console.log(`❌ MISMATCH DETECTED!`);
        console.log(`  Tax difference: $${taxDiff.toFixed(4)}`);
        console.log(`  System difference: $${systemDiff.toFixed(4)}`);
        console.log(`  Counselor difference: $${counselorDiff.toFixed(4)}`);
        
        // Check if it matches the old formula
        const oldSystemDiff = Math.abs(session.session_system_amt - oldSystemAmt);
        if (oldSystemDiff < tolerance) {
          console.log(`🔍 This session was calculated using the OLD incorrect formula!`);
        }
        
        incorrectSessions.push({
          session_id: session.session_id,
          stored: {
            taxes: session.session_taxes,
            system: session.session_system_amt,
            counselor: session.session_counselor_amt
          },
          expected: {
            taxes: expectedTaxes,
            system: expectedSystemAmt,
            counselor: expectedCounselorAmt
          },
          oldFormula: {
            system: oldSystemAmt
          }
        });
      } else {
        console.log(`✅ Values match expected calculations`);
        correctSessions.push(session.session_id);
      }
    });

    console.log(`\n📋 SUMMARY:`);
    console.log(`✅ Correct sessions: ${correctSessions.length}`);
    console.log(`❌ Incorrect sessions: ${incorrectSessions.length}`);

    if (incorrectSessions.length > 0) {
      console.log(`\n🔧 Sessions that need to be fixed:`);
      incorrectSessions.forEach(session => {
        console.log(`  Session ID ${session.session_id}:`);
        console.log(`    System amount: $${session.stored.system} → $${session.expected.system}`);
        console.log(`    Counselor amount: $${session.stored.counselor} → $${session.expected.counselor}`);
      });
    }

  } catch (error) {
    console.error('❌ Error verifying session calculations:', error);
  } finally {
    await await getDb().destroy();
  }
}

// Run the verification
verifySessionCalculations();
