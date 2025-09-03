const knex = require('knex');
const DBconn = require('../config/db.config.js');

const db = knex(DBconn.dbConn.development);

async function testGASFormTargetOutcome() {
  try {
    console.log('Testing GAS form client target outcome integration...');

    // Check if the client_target_outcome_id column exists
    const tableInfo = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('information_schema.columns')
      .where({
        table_schema: process.env.MYSQL_DATABASE,
        table_name: 'feedback_gas',
        column_name: 'client_target_outcome_id'
      })
      .first();

    if (tableInfo) {
      console.log('✅ client_target_outcome_id column exists in feedback_gas table');
    } else {
      console.log('❌ client_target_outcome_id column not found in feedback_gas table');
      console.log('Please run the migration: mysql -u root -p mindbridge < migrations/add_client_target_outcome_to_gas.sql');
      return;
    }

    // Check if there are any existing GAS form submissions
    const existingSubmissions = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('feedback_gas')
      .select('*')
      .limit(5);

    console.log(`Found ${existingSubmissions.length} existing GAS form submissions`);

    if (existingSubmissions.length > 0) {
      console.log('Sample submission data:');
      existingSubmissions.forEach((submission, index) => {
        console.log(`  ${index + 1}. ID: ${submission.id}, Goal: ${submission.goal}, Target Outcome ID: ${submission.client_target_outcome_id || 'NULL'}`);
      });
    }

    // Check if there are clients with target outcomes
    const clientsWithTargetOutcomes = await db
      .withSchema(process.env.MYSQL_DATABASE)
      .from('user_target_outcome')
      .where('status_enum', 'y')
      .select('*')
      .limit(5);

    console.log(`Found ${clientsWithTargetOutcomes.length} clients with target outcomes`);

    if (clientsWithTargetOutcomes.length > 0) {
      console.log('Sample client target outcome data:');
      clientsWithTargetOutcomes.forEach((client, index) => {
        console.log(`  ${index + 1}. User ID: ${client.user_profile_id}, Target Outcome ID: ${client.target_outcome_id}`);
      });
    }

    console.log('\n✅ GAS form client target outcome integration test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing GAS form target outcome integration:', error);
  } finally {
    await db.destroy();
  }
}

// Run the test
testGASFormTargetOutcome();
