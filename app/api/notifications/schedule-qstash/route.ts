import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';

// Initialize QStash client
const qstashToken = process.env.QSTASH_TOKEN;
const qstashUrl = process.env.QSTASH_URL || process.env.VERCEL_URL || 'http://localhost:3000';

let qstash: Client | null = null;

if (qstashToken) {
  qstash = new Client({ token: qstashToken });
} else {
  console.warn('⚠️ QStash not configured. Set QSTASH_TOKEN in environment variables.');
}

export async function POST(request: NextRequest) {
  try {
    const { subscription, delayMinutes } = await request.json();

    // Validate inputs
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    if (!delayMinutes || delayMinutes < 1 || delayMinutes > 1440) {
      return NextResponse.json(
        { error: 'Delay must be between 1 and 1440 minutes (24 hours)' },
        { status: 400 }
      );
    }

    // Check QStash configuration
    if (!qstash || !qstashToken) {
      return NextResponse.json(
        {
          error: 'QStash not configured',
          message: 'Please set QSTASH_TOKEN in Vercel environment variables. Get it free at https://console.upstash.com'
        },
        { status: 500 }
      );
    }

    // Calculate scheduled time
    const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);
    const scheduleId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log(`📅 Scheduling notification via QStash for ${delayMinutes} minute(s) from now`);
    console.log(`⏰ Will send at: ${scheduledTime.toISOString()}`);

    // Get the webhook URL (where QStash will send the request)
    // Use the request origin or Vercel URL
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const webhookUrl = `${baseUrl}/api/notifications/qstash-webhook`;

    console.log(`📍 Base URL: ${baseUrl}`);
    console.log(`📍 Webhook URL: ${webhookUrl}`);
    console.log(`📍 Request origin: ${requestUrl.origin}`);

    // Schedule the notification with QStash
    const response = await qstash.publishJSON({
      url: webhookUrl,
      body: {
        subscription,
        title: '⏰ Scheduled Test Notification',
        body: `This notification was scheduled ${delayMinutes} minute(s) ago. Auto-notifications with QStash are working perfectly! 🎉`,
        scheduleId,
        icon: '/favicon-192.png',
        badge: '/favicon-192.png',
        tag: `scheduled-${scheduleId}`,
        data: {
          url: '/',
          timestamp: Date.now(),
          scheduledFor: scheduledTime.toISOString(),
        },
      },
      delay: delayMinutes * 60, // QStash uses seconds
      retries: 3,
    });

    console.log('✅ Notification scheduled with QStash');
    console.log('📍 QStash Message ID:', response.messageId);

    return NextResponse.json({
      success: true,
      message: `Notification scheduled for ${delayMinutes} minute(s) from now`,
      scheduleId,
      qstashMessageId: response.messageId,
      scheduledTime: scheduledTime.toISOString(),
      delayMinutes,
    });
  } catch (error: any) {
    console.error('❌ Error scheduling notification with QStash:', error);

    // Provide helpful error messages
    if (error.message?.includes('401')) {
      return NextResponse.json(
        {
          error: 'Invalid QStash token',
          message: 'Check your QSTASH_TOKEN environment variable'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to schedule notification',
        details: error.message
      },
      { status: 500 }
    );
  }
}
