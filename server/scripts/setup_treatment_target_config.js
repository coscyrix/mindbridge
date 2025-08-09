import TreatmentTargetFeedbackConfigService from '../services/treatmentTargetFeedbackConfig.js';
import logger from '../config/winston.js';

/**
 * Script to set up treatment target feedback configurations
 * This script can be used to convert table data to JSON format and bulk create configurations
 */

const service = new TreatmentTargetFeedbackConfigService();

/**
 * Example table data - replace with your actual table data
 * Format: { treatment_target, tool, purpose, frequency }
 */
const exampleTableData = [
  {
    treatment_target: 'Anxiety',
    tool: 'GAD-7',
    purpose: 'Measure anxiety severity and track treatment progress',
    frequency: 'Sessions 1, 5, 10, 15, 20'
  },
  {
    treatment_target: 'Anxiety',
    tool: 'WHODAS',
    purpose: 'Assess functional impairment due to anxiety',
    frequency: 'Sessions 1, 10, 20'
  },
  {
    treatment_target: 'Depression',
    tool: 'PHQ-9',
    purpose: 'Measure depression severity and monitor treatment response',
    frequency: 'Sessions 1, 5, 10, 15, 20'
  },
  {
    treatment_target: 'Depression',
    tool: 'WHODAS',
    purpose: 'Assess functional impairment due to depression',
    frequency: 'Sessions 1, 10, 20'
  },
  {
    treatment_target: 'PTSD',
    tool: 'PCL-5',
    purpose: 'Assess PTSD symptoms and treatment progress',
    frequency: 'Sessions 1, 5, 10, 15, 20'
  },
  {
    treatment_target: 'PTSD',
    tool: 'WHODAS',
    purpose: 'Assess functional impairment due to PTSD',
    frequency: 'Sessions 1, 10, 20'
  },
  {
    treatment_target: 'General Mental Health',
    tool: 'GAS',
    purpose: 'Goal Attainment Scaling for treatment goal tracking',
    frequency: 'Trans 1 & last'
  },
  {
    treatment_target: 'General Mental Health',
    tool: 'SMART Goals',
    purpose: 'Track progress on specific treatment goals',
    frequency: 'OTR & -OTR'
  },
  {
    treatment_target: 'General Mental Health',
    tool: 'Consent Form',
    purpose: 'Document informed consent for treatment',
    frequency: 'Session 1'
  },
  {
    treatment_target: 'General Mental Health',
    tool: 'Attendance',
    purpose: 'Track session attendance and engagement',
    frequency: 'Sessions 1, 5, 10, 15, 20'
  }
];

/**
 * Convert table data to JSON format
 */
async function convertTableToJSON() {
  try {
    console.log('Converting table data to JSON format...');
    
    const jsonData = service.convertTableToJSON(exampleTableData);
    
    if (jsonData.error) {
      console.error('Error converting table data:', jsonData.message);
      return;
    }

    console.log('JSON Format:');
    console.log(JSON.stringify(jsonData, null, 2));
    
    return jsonData;
  } catch (error) {
    console.error('Error in convertTableToJSON:', error);
  }
}

/**
 * Bulk create configurations from JSON data
 */
async function bulkCreateFromJSON(jsonData) {
  try {
    console.log('Bulk creating configurations from JSON...');
    
    const result = await service.bulkCreateFromJSON(jsonData);
    
    if (result.error) {
      console.error('Error in bulk create:', result.message);
      return;
    }

    console.log('Bulk create result:');
    console.log(`- Successful: ${result.successful}`);
    console.log(`- Failed: ${result.failed}`);
    
    if (result.errors.length > 0) {
      console.log('Errors:');
      result.errors.forEach(error => {
        console.log(`  - ${error.error}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in bulkCreateFromJSON:', error);
  }
}

/**
 * Test session checking functionality
 */
async function testSessionChecking() {
  try {
    console.log('Testing session checking functionality...');
    
    const testCases = [
      {
        treatment_target: 'Anxiety',
        session_number: 1,
        client_id: 1,
        session_id: 1,
        tenant_id: null
      },
      {
        treatment_target: 'Anxiety',
        session_number: 5,
        client_id: 1,
        session_id: 5,
        tenant_id: null
      },
      {
        treatment_target: 'Depression',
        session_number: 10,
        client_id: 2,
        session_id: 10,
        tenant_id: null
      },
      {
        treatment_target: 'General Mental Health',
        session_number: 1,
        client_id: 3,
        session_id: 1,
        tenant_id: null
      }
    ];

    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.treatment_target} - Session ${testCase.session_number}`);
      const result = await service.checkAndGetSessionFeedbackForms(testCase);
      
      if (result.error) {
        console.error(`Error: ${result.message}`);
      } else {
        console.log(`Forms to send: ${result.forms_to_send.length}`);
        result.forms_to_send.forEach(form => {
          console.log(`  - ${form.form_name}: ${form.purpose}`);
        });
      }
    }
  } catch (error) {
    console.error('Error in testSessionChecking:', error);
  }
}

/**
 * Get grouped configurations
 */
async function getGroupedConfigs() {
  try {
    console.log('Getting grouped configurations...');
    
    const result = await service.getGroupedTreatmentTargetConfigs();
    
    if (result.error) {
      console.error('Error getting grouped configs:', result.message);
      return;
    }

    console.log('Grouped configurations:');
    console.log(JSON.stringify(result.rec, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error in getGroupedConfigs:', error);
  }
}

/**
 * Get statistics
 */
async function getStats() {
  try {
    console.log('Getting treatment target statistics...');
    
    const result = await service.getTreatmentTargetStats();
    
    if (result.error) {
      console.error('Error getting stats:', result.message);
      return;
    }

    console.log('Statistics:');
    console.log(JSON.stringify(result.rec, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error in getStats:', error);
  }
}

/**
 * Main function to run the setup
 */
async function main() {
  try {
    console.log('🚀 Treatment Target Feedback Configuration Setup');
    console.log('==============================================\n');

    // Step 1: Convert table data to JSON
    console.log('Step 1: Converting table data to JSON format...');
    const jsonData = await convertTableToJSON();
    
    if (!jsonData) {
      console.log('Skipping bulk create due to conversion error');
      return;
    }

    // Step 2: Bulk create configurations
    console.log('\nStep 2: Bulk creating configurations...');
    await bulkCreateFromJSON(jsonData);

    // Step 3: Test session checking
    console.log('\nStep 3: Testing session checking...');
    await testSessionChecking();

    // Step 4: Get grouped configurations
    console.log('\nStep 4: Getting grouped configurations...');
    await getGroupedConfigs();

    // Step 5: Get statistics
    console.log('\nStep 5: Getting statistics...');
    await getStats();

    console.log('\n✅ Setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  convertTableToJSON,
  bulkCreateFromJSON,
  testSessionChecking,
  getGroupedConfigs,
  getStats,
  main
}; 