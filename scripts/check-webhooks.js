// Script to check if webhooks are properly configured
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read .env file manually
function parseEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) return;
      
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        envVars[key.trim()] = value.replace(/^["'](.*)["']$/, '$1');
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    return {};
  }
}

// Load env vars
const envVars = parseEnvFile();
const WEBHOOK_SECRET = envVars.STRIPE_WEBHOOK_SECRET;
const SECRET_KEY = envVars.STRIPE_SECRET_KEY;
const NODE_ENV = envVars.NODE_ENV || 'development';

console.log('Checking Stripe webhook configuration...');

// Check environment variables
console.log('\nChecking environment variables:');
console.log('STRIPE_WEBHOOK_SECRET:', WEBHOOK_SECRET || 'NOT SET');
console.log('STRIPE_SECRET_KEY:', SECRET_KEY ? 'CONFIGURED' : 'NOT SET');
console.log('NODE_ENV:', NODE_ENV || 'NOT SET');

// Simple test to verify webhook configuration
let webhookCheck = 'Could not check webhook configuration (Stripe SDK not available)';

try {
  if (SECRET_KEY) {
    const stripe = require('stripe')(SECRET_KEY);
    
    const webhookSecret = NODE_ENV === 'development' 
      ? 'whsec_b24f4b66a52ca464c0ca00c556ba4fc499e748e5989c038eaf31abf3737ac94e'  // Stripe CLI webhook secret
      : WEBHOOK_SECRET;
    
    console.log('\nWebhook secret being used:', webhookSecret || 'NONE');
    
    if (!webhookSecret) {
      webhookCheck = '❌ WARNING: No webhook secret is configured. Webhooks will fail signature verification.';
      console.log('\n' + webhookCheck);
      console.log('Add STRIPE_WEBHOOK_SECRET to your .env file');
    } else {
      webhookCheck = '✅ Webhook secret is configured';
      console.log('\n' + webhookCheck);
    }
  } else {
    console.log('\n❌ STRIPE_SECRET_KEY is not set in environment variables');
  }
} catch (error) {
  console.log('\nError checking Stripe configuration:', error.message);
}

// Check if stripe CLI is installed
exec('stripe --version', (error) => {
  if (error) {
    console.log('\n❌ Stripe CLI is not installed or not in PATH');
    console.log('For local development, install Stripe CLI to forward webhooks: https://stripe.com/docs/stripe-cli');
  } else {
    console.log('\n✅ Stripe CLI is installed');
    
    // For local development, suggest running the webhook listener
    if (NODE_ENV === 'development') {
      console.log('\nTo forward webhooks to your local server, run:');
      console.log('stripe listen --forward-to http://localhost:3000/api/stripe/webhook');
    }
  }
  
  // Test instructions
  console.log('\n=== TESTING INSTRUCTIONS ===');
  console.log('1. Make sure your server is running');
  console.log('2. If in development, make sure Stripe CLI is forwarding webhooks');
  console.log('3. Check server logs for incoming webhook events');
  console.log('4. Make a test subscription payment');
  console.log('5. Monitor server logs for: "Webhook received: customer.subscription.created"');
  
  if (NODE_ENV === 'production') {
    console.log('\nPRODUCTION NOTE: Make sure your webhook endpoint is registered in the Stripe dashboard:');
    console.log('https://dashboard.stripe.com/webhooks');
    console.log('Endpoint should be: https://yoursite.com/api/stripe/webhook');
  }
});
