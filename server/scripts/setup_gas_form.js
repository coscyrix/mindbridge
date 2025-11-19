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

async function setupGASForm() {
  try {
    console.log('Setting up GAS form for automatic sending...');

    // Check if GAS form already exists
    const existingForm = await await getDb()
      .withSchema(process.env.MYSQL_DATABASE)
      .from('forms')
      .where('form_id', 25)
      .first();

    if (existingForm) {
      console.log('GAS form already exists with form_id: 25');
      return;
    }

    // Insert GAS form
    const result = await await getDb()
      .withSchema(process.env.MYSQL_DATABASE)
      .from('forms')
      .insert({
        form_id: 25,
        form_cde: 'GAS',
        frequency_desc: 'goal attainment scaling assessment',
        frequency_typ: 'static',
        session_position: JSON.stringify([1, 3, 5]), // Send on sessions 1, 3, and 5
        svc_ids: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]), // All services
        form_sequence_id: 1,
        status_yn: 1,
        tenant_id: 1 // Default tenant_id
      });

    console.log('GAS form added successfully with form_id: 25');
    console.log('Form will be automatically sent on sessions 1, 3, and 5');
    
  } catch (error) {
    console.error('Error setting up GAS form:', error);
  } finally {
    await await getDb().destroy();
  }
}

// Run the setup
setupGASForm(); 