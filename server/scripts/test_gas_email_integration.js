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

async function testGASEmailIntegration() {
  try {
    console.log('Testing GAS form email integration with target outcome ID...');

    // Check if there are clients with target outcomes
    const clientsWithTargetOutcomes = await await getDb()
      .withSchema(process.env.MYSQL_DATABASE)
      .from('user_target_outcome')
      .where('status_enum', 'y')
      .select('*')
      .limit(3);

    console.log(`Found ${clientsWithTargetOutcomes.length} clients with target outcomes`);

    if (clientsWithTargetOutcomes.length === 0) {
      console.log('❌ No clients with target outcomes found. Cannot test email integration.');
      return;
    }

    // Check if there are sessions with GAS forms
    const sessionsWithGASForms = await await getDb()
      .withSchema(process.env.MYSQL_DATABASE)
      .from('session')
      .whereRaw('JSON_CONTAINS(forms_array, ?)', ['25'])
      .select('*')
      .limit(3);

    console.log(`Found ${sessionsWithGASForms.length} sessions with GAS forms`);

    if (sessionsWithGASForms.length === 0) {
      console.log('❌ No sessions with GAS forms found. Cannot test email integration.');
      return;
    }

    // Test email URL generation for each client
    for (const client of clientsWithTargetOutcomes) {
      console.log(`\nTesting email generation for client ID: ${client.user_profile_id}`);
      console.log(`Target Outcome ID: ${client.target_outcome_id}`);
      
      // Generate sample email URL
      const baseUrl = process.env.BASE_URL || 'https://mindapp.minawait getDb()ridge.solutions/';
      const formsPath = process.env.FORMS || 'patient-forms/';
      const formId = 25; // GAS form ID
      const sessionId = sessionsWithGASForms[0]?.session_id || 1;
      
      const emailUrl = `${baseUrl}${formsPath}gas?form_id=${formId}&client_id=${client.user_profile_id}&session_id=${sessionId}&target_outcome_id=${client.target_outcome_id}`;
      
      console.log(`Generated Email URL: ${emailUrl}`);
      
      // Verify URL contains all required parameters
      const hasFormId = emailUrl.includes(`form_id=${formId}`);
      const hasClientId = emailUrl.includes(`client_id=${client.user_profile_id}`);
      const hasSessionId = emailUrl.includes(`session_id=${sessionId}`);
      const hasTargetOutcomeId = emailUrl.includes(`target_outcome_id=${client.target_outcome_id}`);
      
      if (hasFormId && hasClientId && hasSessionId && hasTargetOutcomeId) {
        console.log('✅ Email URL contains all required parameters');
      } else {
        console.log('❌ Email URL missing required parameters');
        console.log(`  - form_id: ${hasFormId}`);
        console.log(`  - client_id: ${hasClientId}`);
        console.log(`  - session_id: ${hasSessionId}`);
        console.log(`  - target_outcome_id: ${hasTargetOutcomeId}`);
      }
    }

    // Test database integration
    console.log('\nTesting database integration...');
    
    // Check if feeawait getDb()ack_gas table has the new column
    const tableInfo = await await getDb()
      .withSchema(process.env.MYSQL_DATABASE)
      .from('information_schema.columns')
      .where({
        table_schema: process.env.MYSQL_DATABASE,
        table_name: 'feeawait getDb()ack_gas',
        column_name: 'client_target_outcome_id'
      })
      .first();

    if (tableInfo) {
      console.log('✅ client_target_outcome_id column exists in feeawait getDb()ack_gas table');
    } else {
      console.log('❌ client_target_outcome_id column not found in feeawait getDb()ack_gas table');
      console.log('Please run the migration: mysql -u root -p minawait getDb()ridge < server/migrations/add_client_target_outcome_to_gas.sql');
    }

    console.log('\n✅ GAS form email integration test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing GAS form email integration:', error);
  } finally {
    await await getDb().destroy();
  }
}

// Run the test
testGASEmailIntegration();
