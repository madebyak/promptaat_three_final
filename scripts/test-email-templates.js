/**
 * Email Templates Test Script
 * 
 * This script tests the email templates used in the authentication system.
 * It generates test emails and saves them as HTML files for visual inspection.
 */

const fs = require('fs');
const path = require('path');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../src/lib/email/verification');

// Mock the Resend API to prevent actual email sending
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: jest.fn().mockImplementation(({ html }) => {
            return { data: { id: 'mock-email-id' }, html };
          }),
        },
      };
    }),
  };
});

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../test-output/emails');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Test verification email template
 */
async function testVerificationEmail() {
  console.log('Testing verification email template...');
  
  const testCases = [
    {
      name: 'standard-verification',
      data: {
        email: 'user@example.com',
        name: 'John Doe',
        token: 'verification-token-123',
      },
    },
    {
      name: 'long-name-verification',
      data: {
        email: 'user@example.com',
        name: 'John Jacob Jingleheimer Schmidt',
        token: 'verification-token-123',
      },
    },
    {
      name: 'arabic-name-verification',
      data: {
        email: 'user@example.com',
        name: 'أحمد محمد',
        token: 'verification-token-123',
      },
    },
  ];

  for (const testCase of testCases) {
    try {
      const result = await sendVerificationEmail(testCase.data);
      const filePath = path.join(outputDir, `${testCase.name}.html`);
      fs.writeFileSync(filePath, result.html);
      console.log(`✅ Generated ${testCase.name} email template at ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${testCase.name} email template:`, error);
    }
  }
}

/**
 * Test password reset email template
 */
async function testPasswordResetEmail() {
  console.log('\nTesting password reset email template...');
  
  const testCases = [
    {
      name: 'standard-reset',
      data: {
        email: 'user@example.com',
        name: 'John Doe',
        token: 'reset-token-123',
      },
    },
    {
      name: 'long-name-reset',
      data: {
        email: 'user@example.com',
        name: 'John Jacob Jingleheimer Schmidt',
        token: 'reset-token-123',
      },
    },
    {
      name: 'arabic-name-reset',
      data: {
        email: 'user@example.com',
        name: 'أحمد محمد',
        token: 'reset-token-123',
      },
    },
  ];

  for (const testCase of testCases) {
    try {
      const result = await sendPasswordResetEmail(testCase.data);
      const filePath = path.join(outputDir, `${testCase.name}.html`);
      fs.writeFileSync(filePath, result.html);
      console.log(`✅ Generated ${testCase.name} email template at ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${testCase.name} email template:`, error);
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting email template tests...');
  await testVerificationEmail();
  await testPasswordResetEmail();
  console.log('\nEmail template tests completed. Check the test-output/emails directory for the generated templates.');
}

runTests().catch(console.error);

/**
 * To run this script:
 * 1. Make sure you have the required dependencies installed
 * 2. Run: node scripts/test-email-templates.js
 * 3. Check the test-output/emails directory for the generated templates
 * 
 * Note: This script mocks the Resend API to prevent actual email sending.
 * It generates HTML files that you can open in a browser to inspect the templates.
 */
