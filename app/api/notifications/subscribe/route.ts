import { NextRequest, NextResponse } from 'next/server';
import { addSubscription, getSubscriptions, getSubscriptionCount } from '@/lib/subscription-store';

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    // Validate subscription object
    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Add subscription to store
    addSubscription({
      ...subscription,
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription stored successfully',
      totalSubscriptions: getSubscriptionCount(),
    });
  } catch (error) {
    console.error('❌ Error storing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to store subscription' },
      { status: 500 }
    );
  }
}

// Get all subscriptions (for internal use)
export async function GET() {
  const allSubscriptions = getSubscriptions();

  return NextResponse.json({
    count: allSubscriptions.length,
    subscriptions: allSubscriptions.map((s) => ({
      endpoint: s.endpoint.substring(0, 50) + '...',
      createdAt: s.createdAt,
      userAgent: s.userAgent,
    })),
  });
}
