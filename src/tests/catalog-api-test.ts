// This is a test script to verify the catalog management API endpoints
// You can run this with ts-node or similar tools

import fetch from 'node-fetch';

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const authCookie = ''; // You'll need to set this with a valid session cookie

// Test data
const testCatalogId = ''; // Set this to an existing catalog ID
const testPromptId = ''; // Set this to an existing prompt ID

// Helper function for API requests
async function apiRequest(url: string, method: string, body?: Record<string, unknown>) {
  const options: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookie
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${url}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

// Test functions
async function testGetCatalogPrompts() {
  console.log('Testing GET /catalogs/{id}/prompts');
  const { status, data } = await apiRequest(`/catalogs/${testCatalogId}/prompts`, 'GET');
  console.log(`Status: ${status}`);
  console.log('Response:', data);
  return status === 200;
}

async function testCheckPromptInCatalog() {
  console.log('Testing GET /catalogs/{id}/prompts/{promptId}');
  const { status, data } = await apiRequest(`/catalogs/${testCatalogId}/prompts/${testPromptId}`, 'GET');
  console.log(`Status: ${status}`);
  console.log('Response:', data);
  return status === 200;
}

async function testAddPromptToCatalog() {
  console.log('Testing POST /catalogs/{id}/prompts/{promptId}');
  const { status, data } = await apiRequest(`/catalogs/${testCatalogId}/prompts/${testPromptId}`, 'POST');
  console.log(`Status: ${status}`);
  console.log('Response:', data);
  return status === 200;
}

async function testRemovePromptFromCatalog() {
  console.log('Testing DELETE /catalogs/{id}/prompts/{promptId}');
  const { status, data } = await apiRequest(`/catalogs/${testCatalogId}/prompts/${testPromptId}`, 'DELETE');
  console.log(`Status: ${status}`);
  console.log('Response:', data);
  return status === 200;
}

// Run tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function runTests() {
  console.log('=== CATALOG API TESTS ===');
  
  try {
    // First check if prompt is in catalog
    await testCheckPromptInCatalog();
    
    // Add prompt to catalog
    const addResult = await testAddPromptToCatalog();
    if (!addResult) {
      console.error('Failed to add prompt to catalog');
    }
    
    // Verify prompt is in catalog
    await testCheckPromptInCatalog();
    
    // Get all prompts in catalog
    await testGetCatalogPrompts();
    
    // Remove prompt from catalog
    const removeResult = await testRemovePromptFromCatalog();
    if (!removeResult) {
      console.error('Failed to remove prompt from catalog');
    }
    
    // Verify prompt is no longer in catalog
    await testCheckPromptInCatalog();
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Uncomment to run tests
// runTests();

/*
Instructions for running tests:
1. Set the testCatalogId and testPromptId variables to valid IDs from your database
2. Set the authCookie variable with a valid session cookie
3. Run with: npx ts-node src/tests/catalog-api-test.ts
*/
