// Test script for Fee Split Management API
// Run with: node tests/api/test_fee_split_api.js
// Location: tests/api/test_fee_split_api.js
// Database: Uses dedicated fee_split_management table with counselor support via user table

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/fee-split-management';
const TENANT_ID = 1; // Replace with actual tenant ID for testing
const COUNSELOR_USER_ID = 5; // Replace with actual counselor user ID for testing

// Mock authentication token - replace with actual token in production
const AUTH_TOKEN = 'your-auth-token-here';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`
};

class FeeSplitAPITester {
  constructor() {
    this.testResults = [];
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`\n🧪 Running: ${testName}`);
      await testFunction();
      console.log(`✅ PASSED: ${testName}`);
      this.testResults.push({ name: testName, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
    }
  }

  async testGetConfiguration() {
    const response = await fetch(`${BASE_URL}/configuration?tenant_id=${TENANT_ID}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
    
    // Verify response structure
    if (!result.data.default_configuration) {
      throw new Error('Response missing default_configuration');
    }
    if (!Array.isArray(result.data.counselor_specific_configurations)) {
      throw new Error('Response missing counselor_specific_configurations array');
    }
  }

  async testGetCounselorConfiguration() {
    const response = await fetch(`${BASE_URL}/configuration?tenant_id=${TENANT_ID}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
    
    // Verify response structure
    if (!result.data.default_configuration) {
      throw new Error('Response missing default_configuration');
    }
    if (!Array.isArray(result.data.counselor_specific_configurations)) {
      throw new Error('Response missing counselor_specific_configurations array');
    }
    
    // Check if counselor configurations have counselor_info
    result.data.counselor_specific_configurations.forEach(config => {
      if (!config.counselor_info) {
        throw new Error('Counselor configuration missing counselor_info');
      }
      if (!config.counselor_info.name || !config.counselor_info.email) {
        throw new Error('Counselor info missing required fields (name, email)');
      }
    });
  }

  async testUpdateConfiguration() {
    const updateData = {
      tenant_id: TENANT_ID,
      is_fee_split_enabled: true,
      tenant_share_percentage: 30,
      counselor_share_percentage: 70
    };

    const response = await fetch(`${BASE_URL}/configuration`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
  }

  async testCreateConfiguration() {
    const createData = {
      tenant_id: TENANT_ID + 1, // Use different tenant to avoid conflicts
      is_fee_split_enabled: true,
      tenant_share_percentage: 40,
      counselor_share_percentage: 60
    };

    const response = await fetch(`${BASE_URL}/configuration`, {
      method: 'POST',
      headers,
      body: JSON.stringify(createData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
  }

  async testCreateCounselorConfiguration() {
    const createData = {
      tenant_id: TENANT_ID + 1, // Use different tenant to avoid conflicts
      counselor_user_id: COUNSELOR_USER_ID + 1, // Use different counselor to avoid conflicts
      is_fee_split_enabled: true,
      tenant_share_percentage: 35,
      counselor_share_percentage: 65
    };

    const response = await fetch(`${BASE_URL}/configuration`, {
      method: 'POST',
      headers,
      body: JSON.stringify(createData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
  }

  async testCreateDuplicateConfiguration() {
    const createData = {
      tenant_id: TENANT_ID,
      is_fee_split_enabled: true,
      tenant_share_percentage: 30,
      counselor_share_percentage: 70
    };

    const response = await fetch(`${BASE_URL}/configuration`, {
      method: 'POST',
      headers,
      body: JSON.stringify(createData)
    });

    if (response.ok) {
      throw new Error('Should have failed with duplicate configuration error');
    }
    
    const result = await response.json();
    console.log(`   Expected error caught: ${JSON.stringify(result, null, 2)}`);
  }

  async testUpdateCounselorConfiguration() {
    const updateData = {
      tenant_id: TENANT_ID,
      counselor_user_id: COUNSELOR_USER_ID,
      is_fee_split_enabled: true,
      tenant_share_percentage: 25,
      counselor_share_percentage: 75
    };

    const response = await fetch(`${BASE_URL}/configuration`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
  }

  async testIsEnabled() {
    const response = await fetch(`${BASE_URL}/enabled?tenant_id=${TENANT_ID}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  }

  async testIsCounselorEnabled() {
    const response = await fetch(`${BASE_URL}/enabled?tenant_id=${TENANT_ID}&counselor_user_id=${COUNSELOR_USER_ID}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  }

  async testGetPercentages() {
    const response = await fetch(`${BASE_URL}/percentages?tenant_id=${TENANT_ID}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  }

  async testGetCounselorPercentages() {
    const response = await fetch(`${BASE_URL}/percentages?tenant_id=${TENANT_ID}&counselor_user_id=${COUNSELOR_USER_ID}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  }

  async testValidateConfiguration() {
    const validateData = {
      tenant_id: TENANT_ID,
      is_fee_split_enabled: true,
      tenant_share_percentage: 40,
      counselor_share_percentage: 60
    };

    const response = await fetch(`${BASE_URL}/validate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(validateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
  }

  async testValidateCounselorConfiguration() {
    const validateData = {
      tenant_id: TENANT_ID,
      counselor_user_id: COUNSELOR_USER_ID,
      is_fee_split_enabled: true,
      tenant_share_percentage: 35,
      counselor_share_percentage: 65
    };

    const response = await fetch(`${BASE_URL}/validate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(validateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
  }

  async testValidationError() {
    const invalidData = {
      tenant_id: TENANT_ID,
      is_fee_split_enabled: true,
      tenant_share_percentage: 30,
      counselor_share_percentage: 60 // Should fail validation
    };

    const response = await fetch(`${BASE_URL}/configuration`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(invalidData)
    });

    if (response.ok) {
      throw new Error('Validation should have failed but didn\'t');
    }
    
    const result = await response.json();
    console.log(`   Expected error caught: ${JSON.stringify(result, null, 2)}`);
  }

  async testDisableFeeSplit() {
    const disableData = {
      tenant_id: TENANT_ID,
      is_fee_split_enabled: false
    };

    const response = await fetch(`${BASE_URL}/configuration`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(disableData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
  }

  async testGetAllConfigurations() {
    const response = await fetch(`${BASE_URL}/all`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  }

  async testGetCounselorConfigurations() {
    const response = await fetch(`${BASE_URL}/counselor-configurations?tenant_id=${TENANT_ID}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  }

  async testGetCounselors() {
    const response = await fetch(`${BASE_URL}/counselors?tenant_id=${TENANT_ID}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  }

  async testDeleteConfiguration() {
    const response = await fetch(`${BASE_URL}/configuration/${TENANT_ID}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
  }

  async testDeleteCounselorConfiguration() {
    const response = await fetch(`${BASE_URL}/configuration/${TENANT_ID}/${COUNSELOR_USER_ID}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
  }

  async runAllTests() {
    console.log('🧪 Testing Fee Split Management API...\n');
    console.log(`📍 Test Location: tests/api/test_fee_split_api.js`);
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log(`🏢 Tenant ID: ${TENANT_ID}`);
    console.log(`👨‍⚕️ Counselor User ID: ${COUNSELOR_USER_ID}`);
    console.log(`🗄️  Database: fee_split_management table with counselor support via user table\n`);

    // Tenant-wide tests
    await this.runTest('GET /configuration (tenant-wide)', () => this.testGetConfiguration());
    await this.runTest('GET /configuration (counselor-specific)', () => this.testGetCounselorConfiguration());
    await this.runTest('PUT /configuration (tenant-wide)', () => this.testUpdateConfiguration());
    await this.runTest('POST /configuration (create)', () => this.testCreateConfiguration());
    await this.runTest('POST /configuration (create counselor)', () => this.testCreateCounselorConfiguration());
    await this.runTest('POST /configuration (duplicate)', () => this.testCreateDuplicateConfiguration());
    await this.runTest('GET /enabled (tenant-wide)', () => this.testIsEnabled());
    await this.runTest('GET /percentages (tenant-wide)', () => this.testGetPercentages());
    await this.runTest('POST /validate (tenant-wide)', () => this.testValidateConfiguration());
    await this.runTest('Validation Error Test', () => this.testValidationError());
    await this.runTest('PUT /configuration (disable)', () => this.testDisableFeeSplit());

    // Counselor-specific tests
    await this.runTest('GET /configuration (counselor-specific)', () => this.testGetCounselorConfiguration());
    await this.runTest('PUT /configuration (counselor-specific)', () => this.testUpdateCounselorConfiguration());
    await this.runTest('GET /enabled (counselor-specific)', () => this.testIsCounselorEnabled());
    await this.runTest('GET /percentages (counselor-specific)', () => this.testGetCounselorPercentages());
    await this.runTest('POST /validate (counselor-specific)', () => this.testValidateCounselorConfiguration());

    // Admin and bulk operations
    await this.runTest('GET /all', () => this.testGetAllConfigurations());
    await this.runTest('GET /counselor-configurations', () => this.testGetCounselorConfigurations());
    await this.runTest('GET /counselors', () => this.testGetCounselors());
    await this.runTest('DELETE /configuration/:tenant_id (tenant-wide)', () => this.testDeleteConfiguration());
    await this.runTest('DELETE /configuration/:tenant_id/:counselor_user_id (counselor-specific)', () => this.testDeleteCounselorConfiguration());

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log(`\n🎯 Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
    }
  }
}

// Run the tests
const tester = new FeeSplitAPITester();
tester.runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error.message);
}); 