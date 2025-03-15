// Script to check Stripe webhook endpoints
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        envVars[key] = value;
      }
    });
    
    return envVars;
  }
  
  return {};
}

const env = loadEnv();
const stripeSecretKey = env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set in .env file');
  process.exit(1);
}

// Function to make a request to the Stripe API
function makeStripeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function main() {
  try {
    console.log('Checking Stripe webhook endpoints...');
    
    // Get all webhook endpoints
    const webhooks = await makeStripeRequest('/v1/webhook_endpoints');
    
    if (webhooks.data && webhooks.data.length > 0) {
      console.log(`Found ${webhooks.data.length} webhook endpoints:`);
      
      webhooks.data.forEach((webhook, index) => {
        console.log(`\nWebhook #${index + 1}:`);
        console.log(`ID: ${webhook.id}`);
        console.log(`URL: ${webhook.url}`);
        console.log(`Status: ${webhook.status}`);
        console.log(`Events:`);
        webhook.enabled_events.forEach(event => {
          console.log(`  - ${event}`);
        });
      });
    } else {
      console.log('No webhook endpoints found.');
    }
    
    // Check our application webhook routes
    console.log('\nApplication webhook routes:');
    console.log('1. /api/stripe/webhook');
    console.log('2. /api/webhooks/stripe');
    
  } catch (error) {
    console.error('Error checking webhook endpoints:', error);
  }
}

main();
