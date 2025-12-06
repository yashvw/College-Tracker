// Shared subscription store for push notifications
// In production, replace this with a database (Prisma, MongoDB, etc.)

interface Subscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
  expirationTime?: number | null;
  createdAt: string;
  updatedAt?: string;
  userAgent?: string;
}

// In-memory store (will reset on server restart)
let subscriptions: Subscription[] = [];

export function addSubscription(subscription: Subscription): void {
  const existingIndex = subscriptions.findIndex(
    (s) => s.endpoint === subscription.endpoint
  );

  if (existingIndex >= 0) {
    // Update existing subscription
    subscriptions[existingIndex] = {
      ...subscription,
      updatedAt: new Date().toISOString(),
    };
    console.log('✅ Subscription updated:', subscription.endpoint);
  } else {
    // Add new subscription
    subscriptions.push({
      ...subscription,
      createdAt: new Date().toISOString(),
    });
    console.log('✅ New subscription added:', subscription.endpoint);
  }

  console.log(`📊 Total subscriptions: ${subscriptions.length}`);
}

export function getSubscriptions(): Subscription[] {
  return subscriptions;
}

export function removeSubscription(endpoint: string): boolean {
  const initialLength = subscriptions.length;
  subscriptions = subscriptions.filter((s) => s.endpoint !== endpoint);
  const removed = subscriptions.length < initialLength;

  if (removed) {
    console.log('🗑️ Subscription removed:', endpoint);
    console.log(`📊 Total subscriptions: ${subscriptions.length}`);
  }

  return removed;
}

export function getSubscriptionCount(): number {
  return subscriptions.length;
}
