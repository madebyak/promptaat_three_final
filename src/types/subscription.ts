// Extend subscription type with Stripe fields
export interface SubscriptionWithStripe {
  id: string;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date;
  currentPeriodStart: Date;
  priceId: string | null;
  stripeSubscriptionId?: string; // Additional field for Stripe integration
}
