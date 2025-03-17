#!/usr/bin/env node
/**
 * Debug Script for Promptaat Auth Flow
 * 
 * This script helps diagnose authentication and cookie issues between
 * the Next.js application and Stripe integration.
 * 
 * Usage:
 *   node scripts/debug-auth-flow.js
 */

const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const DEBUG_TOKEN = process.env.DEBUG_SESSION_SECRET || 'no-token-set';

// ASCII color codes
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

// Helper functions
function printHeader(text) {
  console.log(`\n${BLUE}======== ${text} ========${RESET}\n`);
}

function printSuccess(text) {
  console.log(`${GREEN}✓ ${text}${RESET}`);
}

function printError(text) {
  console.log(`${RED}✗ ${text}${RESET}`);
}

function printWarning(text) {
  console.log(`${YELLOW}! ${text}${RESET}`);
}

function printInfo(text) {
  console.log(`${CYAN}ℹ ${text}${RESET}`);
}

// Main functions
async function checkEnvironmentVariables() {
  printHeader('Environment Variables Check');
  
  const requiredVars = [
    'NEXT_PUBLIC_APP_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'COOKIE_DOMAIN',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];
  
  let missingVars = 0;
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      printError(`Missing ${varName}`);
      missingVars++;
    } else {
      printSuccess(`${varName} is set${varName.includes('SECRET') ? ' [value hidden]' : ''}`);
    }
  }
  
  if (missingVars === 0) {
    printSuccess('All required environment variables are set');
  } else {
    printError(`${missingVars} environment variables are missing`);
  }
  
  // Additional checks for critical variables
  if (process.env.COOKIE_DOMAIN) {
    if (!process.env.COOKIE_DOMAIN.startsWith('.') && process.env.NODE_ENV === 'production') {
      printWarning(`COOKIE_DOMAIN (${process.env.COOKIE_DOMAIN}) should start with a dot in production`);
    }
  }
  
  if (process.env.NEXTAUTH_URL) {
    if (process.env.NEXTAUTH_URL !== process.env.NEXT_PUBLIC_APP_URL) {
      printWarning(`NEXTAUTH_URL (${process.env.NEXTAUTH_URL}) does not match NEXT_PUBLIC_APP_URL (${process.env.NEXT_PUBLIC_APP_URL})`);
    }
  }
}

async function checkDebugEndpoints() {
  printHeader('Debug Endpoints Check');
  
  try {
    printInfo(`Checking session debug endpoint at ${BASE_URL}/api/debug-session`);
    const sessionResponse = await axios.get(`${BASE_URL}/api/debug-session`, {
      headers: {
        Authorization: `Bearer ${DEBUG_TOKEN}`
      }
    });
    
    printSuccess('Session debug endpoint is accessible');
    console.log(JSON.stringify(sessionResponse.data, null, 2));
    
    // Analyze session information
    if (!sessionResponse.data.sessionCheck.hasSession) {
      printWarning('No active session was found');
      
      // Check cookies
      if (sessionResponse.data.cookieInfo.authCookies) {
        const { authCookies } = sessionResponse.data.cookieInfo;
        if (!authCookies.hasSessionToken && !authCookies.hasSecureSessionToken) {
          printError('No session token cookies found');
        } else {
          printSuccess('Session token cookies exist, but session not recognized');
          printInfo('This may indicate a domain mismatch or cookie security issue');
        }
      }
    } else {
      printSuccess('Session found with user ID: ' + sessionResponse.data.sessionCheck.sessionUserId);
    }
    
  } catch (error) {
    printError(`Failed to access session debug endpoint: ${error.message}`);
    if (error.response) {
      console.log(error.response.data);
    }
  }
  
  try {
    printInfo(`Checking environment debug endpoint at ${BASE_URL}/api/debug-environment`);
    const envResponse = await axios.get(`${BASE_URL}/api/debug-environment`, {
      headers: {
        Authorization: `Bearer ${DEBUG_TOKEN}`
      }
    });
    
    printSuccess('Environment debug endpoint is accessible');
    console.log(JSON.stringify(envResponse.data, null, 2));
    
  } catch (error) {
    printError(`Failed to access environment debug endpoint: ${error.message}`);
    if (error.response) {
      console.log(error.response.data);
    }
  }
}

async function inspectAuthConfig() {
  printHeader('NextAuth Configuration Check');
  
  try {
    // Read the auth.ts file
    const authFilePath = './src/lib/auth.ts';
    
    if (!fs.existsSync(authFilePath)) {
      printError(`Auth configuration file not found at ${authFilePath}`);
      return;
    }
    
    const authContent = fs.readFileSync(authFilePath, 'utf8');
    
    // Check cookie settings
    if (authContent.includes('sameSite: process.env.NODE_ENV === \'production\' ? \'none\' : \'lax\'')) {
      printSuccess('SameSite cookie setting is appropriately dynamic based on environment');
    } else if (authContent.includes('sameSite: \'none\'')) {
      printSuccess('SameSite cookie setting is set to "none"');
    } else if (authContent.includes('sameSite: \'lax\'')) {
      printWarning('SameSite cookie setting is set to "lax", which may cause issues in cross-origin scenarios');
    } else {
      printWarning('Could not determine SameSite cookie setting');
    }
    
    // Check secure setting
    if (authContent.includes('secure: process.env.NODE_ENV === \'production\'')) {
      printSuccess('Secure cookie setting is appropriately dynamic based on environment');
    } else if (authContent.includes('secure: true')) {
      printSuccess('Secure cookie setting is enabled');
    } else if (authContent.includes('secure: false')) {
      printWarning('Secure cookie setting is disabled, which may cause issues in HTTPS scenarios');
    } else {
      printWarning('Could not determine Secure cookie setting');
    }
    
    // Check domain setting
    if (authContent.includes('domain: process.env.COOKIE_DOMAIN')) {
      printSuccess('Cookie domain is set from environment variable');
    } else if (authContent.match(/domain:\s*['"][^'"]+['"]/)) {
      const domainMatch = authContent.match(/domain:\s*['"]([^'"]+)['"]/);
      if (domainMatch) {
        printWarning(`Cookie domain is hardcoded to "${domainMatch[1]}" instead of using environment variable`);
      }
    } else {
      printWarning('Could not find cookie domain setting');
    }
    
    // Check session strategy
    if (authContent.includes('strategy: "jwt"')) {
      printSuccess('Session strategy is set to JWT');
    } else if (authContent.includes('strategy: "database"')) {
      printInfo('Session strategy is set to database');
    } else {
      printWarning('Could not determine session strategy');
    }
    
  } catch (error) {
    printError(`Error inspecting auth configuration: ${error.message}`);
  }
}

async function checkCredentialsInCheckoutButton() {
  printHeader('Checkout Button Configuration Check');
  
  try {
    // Read the checkout button file
    const buttonFilePath = './src/components/checkout/checkout-button.tsx';
    
    if (!fs.existsSync(buttonFilePath)) {
      printError(`Checkout button file not found at ${buttonFilePath}`);
      return;
    }
    
    const buttonContent = fs.readFileSync(buttonFilePath, 'utf8');
    
    // Check credentials inclusion
    if (buttonContent.includes('credentials: "include"')) {
      printSuccess('Fetch request includes credentials for cookie transmission');
    } else if (buttonContent.includes('fetch("/api/subscriptions"')) {
      printError('Fetch request does not include credentials, cookies may not be sent');
    } else {
      printWarning('Could not find subscription API fetch request');
    }
    
    // Check error handling
    if (buttonContent.includes('catch')) {
      printSuccess('Error handling is implemented in the checkout button');
    } else {
      printWarning('Error handling may be missing in the checkout button');
    }
    
  } catch (error) {
    printError(`Error checking checkout button configuration: ${error.message}`);
  }
}

// Execute the debug script
async function runDebugScript() {
  printHeader('Promptaat Auth Flow Debugging');
  printInfo(`Base URL: ${BASE_URL}`);
  printInfo(`Environment: ${process.env.NODE_ENV || 'not set'}`);
  
  await checkEnvironmentVariables();
  await checkDebugEndpoints();
  await inspectAuthConfig();
  await checkCredentialsInCheckoutButton();
  
  printHeader('Debug Summary');
  printInfo('Debug script completed. Check the output above for potential issues.');
  printInfo('For more information, visit the debug endpoints in your browser:');
  printInfo(`- ${BASE_URL}/api/debug-session`);
  printInfo(`- ${BASE_URL}/api/debug-environment`);
}

// Run the script
runDebugScript().catch(error => {
  console.error('Error running debug script:', error);
  process.exit(1);
});
