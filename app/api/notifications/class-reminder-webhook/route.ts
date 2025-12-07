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

// This webhook is called by QStash on a recurring schedule for class reminders
async function handler(request: NextRequest) {
  try {
    console.log('====== Class Reminder Webhook (QStash Recurring) ======');
    console.log('📅 Time:', new Date().toISOString());

    const body = await request.json();
    console.log('📦 Received class reminder payload');

    const { subscription, title, body: notificationBody, icon, badge, tag, data } = body;

    // Validate
    if (!subscription || !subscription.endpoint) {
      console.error('❌ Invalid subscription');
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    if (!title || !notificationBody) {
      console.error('❌ Missing title or body');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ VAPID keys not configured');
      return NextResponse.json({ error: 'VAPID not configured' }, { status: 500 });
    }

    console.log(`📤 Sending class reminder: "${title}"`);

    // Send push notification
    const notification = {
      title,
      body: notificationBody,
      icon: icon || '/favicon-192.png',
      badge: badge || '/favicon-192.png',
      tag: tag || 'class-reminder',
      requireInteraction: true,
      data: data || {},
    };

    await webpush.sendNotification(
      subscription,
      JSON.stringify(notification)
    );

    console.log('✅ Class reminder sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Class reminder sent',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error sending class reminder:', error);

    if (error.statusCode === 410) {
      console.log('🗑️ Subscription expired (410 Gone)');
      return NextResponse.json(
        { error: 'Subscription expired', statusCode: 410 },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}

// Handle signature verification
export async function POST(request: NextRequest) {
  console.log('📥 Class reminder webhook POST received');

  const hasSigningKeys = process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY;

  if (hasSigningKeys) {
    try {
      const verified = verifySignatureAppRouter(handler);
      return verified(request);
    } catch (error: any) {
      console.error('❌ Signature verification failed:', error.message);
      console.log('⚠️ Running without verification for debugging');
    }
  }

  return handler(request);
}

export async function GET() {
  return NextResponse.json({
    message: 'Class reminder webhook endpoint is ready',
    timestamp: new Date().toISOString(),
  });
}
