/*
  Warnings:

  - You are about to drop the column `active` on the `subscription_prices` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_price_id` on the `subscription_prices` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `subscription_prices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `interval` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_customer_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_price_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_subscription_id` on the `subscriptions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "subscription_prices_plan_id_interval_key";

-- DropIndex
DROP INDEX "subscriptions_user_id_key";

-- AlterTable
ALTER TABLE "subscription_prices" DROP COLUMN "active",
DROP COLUMN "stripe_price_id",
ADD COLUMN     "interval_count" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "interval",
DROP COLUMN "plan",
DROP COLUMN "stripe_customer_id",
DROP COLUMN "stripe_price_id",
DROP COLUMN "stripe_subscription_id";
