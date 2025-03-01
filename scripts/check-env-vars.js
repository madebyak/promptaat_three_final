/**
 * Environment Variables Check Script
 * 
 * This script checks if all required environment variables for the authentication system
 * are properly set. It doesn't display the actual values for security reasons.
 */

// Required environment variables for authentication
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
  'DATABASE_URL'
];

// Optional environment variables
const optionalEnvVars = [
  'NODE_ENV'
];

// Check if environment variables are set
function checkEnvVars() {
  console.log('Checking environment variables for authentication system...\n');
  
  let allRequiredVarsSet = true;
  let missingVars = [];
  
  // Check required variables
  console.log('Required environment variables:');
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Not set`);
      allRequiredVarsSet = false;
      missingVars.push(varName);
    }
  });
  
  // Check optional variables
  console.log('\nOptional environment variables:');
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set (${process.env[varName]})`);
    } else {
      console.log(`⚠️ ${varName}: Not set`);
    }
  });
  
  // Summary
  console.log('\nSummary:');
  if (allRequiredVarsSet) {
    console.log('✅ All required environment variables are set.');
  } else {
    console.log(`❌ Missing ${missingVars.length} required environment variables: ${missingVars.join(', ')}`);
    console.log('\nPlease set these variables in your .env file or in your environment.');
    console.log('See docs/environment-variables.md for more information.');
  }
  
  // Additional checks for specific variables
  if (process.env.NEXTAUTH_URL) {
    if (!process.env.NEXTAUTH_URL.startsWith('http')) {
      console.log('\n⚠️ Warning: NEXTAUTH_URL should start with http:// or https://');
    }
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    if (!process.env.NEXT_PUBLIC_APP_URL.startsWith('http')) {
      console.log('\n⚠️ Warning: NEXT_PUBLIC_APP_URL should start with http:// or https://');
    }
  }
  
  return allRequiredVarsSet;
}

// Run the check
const result = checkEnvVars();

// Exit with appropriate code
process.exit(result ? 0 : 1);

/**
 * To run this script:
 * 1. Make sure your .env file is in the root directory
 * 2. Run: node -r dotenv/config scripts/check-env-vars.js
 * 
 * Note: This script requires the dotenv package to be installed.
 * If it's not installed, run: npm install dotenv
 */
