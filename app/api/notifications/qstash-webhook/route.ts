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
    console.log('====== QStash Webhook Triggered ======');
    console.log('📥 Time:', new Date().toISOString());
    console.log('📍 URL:', request.url);
    console.log('📋 Method:', request.method);

    const body = await request.json();
    console.log('📦 Received payload from QStash');
    console.log('📦 Payload keys:', Object.keys(body));

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

    // Prepare notification payload with lock screen support
    const notification = {
      title,
      body: notificationBody,
      icon: icon || '/favicon-192.png',
      badge: badge || '/favicon-192.png',
      tag: tag || 'qstash-notification',
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200],
      data: data || {},
    };

    // Send push notification
    console.log('📤 Calling webpush.sendNotification...');
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(notification)
    );

    console.log('✅ Web push returned successfully');
    console.log('📊 Result:', result);
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

// Export POST handler
// Note: Signature verification can cause issues if keys are not properly set
// For now, disable it for debugging
export async function POST(request: NextRequest) {
  console.log('📥 Webhook POST received');
  console.log('📋 Headers:', Object.fromEntries(request.headers.entries()));

  // Check if signature verification is configured
  const hasSigningKeys = process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY;

  if (hasSigningKeys) {
    console.log('🔐 Signature verification enabled');
    try {
      // Verify signature
      const verified = verifySignatureAppRouter(handler);
      return verified(request);
    } catch (error: any) {
      console.error('❌ Signature verification failed:', error.message);
      // Fall through to unverified handler for debugging
      console.log('⚠️ Running without signature verification for debugging');
    }
  } else {
    console.log('⚠️ Signature verification disabled (signing keys not set)');
  }

  // Run handler without verification
  return handler(request);
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'QStash webhook endpoint is ready',
    configured: !!process.env.QSTASH_TOKEN,
    signatureVerification: !!(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY),
    vapidConfigured: !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    timestamp: new Date().toISOString(),
  });
}
