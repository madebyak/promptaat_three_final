/**
 * Test Resend API Key
 * 
 * This script tests if the Resend API key is working correctly by sending a test email.
 * Run this script with: node -r dotenv/config scripts/test-resend-api.js
 */

const { Resend } = require('resend');

// Get API key from environment variable
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error('❌ RESEND_API_KEY environment variable is not set');
  process.exit(1);
}

console.log(`🔑 Using Resend API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);

// Initialize Resend
const resend = new Resend(apiKey);

// Test email function
async function sendTestEmail() {
  console.log('📧 Sending test email...');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Promptaat Test <onboarding@resend.dev>',
      to: 'delivered@resend.dev', // This is a special address that always succeeds
      subject: 'Test Email from Promptaat',
      html: '<p>This is a test email to verify that the Resend API key is working correctly.</p>',
    });

    if (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }

    console.log('✅ Test email sent successfully!');
    console.log('📬 Email ID:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Exception while sending test email:', error);
    return false;
  }
}

// Run the test
sendTestEmail()
  .then(success => {
    if (success) {
      console.log('✅ Resend API key is working correctly');
      process.exit(0);
    } else {
      console.error('❌ Resend API key is not working correctly');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
