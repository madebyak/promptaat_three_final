/*
  Warnings:

  - You are about to drop the column `end_date` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `plan_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `current_period_end` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current_period_start` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interval` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "end_date",
DROP COLUMN "plan_id",
DROP COLUMN "start_date",
ADD COLUMN     "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "current_period_end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "current_period_start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "interval" TEXT NOT NULL,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'basic',
ADD COLUMN     "price_id" TEXT,
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_prices" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "stripe_price_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_prices_plan_id_interval_key" ON "subscription_prices"("plan_id", "interval");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "subscription_prices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_prices" ADD CONSTRAINT "subscription_prices_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
