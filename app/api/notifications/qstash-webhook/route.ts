import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:example@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// This endpoint is called by QStash when it's time to send the notification
async function handler(request: NextRequest) {
  try {
    console.log('📥 QStash webhook triggered!');

    const body = await request.json();
    console.log('📦 Received payload from QStash');

    const { subscription, title, body: notificationBody, icon, badge, tag, data } = body;

    // Validate payload
    if (!subscription || !subscription.endpoint) {
      console.error('❌ Invalid subscription in webhook payload');
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    if (!title || !notificationBody) {
      console.error('❌ Missing title or body in webhook payload');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check VAPID configuration
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ VAPID keys not configured');
      return NextResponse.json(
        { error: 'Push notifications not configured' },
        { status: 500 }
      );
    }

    console.log(`📤 Sending notification: "${title}"`);

    // Prepare notification payload
    const notification = {
      title,
      body: notificationBody,
      icon: icon || '/favicon-192.png',
      badge: badge || '/favicon-192.png',
      tag: tag || 'qstash-notification',
      requireInteraction: false,
      data: data || {},
    };

    // Send push notification
    await webpush.sendNotification(
      subscription,
      JSON.stringify(notification)
    );

    console.log('✅ Notification sent successfully via QStash webhook');

    return NextResponse.json({
      success: true,
      message: 'Notification sent',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error in QStash webhook:', error);

    // Handle subscription errors
    if (error.statusCode === 410) {
      console.log('🗑️ Subscription expired (410 Gone)');
      return NextResponse.json(
        { error: 'Subscription expired', statusCode: 410 },
        { status: 410 }
      );
    }

    if (error.statusCode === 404) {
      console.log('🗑️ Subscription not found (404)');
      return NextResponse.json(
        { error: 'Subscription not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Verify QStash signature if configured
export const POST = process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY
  ? verifySignatureAppRouter(handler)
  : handler;

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'QStash webhook endpoint is ready',
    configured: !!process.env.QSTASH_TOKEN,
    signatureVerification: !!(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY),
  });
}
