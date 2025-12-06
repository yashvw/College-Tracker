import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:example@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// Store active scheduled notifications (in production, use a database or queue system like BullMQ)
const scheduledNotifications = new Map<string, NodeJS.Timeout>();

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

    if (!delayMinutes || delayMinutes < 1 || delayMinutes > 60) {
      return NextResponse.json(
        { error: 'Delay must be between 1 and 60 minutes' },
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

    // Generate unique ID for this scheduled notification
    const scheduleId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);

    console.log(`📅 Scheduling notification for ${delayMinutes} minute(s) from now`);
    console.log(`⏰ Will send at: ${scheduledTime.toLocaleTimeString()}`);

    // Schedule the notification
    const timeout = setTimeout(async () => {
      console.log(`⏰ Time to send scheduled notification!`);

      try {
        // Prepare notification payload
        const notification = {
          title: '⏰ Scheduled Test Notification',
          body: `This notification was scheduled ${delayMinutes} minute(s) ago. Auto-notifications are working perfectly!`,
          icon: '/favicon-192.png',
          badge: '/favicon-192.png',
          tag: `scheduled-${scheduleId}`,
          requireInteraction: false,
          data: {
            url: '/',
            timestamp: Date.now(),
            scheduledFor: scheduledTime.toISOString(),
          },
        };

        // Send to the specific subscription
        await webpush.sendNotification(
          subscription,
          JSON.stringify(notification)
        );

        console.log('✅ Scheduled notification sent successfully');

        // Remove from active schedules
        scheduledNotifications.delete(scheduleId);
      } catch (error: any) {
        console.error('❌ Error sending scheduled notification:', error);
        scheduledNotifications.delete(scheduleId);
      }
    }, delayMinutes * 60 * 1000);

    // Store the timeout reference
    scheduledNotifications.set(scheduleId, timeout);

    return NextResponse.json({
      success: true,
      message: `Notification scheduled for ${delayMinutes} minute(s) from now`,
      scheduleId,
      scheduledTime: scheduledTime.toISOString(),
      delayMinutes,
    });
  } catch (error: any) {
    console.error('❌ Error scheduling notification:', error);
    return NextResponse.json(
      {
        error: 'Failed to schedule notification',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Cancel a scheduled notification
export async function DELETE(request: NextRequest) {
  try {
    const { scheduleId } = await request.json();

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const timeout = scheduledNotifications.get(scheduleId);
    if (timeout) {
      clearTimeout(timeout);
      scheduledNotifications.delete(scheduleId);
      console.log(`🗑️ Cancelled scheduled notification: ${scheduleId}`);

      return NextResponse.json({
        success: true,
        message: 'Scheduled notification cancelled',
      });
    } else {
      return NextResponse.json(
        { error: 'Scheduled notification not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error cancelling notification:', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel notification',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Get active scheduled notifications count
export async function GET() {
  return NextResponse.json({
    activeSchedules: scheduledNotifications.size,
    schedules: Array.from(scheduledNotifications.keys()),
  });
}
