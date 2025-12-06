import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:example@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('⚠️ VAPID keys not configured. Push notifications will not work.');
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, tag, requireInteraction, data, icon, badge } =
      await request.json();

    // Validate required fields
    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Check VAPID configuration
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'Push notifications not configured. Set VAPID keys in .env.local' },
        { status: 500 }
      );
    }

    // Get subscriptions from shared store
    const { getSubscriptions, removeSubscription } = await import('@/lib/subscription-store');
    const subscriptions = getSubscriptions();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions found',
        sent: 0,
        failed: 0,
      });
    }

    // Prepare notification payload
    const notification = {
      title,
      body,
      tag: tag || 'notification',
      icon: icon || '/favicon-192.png',
      badge: badge || '/favicon-192.png',
      requireInteraction: requireInteraction || false,
      data: data || {},
    };

    console.log(`📤 Sending notification to ${subscriptions.length} subscribers`);

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify(notification)
          );
          return { success: true };
        } catch (error: any) {
          console.error('❌ Failed to send to subscription:', error.message);
          // If subscription is invalid (410 Gone), remove it
          if (error.statusCode === 410) {
            const { removeSubscription } = await import('@/lib/subscription-store');
            removeSubscription(subscription.endpoint);
          }
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`✅ Sent: ${successful}, ❌ Failed: ${failed}`);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successful} devices`,
      sent: successful,
      failed: failed,
    });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
