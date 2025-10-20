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

async function testTreatmentTargetFormAttachment() {
  try {
    console.log('Testing Treatment Target Form Attachment Functionality...\n');

    // Test 1: Check if treatment_target_feeawait getDb()ack_config table exists
    console.log('1. Checking treatment_target_feeawait getDb()ack_config table...');
    const configTableExists = await await getDb().schema.hasTable('treatment_target_feeawait getDb()ack_config');
    if (configTableExists) {
      console.log('✅ treatment_target_feeawait getDb()ack_config table exists');
    } else {
      console.log('❌ treatment_target_feeawait getDb()ack_config table does not exist');
      return;
    }

    // Test 1.1: Check if treatment_target_session_forms table exists
    console.log('1.1. Checking treatment_target_session_forms table...');
    const sessionFormsTableExists = await await getDb().schema.hasTable('treatment_target_session_forms');
    if (sessionFormsTableExists) {
      console.log('✅ treatment_target_session_forms table exists');
    } else {
      console.log('❌ treatment_target_session_forms table does not exist');
      console.log('Please run the migration: server/migrations/treatment_target_session_forms.sql');
      return;
    }

    // Test 2: Check existing configurations
    console.log('\n2. Checking existing configurations...');
    const configs = await await getDb()
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_feeawait getDb()ack_config')
      .select('*');

    console.log(`Found ${configs.length} existing configurations:`);
    configs.forEach(config => {
      console.log(`  - ${config.treatment_target}: ${config.form_name} (sessions: ${JSON.stringify(config.sessions)})`);
    });

    // Test 3: Check forms table for form names used in configurations
    console.log('\n3. Verifying form names in forms table...');
    const formNames = configs.map(config => config.form_name);
    const uniqueFormNames = [...new Set(formNames)];

    for (const formName of uniqueFormNames) {
      const form = await await getDb()
        .withSchema(process.env.MYSQL_DATABASE)
        .from('forms')
        .where('form_cde', formName)
        .first();

      if (form) {
        console.log(`✅ Form "${formName}" exists with ID: ${form.form_id}`);
      } else {
        console.log(`❌ Form "${formName}" not found in forms table`);
      }
    }

    // Test 4: Check therapy requests
    console.log('\n4. Checking therapy requests...');
    const therapyRequests = await await getDb()
      .withSchema(process.env.MYSQL_DATABASE)
      .from('v_thrpy_req')
      .select('req_id', 'client_id', 'counselor_id', 'service_id')
      .limit(5);

    console.log(`Found ${therapyRequests.length} therapy requests:`);
    therapyRequests.forEach(req => {
      console.log(`  - Req ID: ${req.req_id}, Client: ${req.client_id}, Counselor: ${req.counselor_id}`);
    });

    // Test 5: Check sessions for a therapy request
    if (therapyRequests.length > 0) {
      console.log('\n5. Checking sessions for first therapy request...');
      const firstReq = therapyRequests[0];
      
      const sessions = await await getDb()
        .withSchema(process.env.MYSQL_DATABASE)
        .from('session')
        .where('req_id', firstReq.req_id)
        .select('session_id', 'session_number', 'forms_array', 'is_report');

      console.log(`Found ${sessions.length} sessions for req_id ${firstReq.req_id}:`);
      sessions.forEach(session => {
        console.log(`  - Session ${session.session_id}: number=${session.session_number}, forms=${session.forms_array}, is_report=${session.is_report}`);
      });
    }

    // Test 6: Check treatment_target_session_forms table structure
    console.log('\n6. Checking treatment_target_session_forms table structure...');
    const sessionFormsColumns = await await getDb()
      .withSchema(process.env.MYSQL_DATABASE)
      .from('treatment_target_session_forms')
      .columnInfo();

    const requiredSessionFormColumns = [
      'req_id', 'session_id', 'client_id', 'counselor_id', 
      'treatment_target', 'form_name', 'form_id', 'config_id', 
      'purpose', 'session_number', 'is_sent', 'tenant_id'
    ];
    
    for (const column of requiredSessionFormColumns) {
      if (sessionFormsColumns[column]) {
        console.log(`✅ Column "${column}" exists in treatment_target_session_forms table`);
      } else {
        console.log(`❌ Column "${column}" missing from treatment_target_session_forms table`);
      }
    }

    // Test 6.1: Check user_forms table structure (for service-based forms)
    console.log('\n6.1. Checking user_forms table structure...');
    const userFormsColumns = await await getDb()
      .withSchema(process.env.MYSQL_DATABASE)
      .from('user_forms')
      .columnInfo();

    const requiredUserFormColumns = ['client_id', 'counselor_id', 'form_id', 'session_id', 'is_sent'];
    for (const column of requiredUserFormColumns) {
      if (userFormsColumns[column]) {
        console.log(`✅ Column "${column}" exists in user_forms table`);
      } else {
        console.log(`❌ Column "${column}" missing from user_forms table`);
      }
    }

    // Test 7: Check treatment targets from constants
    console.log('\n7. Checking treatment targets...');
    const treatmentTargets = [
      'Anxiety', 'Depression', 'Stress Management', 'Relationship Issues',
      'Grief and Loss', 'Trauma and PTSD', 'Self-Esteem and Self-Confidence Issues',
      'Addiction and Substance Abuse', 'Identity and Self-Exploration',
      'Family and Parenting Issues', 'Work and Career-Related Issues',
      'Chronic Illness and Health-Related Concerns', 'Anger Management',
      'Eating Disorders and Body Image Issues', 'Life Transitions',
      'Coping with Disability', 'Other'
    ];

    console.log('Supported treatment targets:');
    treatmentTargets.forEach(target => {
      const hasConfig = configs.some(config => config.treatment_target === target);
      if (hasConfig) {
        console.log(`✅ "${target}" - has configurations`);
      } else {
        console.log(`⚠️  "${target}" - no configurations found`);
      }
    });

    console.log('\n✅ Treatment Target Form Attachment test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Use the API endpoints to test form attachment:');
    console.log('   - POST /api/thrpyReq/load-session-forms');
    console.log('   - POST /api/treatment-target-feeawait getDb()ack-config/load-session-forms');
    console.log('2. Verify that forms are properly attached to sessions');
    console.log('3. Check that user_forms records are created correctly');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await await getDb().destroy();
  }
}

// Run the test
testTreatmentTargetFormAttachment();
