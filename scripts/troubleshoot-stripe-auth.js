#!/usr/bin/env node

/**
 * Stripe Authentication Flow Troubleshooter
 * 
 * This script helps diagnose authentication issues with the Stripe subscription flow.
 * It tests various components of the authentication system and reports any issues.
 */

const fetch = require('node-fetch');
const readline = require('readline');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
let config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  debugToken: process.env.DEBUG_AUTH_TOKEN || '',
  sessionCookie: ''
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper function to print colored text
function print(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to print section headers
function printHeader(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log('='.repeat(80));
}

// Helper function to print test results
function printResult(test, passed, message) {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  console.log(`${icon} ${colors[color]}${test}${colors.reset}: ${message}`);
}

// Helper function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Generate a debug token if needed
function generateDebugToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Test environment variables
async function testEnvironmentVariables() {
  printHeader('Testing Environment Variables');
  
  const requiredVars = [
    'NEXT_PUBLIC_APP_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'COOKIE_DOMAIN',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];
  
  let allPassed = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const passed = !!value;
    
    if (passed) {
      let displayValue = value;
      // Mask sensitive values
      if (varName.includes('SECRET') || varName.includes('KEY')) {
        displayValue = value.substring(0, 4) + '...' + value.substring(value.length - 4);
      }
      printResult(varName, true, `Found: ${displayValue}`);
    } else {
      printResult(varName, false, 'Missing');
      allPassed = false;
    }
  }
  
  // Check COOKIE_DOMAIN format
  if (process.env.COOKIE_DOMAIN) {
    const cookieDomain = process.env.COOKIE_DOMAIN;
    if (!cookieDomain.startsWith('.')) {
      printResult('COOKIE_DOMAIN Format', false, 
        `Value "${cookieDomain}" should start with a dot for cross-subdomain support`);
      allPassed = false;
    } else {
      printResult('COOKIE_DOMAIN Format', true, 'Correctly formatted with leading dot');
    }
  }
  
  // Check URL consistency
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXTAUTH_URL) {
    const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);
    const authUrl = new URL(process.env.NEXTAUTH_URL);
    
    if (appUrl.hostname !== authUrl.hostname) {
      printResult('URL Consistency', false, 
        `NEXT_PUBLIC_APP_URL (${appUrl.hostname}) and NEXTAUTH_URL (${authUrl.hostname}) have different hostnames`);
      allPassed = false;
    } else {
      printResult('URL Consistency', true, 'URLs have consistent hostnames');
    }
  }
  
  return allPassed;
}

// Test the debug auth endpoint
async function testDebugAuthEndpoint() {
  printHeader('Testing Debug Auth Endpoint');
  
  if (!config.appUrl) {
    printResult('Debug Auth Endpoint', false, 'Missing NEXT_PUBLIC_APP_URL');
    return false;
  }
  
  try {
    // Generate a debug token if not provided
    if (!config.debugToken) {
      config.debugToken = generateDebugToken();
      print('yellow', `Generated debug token: ${config.debugToken}`);
      print('yellow', 'Add this to your .env file as DEBUG_AUTH_TOKEN');
    }
    
    const response = await fetch(`${config.appUrl}/api/debug-auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.debugToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      printResult('Debug Auth Endpoint', true, 'Endpoint is accessible');
      console.log('\nDebug information:');
      console.log(JSON.stringify(data, null, 2));
      return true;
    } else {
      printResult('Debug Auth Endpoint', false, `Error: ${data.error || response.statusText}`);
      return false;
    }
  } catch (error) {
    printResult('Debug Auth Endpoint', false, `Error: ${error.message}`);
    return false;
  }
}

// Test the subscriptions API
async function testSubscriptionsApi() {
  printHeader('Testing Subscriptions API');
  
  if (!config.appUrl) {
    printResult('Subscriptions API', false, 'Missing NEXT_PUBLIC_APP_URL');
    return false;
  }
  
  try {
    // Test CORS preflight
    const optionsResponse = await fetch(`${config.appUrl}/api/subscriptions`, {
      method: 'OPTIONS'
    });
    
    if (optionsResponse.ok) {
      printResult('CORS Preflight', true, 'OPTIONS request successful');
      
      // Check CORS headers
      const corsHeader = optionsResponse.headers.get('access-control-allow-origin');
      if (corsHeader) {
        printResult('CORS Headers', true, `Access-Control-Allow-Origin: ${corsHeader}`);
      } else {
        printResult('CORS Headers', false, 'Missing Access-Control-Allow-Origin header');
      }
      
      const credentialsHeader = optionsResponse.headers.get('access-control-allow-credentials');
      if (credentialsHeader === 'true') {
        printResult('CORS Credentials', true, 'Credentials allowed');
      } else {
        printResult('CORS Credentials', false, 'Credentials not allowed');
      }
    } else {
      printResult('CORS Preflight', false, `Error: ${optionsResponse.statusText}`);
    }
    
    // Test POST request
    const postResponse = await fetch(`${config.appUrl}/api/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        priceId: 'test_price_id'
      })
    });
    
    const postData = await postResponse.json();
    
    if (postResponse.status === 401) {
      printResult('Subscriptions API Authentication', true, 
        'API correctly returns 401 for unauthenticated requests');
    } else {
      printResult('Subscriptions API Authentication', false, 
        `Expected 401, got ${postResponse.status}: ${JSON.stringify(postData)}`);
    }
    
    return true;
  } catch (error) {
    printResult('Subscriptions API', false, `Error: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  print('cyan', '\n🔍 Stripe Authentication Flow Troubleshooter 🔍\n');
  
  // Get configuration
  config.appUrl = await prompt(`Enter your app URL [${config.appUrl || 'https://your-app.com'}]: `) || config.appUrl;
  if (!config.appUrl) {
    print('red', 'App URL is required. Exiting...');
    rl.close();
    return;
  }
  
  // Run tests
  const envVarsOk = await testEnvironmentVariables();
  if (!envVarsOk) {
    print('yellow', '\n⚠️ Environment variable issues detected. Please fix them before continuing.');
  }
  
  await testDebugAuthEndpoint();
  await testSubscriptionsApi();
  
  print('cyan', '\n🔍 Troubleshooting Complete 🔍');
  print('yellow', '\nRecommendations:');
  print('white', '1. Ensure all environment variables are set correctly');
  print('white', '2. Check that COOKIE_DOMAIN starts with a dot (e.g., .yourdomain.com)');
  print('white', '3. Verify that NEXTAUTH_URL matches your application domain');
  print('white', '4. Make sure cookies are being sent with the "credentials: include" option');
  print('white', '5. Check that your auth.ts file has sameSite set to "none" for production');
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  rl.close();
});
