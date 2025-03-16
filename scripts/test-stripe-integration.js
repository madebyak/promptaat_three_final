#!/usr/bin/env node
/**
 * Test Stripe Integration Script
 * 
 * This script tests the Stripe integration by:
 * 1. Verifying environment variables
 * 2. Testing connection to Stripe API
 * 3. Validating price IDs
 * 
 * Usage:
 * node scripts/test-stripe-integration.js
 */

// Load environment variables from .env file
require('dotenv').config();

const Stripe = require('stripe');

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to check if an environment variable is set
function checkEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    log(`❌ ${name} is not set`, colors.red);
    return false;
  }
  
  log(`✅ ${name} is set`, colors.green);
  return true;
}

// Main function to run tests
async function runTests() {
  log("\n🔍 Testing Stripe Integration", colors.cyan);
  log("==========================", colors.cyan);
  
  // 1. Check environment variables
  log("\n1. Checking environment variables:", colors.blue);
  const envVars = [
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ID_PRO_MONTHLY",
    "STRIPE_PRICE_ID_PRO_QUARTERLY",
    "STRIPE_PRICE_ID_PRO_ANNUAL"
  ];
  
  let allEnvVarsSet = true;
  for (const envVar of envVars) {
    if (!checkEnvVar(envVar)) {
      allEnvVarsSet = false;
    }
  }
  
  if (!allEnvVarsSet) {
    log("\n⚠️ Some environment variables are missing. Please check your .env file.", colors.yellow);
  }
  
  // 2. Test connection to Stripe API
  log("\n2. Testing connection to Stripe API:", colors.blue);
  try {
    const account = await stripe.account.retrieve();
    log(`✅ Successfully connected to Stripe API (Account: ${account.id})`, colors.green);
  } catch (error) {
    log(`❌ Failed to connect to Stripe API: ${error.message}`, colors.red);
    log("\nPlease check your STRIPE_SECRET_KEY and try again.", colors.yellow);
    return;
  }
  
  // 3. Validate price IDs
  log("\n3. Validating price IDs:", colors.blue);
  const priceIds = {
    monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    quarterly: process.env.STRIPE_PRICE_ID_PRO_QUARTERLY,
    annual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL
  };
  
  for (const [interval, priceId] of Object.entries(priceIds)) {
    if (!priceId) continue;
    
    try {
      const price = await stripe.prices.retrieve(priceId);
      log(`✅ ${interval.charAt(0).toUpperCase() + interval.slice(1)} price ID is valid (${price.id})`, colors.green);
      log(`   Product: ${price.product}`, colors.cyan);
      log(`   Currency: ${price.currency}`, colors.cyan);
      log(`   Unit amount: ${price.unit_amount / 100} ${price.currency}`, colors.cyan);
      log(`   Recurring: ${price.recurring ? `${price.recurring.interval_count} ${price.recurring.interval}` : 'N/A'}`, colors.cyan);
    } catch (error) {
      log(`❌ ${interval} price ID is invalid: ${error.message}`, colors.red);
    }
  }
  
  // 4. Check webhook configuration
  log("\n4. Checking webhook configuration:", colors.blue);
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    log("❌ STRIPE_WEBHOOK_SECRET is not set", colors.red);
    log("\nPlease configure your webhook endpoint in the Stripe dashboard and add the webhook secret to your .env file.", colors.yellow);
  } else {
    log("✅ STRIPE_WEBHOOK_SECRET is set", colors.green);
    log("\nRemember to configure your webhook endpoint in the Stripe dashboard to listen for these events:", colors.cyan);
    log("   - customer.subscription.created", colors.cyan);
    log("   - customer.subscription.updated", colors.cyan);
    log("   - customer.subscription.deleted", colors.cyan);
    log("   - checkout.session.completed", colors.cyan);
  }
  
  log("\n🏁 Stripe integration test completed", colors.magenta);
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ An error occurred: ${error.message}`, colors.red);
});
