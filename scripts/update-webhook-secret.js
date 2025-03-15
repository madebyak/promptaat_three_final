// A script to update the STRIPE_WEBHOOK_SECRET in the .env file
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');

// The correct webhook secret from Stripe CLI
const correctWebhookSecret = 'whsec_b24f4b66a52ca464c0ca00c556ba4fc499e748e5989c038eaf31abf3737ac94e';

try {
  // Read the .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if STRIPE_WEBHOOK_SECRET exists
  if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
    // Replace the existing STRIPE_WEBHOOK_SECRET with the correct value
    envContent = envContent.replace(
      /STRIPE_WEBHOOK_SECRET=.*/g,
      `STRIPE_WEBHOOK_SECRET=${correctWebhookSecret}`
    );
    console.log('Replacing existing STRIPE_WEBHOOK_SECRET');
  } else {
    // Add the STRIPE_WEBHOOK_SECRET if it doesn't exist
    envContent += `\nSTRIPE_WEBHOOK_SECRET=${correctWebhookSecret}\n`;
    console.log('Adding STRIPE_WEBHOOK_SECRET');
  }
  
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Successfully updated STRIPE_WEBHOOK_SECRET in .env file');
  
} catch (error) {
  console.error('❌ Error updating .env file:', error);
}
