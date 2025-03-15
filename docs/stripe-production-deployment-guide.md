# Stripe Production Deployment Guide

This guide provides a comprehensive overview of the steps required to transition your Stripe integration from test mode to production for live payments on Promptaat.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Webhook Configuration](#webhook-configuration)
3. [Code Adjustments](#code-adjustments)
4. [Testing In Production Environment](#testing-in-production-environment)
5. [Production Monitoring & Maintenance](#production-monitoring--maintenance)
6. [Troubleshooting Common Issues](#troubleshooting-common-issues)
7. [Security Best Practices](#security-best-practices)
8. [User Management Considerations](#user-management-considerations)

## Environment Variables

Update your production environment with the following Stripe variables:

```bash
# Test keys (Development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Production keys (Live Environment)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

> ⚠️ **CRITICAL:** Production keys begin with `sk_live_` and `pk_live_` while test keys begin with `sk_test_` and `pk_test_`. Never use test keys in production or live keys in development.

## Webhook Configuration

### 1. Register Production Webhooks

1. Go to the Stripe Dashboard → Developers → Webhooks
2. Add an endpoint pointing to your production URL: `https://yourproduction.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 2. Webhook Secret

- After creating the webhook, Stripe will provide a signing secret
- Update your environment variable:
  ```
  STRIPE_WEBHOOK_SECRET=whsec_live_...
  ```

### 3. Webhook Event Handling Considerations

- Ensure idempotency: Stripe may send the same webhook event multiple times
- Implement proper error handling for webhook processing
- Add detailed logging for webhook events in production

## Code Adjustments

The webhook handler has been modified to properly handle production mode. Key changes include:

1. Removing development-specific workarounds:
    ```typescript
    // Previous development-specific code (removed)
    if (process.env.NODE_ENV === 'development') {
      // Using test user IDs for development
      const testUser = await prisma.user.findFirst({
        where: { role: "USER" },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });
      // ...
    }
    ```

2. Implementing strict validation for production events:
    ```typescript
    // Production-ready code
    if (event.livemode === false) {
      // For test events (not in production), use special handling
      console.error("[WEBHOOK] Test event detected without user ID in metadata");
      return new Response('Test event without user ID processed but no action taken', { status: 200 });
    } else {
      // In production with real payments, strict user identification
      console.error("[WEBHOOK] No userId found in metadata for live mode event");
      return new Response('Missing user identification in webhook payload', { status: 400 });
    }
    ```

## Testing In Production Environment

Before going fully live, perform these tests:

### 1. Test Mode in Production Environment

1. Deploy your application with the updated code but still using test keys
2. Create a test subscription using the Stripe test card numbers
3. Verify the complete subscription flow:
   - Checkout session created
   - Payment successful
   - Webhook events received and processed
   - Subscription created in database
   - User gains access to premium content

### 2. Live Mode Testing With Minimal Amounts

1. Switch to live keys in your production environment
2. Create a test product with a minimal price (e.g., $1)
3. Use a real card to make a test purchase
4. Verify the entire production flow:
   - Successful payment
   - Webhooks received and processed
   - Database records created
   - User gains access to premium features

### 3. Monitoring Webhooks

Use the Stripe Dashboard to view webhook delivery:
1. Go to Developers → Webhooks → Select your endpoint
2. Review "Recent Events" section to ensure events are being:
   - Delivered successfully
   - Acknowledged with 200 status codes
   - Processed in a timely manner

## Production Monitoring & Maintenance

### 1. Error Monitoring

- Implement comprehensive error logging specifically for payment processing
- Set up alerts for payment failures and webhook errors
- Monitor subscription creation/update failures

### 2. Regular Audits

- Perform regular reconciliation between Stripe subscriptions and your database
- Check for discrepancies in user subscription status
- Verify webhook delivery for critical events

### 3. Customer Support Tools

- Create admin tools to look up user subscription status
- Implement capabilities to manually synchronize user subscription data with Stripe
- Document common support scenarios and resolution steps

## Troubleshooting Common Issues

### 1. Webhook Delivery Issues

- **Problem**: Webhooks not being received
- **Solution**: Verify webhook endpoints in Stripe Dashboard, check server logs for connection issues

### 2. Signature Verification Failures

- **Problem**: `Webhook signature verification failed` errors
- **Solution**: Confirm `STRIPE_WEBHOOK_SECRET` matches the value in Stripe Dashboard

### 3. Subscription Record Creation Failures

- **Problem**: User paid but no subscription record in database
- **Solution**: Check for userId in webhook metadata, verify price IDs match between Stripe and database

### 4. Database Discrepancies

- **Problem**: Subscription status differs between Stripe and your database
- **Solution**: Implement a database synchronization script that fetches active subscriptions from Stripe

## Security Best Practices

### 1. API Key Management

- Store API keys securely in environment variables
- Rotate keys periodically (every 6-12 months)
- Use restricted API keys when possible

### 2. PCI Compliance

- Never log full card numbers or sensitive payment details
- Use Stripe Elements or Checkout to keep card data off your servers
- Implement proper access controls for payment administration

### 3. User Data Protection

- Encrypt sensitive user information
- Implement proper authorization checks for subscription data access
- Follow data retention best practices

## User Management Considerations

### 1. Subscription Management Interface

- Provide users with a clear interface to:
  - View current subscription status
  - Update payment methods
  - Cancel subscriptions
  - View payment history

### 2. Failed Payment Handling

- Implement grace periods for failed payments
- Send automatic notifications for payment failures
- Provide clear instructions for updating payment methods

### 3. Subscription Lifecycle Events

- Handle subscription cancellations gracefully
- Implement renewal reminders
- Consider offering win-back promotions for expired subscriptions

---

## Final Checklist Before Going Live

- [ ] Production Stripe API keys configured
- [ ] Webhook endpoints registered and verified
- [ ] Code updated to handle production events properly
- [ ] Test subscription flow completed successfully in production environment
- [ ] Monitoring and logging in place
- [ ] Customer support tools and documentation ready
- [ ] Security review completed
- [ ] User management flows tested and working
- [ ] Backup and recovery procedures documented
- [ ] Team trained on handling payment issues

---

Document Version: 1.0  
Last Updated: March 14, 2025
