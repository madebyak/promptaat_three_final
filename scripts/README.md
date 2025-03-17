# Subscription Management Scripts

This directory contains scripts for managing and reconciling subscriptions between your database and Stripe.

## Reconciliation Script

The `reconcile-subscriptions.js` script ensures that your database stays in sync with Stripe subscriptions. It identifies and fixes the following issues:

1. Subscriptions that exist in Stripe but not in your database
2. Subscriptions with mismatched statuses between Stripe and your database
3. Subscriptions that exist in your database but not in Stripe (orphaned subscriptions)

### Usage

```bash
# Dry run (shows issues without fixing them)
node scripts/reconcile-subscriptions.js

# Apply fixes to the database
node scripts/reconcile-subscriptions.js --fix

# Show detailed logs
node scripts/reconcile-subscriptions.js --verbose

# Apply fixes and show detailed logs
node scripts/reconcile-subscriptions.js --fix --verbose
```

## Scheduler Script

The `schedule-reconciliation.js` script automates the periodic running of the reconciliation job. By default, it schedules the job to run daily at 3:00 AM.

### Scheduler Options

```bash
# Start the scheduler (runs daily at 3:00 AM)
node scripts/schedule-reconciliation.js

# Run once and exit
node scripts/schedule-reconciliation.js --once

# Run once with fixes and exit
node scripts/schedule-reconciliation.js --once --fix

# Run once with detailed logs and exit
node scripts/schedule-reconciliation.js --once --verbose
```

## Production Deployment

For production environments, it's recommended to run the reconciliation job as a scheduled task using a service like Vercel Cron Jobs, AWS Lambda, or a similar service.

### Vercel Cron Job Configuration

Add the following to your `vercel.json` file:

```json
{
  "crons": [
    {
      "path": "/api/cron/reconcile-subscriptions",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Then create an API route at `/api/cron/reconcile-subscriptions.js` that runs the reconciliation script.

## API Route Implementation

The API route for the cron job is implemented at `/api/cron/reconcile-subscriptions/route.ts`. This route:

1. Verifies the request using a CRON_SECRET environment variable
2. Runs the reconciliation process with the fix option enabled
3. Returns a JSON response with the results

To secure this endpoint, make sure to set the CRON_SECRET environment variable in your production environment.

## Debugging and Troubleshooting

If you encounter issues with the reconciliation process:

1. Check the Stripe webhook logs to ensure events are being received
2. Verify that your database schema matches the expected structure
3. Run the reconciliation script with the `--verbose` flag to see detailed logs
4. Check for any errors in your application logs
5. Ensure the CRON_SECRET matches between your environment and the webhook caller

## Security Considerations

- The reconciliation script requires access to your Stripe API key and database
- Ensure that your environment variables are properly secured
- Only run the script in trusted environments
- Consider using read-only API keys for production environments when possible
