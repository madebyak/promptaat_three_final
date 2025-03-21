/**
 * Test script for the Changelog feature
 * 
 * This script tests the basic CRUD operations for the changelog feature
 * by creating a test entry, fetching it, updating it, and then deleting it.
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3002/api';
const TEST_CHANGELOG = {
  titleEn: 'Test Changelog Entry',
  titleAr: 'إدخال سجل التغييرات التجريبي',
  contentEn: '<p>This is a test changelog entry created by the test script.</p>',
  contentAr: '<p>هذا هو إدخال سجل التغييرات التجريبي الذي تم إنشاؤه بواسطة البرنامج النصي للاختبار.</p>',
  imageUrl: null,
};

// Helper function to log with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${data.error || response.statusText}`);
    }
    
    return data;
  } catch (error) {
    log(`Error making request to ${url}: ${error.message}`);
    throw error;
  }
}

// Main test function
async function runTests() {
  log('Starting changelog tests...');
  let createdChangelogId = null;

  try {
    // Test 1: Create a new changelog entry
    log('Test 1: Creating a new changelog entry...');
    const createResult = await makeRequest('/cms/changelog', 'POST', TEST_CHANGELOG);
    createdChangelogId = createResult.id;
    log(`✅ Created changelog with ID: ${createdChangelogId}`);

    // Test 2: Fetch the created changelog
    log('Test 2: Fetching the created changelog...');
    const fetchResult = await makeRequest(`/cms/changelog/${createdChangelogId}`, 'GET');
    log(`✅ Fetched changelog: ${fetchResult.titleEn}`);

    // Test 3: Update the changelog
    log('Test 3: Updating the changelog...');
    const updateData = {
      ...TEST_CHANGELOG,
      titleEn: 'Updated Test Changelog Entry',
      titleAr: 'إدخال سجل التغييرات التجريبي المحدث',
    };
    
    await makeRequest(`/cms/changelog/${createdChangelogId}`, 'PUT', updateData);
    log('✅ Updated changelog successfully');

    // Test 4: Verify the update
    log('Test 4: Verifying the update...');
    const updatedFetchResult = await makeRequest(`/cms/changelog/${createdChangelogId}`, 'GET');
    if (updatedFetchResult.titleEn === updateData.titleEn) {
      log('✅ Update verification successful');
    } else {
      log('❌ Update verification failed');
    }

    // Test 5: Delete the changelog
    log('Test 5: Deleting the changelog...');
    await makeRequest(`/cms/changelog/${createdChangelogId}`, 'DELETE');
    log('✅ Deleted changelog successfully');

    // Test 6: Verify deletion
    log('Test 6: Verifying deletion...');
    try {
      await makeRequest(`/cms/changelog/${createdChangelogId}`, 'GET');
      log('❌ Deletion verification failed - entry still exists');
    } catch (error) {
      log('✅ Deletion verification successful - entry no longer exists');
    }

    log('All tests completed successfully! 🎉');
  } catch (error) {
    log(`❌ Test failed: ${error.message}`);
    
    // Cleanup: Delete the test changelog if it was created
    if (createdChangelogId) {
      log('Attempting to clean up by deleting the test changelog...');
      try {
        await makeRequest(`/cms/changelog/${createdChangelogId}`, 'DELETE');
        log('Cleanup successful');
      } catch (cleanupError) {
        log(`Cleanup failed: ${cleanupError.message}`);
      }
    }
  }
}

// Run the tests
runTests();
