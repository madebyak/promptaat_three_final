#!/usr/bin/env node

/**
 * Test script for CMS authentication
 * 
 * This script tests the CMS authentication system by:
 * 1. Attempting to log in with test credentials
 * 2. Verifying that the login response contains the expected data
 * 3. Attempting to log out
 * 4. Verifying that the logout response is successful
 * 
 * Usage:
 *   node scripts/test-cms-auth.js
 * 
 * Options:
 *   --production: Test against production URL
 *   --dev: Test against development URL (default)
 */

const fetch = require('node-fetch');

// Configuration
const config = {
  // Default to development URL
  baseUrl: 'http://localhost:3000',
  // Test credentials
  credentials: {
    email: 'test@example.com',
    password: 'Test123456',
  },
  // Headers
  headers: {
    'Content-Type': 'application/json',
  },
};

// Parse command line arguments
const args = process.argv.slice(2);
if (args.includes('--production')) {
  // Use production URL if specified
  config.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-production-url.com';
  console.log(`Testing against production URL: ${config.baseUrl}`);
} else {
  console.log(`Testing against development URL: ${config.baseUrl}`);
}

// Add a flag to use real authentication in development mode
if (args.includes('--real-auth')) {
  config.headers['x-use-real-auth'] = 'true';
  console.log('Using real authentication (bypassing dev mode auto-login)');
}

// Helper function to handle fetch errors
async function safeFetch(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return { error };
  }
}

// Test login
async function testLogin() {
  console.log('\n=== Testing CMS Login ===');
  
  const { response, data, error } = await safeFetch(`${config.baseUrl}/api/cms/auth/login`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(config.credentials),
    credentials: 'include', // Include cookies
  });
  
  if (error) {
    console.error('Login test failed with error:', error);
    return null;
  }
  
  console.log(`Login response status: ${response.status}`);
  console.log('Login response data:', JSON.stringify(data, null, 2));
  
  if (response.status === 200 && data.success) {
    console.log('✅ Login test passed');
    // Return cookies for logout test
    return response.headers.get('set-cookie');
  } else {
    console.error('❌ Login test failed');
    return null;
  }
}

// Test logout
async function testLogout(cookies) {
  console.log('\n=== Testing CMS Logout ===');
  
  if (!cookies) {
    console.warn('No cookies from login, using empty cookie');
    cookies = '';
  }
  
  const headers = {
    ...config.headers,
    'Cookie': cookies,
  };
  
  const { response, data, error } = await safeFetch(`${config.baseUrl}/api/cms/auth/logout`, {
    method: 'POST',
    headers,
    credentials: 'include', // Include cookies
  });
  
  if (error) {
    console.error('Logout test failed with error:', error);
    return;
  }
  
  console.log(`Logout response status: ${response.status}`);
  console.log('Logout response data:', JSON.stringify(data, null, 2));
  
  if (response.status === 200 && data.success) {
    console.log('✅ Logout test passed');
  } else {
    console.error('❌ Logout test failed');
  }
}

// Run tests
async function runTests() {
  console.log('Starting CMS authentication tests...');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Configuration: ${JSON.stringify(config, null, 2)}`);
  
  try {
    // Test login
    const cookies = await testLogin();
    
    // Test logout
    await testLogout(cookies);
    
    console.log('\n=== Test Summary ===');
    console.log('All tests completed.');
  } catch (error) {
    console.error('\n=== Test Error ===');
    console.error('Tests failed with error:', error);
  }
}

// Run the tests
runTests();
