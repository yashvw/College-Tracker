import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:example@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();

    // Validate subscription
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
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

    // Prepare test notification payload
    const notification = {
      title: '🎉 Test Notification!',
      body: 'Your push notifications are working perfectly! You will receive class reminders, task deadlines, and habit reminders even when the app is closed.',
      icon: '/favicon-192.png',
      badge: '/favicon-192.png',
      tag: 'test-notification',
      requireInteraction: false,
      data: {
        url: '/',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
        },
      ],
    };

    console.log('📤 Sending test notification to device');

    // Send to the specific subscription
    await webpush.sendNotification(
      subscription,
      JSON.stringify(notification)
    );

    console.log('✅ Test notification sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Test notification sent! Check your device.',
    });
  } catch (error: any) {
    console.error('❌ Error sending test notification:', error);

    // Handle specific errors
    if (error.statusCode === 410) {
      return NextResponse.json(
        { error: 'Subscription expired. Please re-enable notifications.' },
        { status: 410 }
      );
    }

    if (error.statusCode === 404) {
      return NextResponse.json(
        { error: 'Subscription not found. Please re-enable notifications.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to send test notification',
        details: error.message
      },
      { status: 500 }
    );
  }
}
