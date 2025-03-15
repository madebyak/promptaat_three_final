// Script to check environment variables
const fs = require('fs');
const path = require('path');

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

console.log('Stripe Environment Variables:');
console.log('----------------------------');
console.log('STRIPE_SECRET_KEY:', env.STRIPE_SECRET_KEY ? `${env.STRIPE_SECRET_KEY.substring(0, 8)}...` : 'Not set');
console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? `${env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 8)}...` : 'Not set');
console.log('STRIPE_WEBHOOK_SECRET:', env.STRIPE_WEBHOOK_SECRET ? `${env.STRIPE_WEBHOOK_SECRET.substring(0, 8)}...` : 'Not set');
console.log('STRIPE_PRICE_ID_PRO_MONTHLY:', env.STRIPE_PRICE_ID_PRO_MONTHLY || 'Not set');
console.log('STRIPE_PRICE_ID_PRO_QUARTERLY:', env.STRIPE_PRICE_ID_PRO_QUARTERLY || 'Not set');
console.log('STRIPE_PRICE_ID_PRO_ANNUAL:', env.STRIPE_PRICE_ID_PRO_ANNUAL || 'Not set');
