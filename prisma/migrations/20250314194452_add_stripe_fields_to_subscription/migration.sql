-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "interval" TEXT DEFAULT 'monthly',
ADD COLUMN     "plan" TEXT DEFAULT 'pro',
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;
