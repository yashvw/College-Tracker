import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getDueSchedules, markScheduleAsSent } from '@/lib/schedule-store';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:example@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// This endpoint is called by Vercel Cron every minute
export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify cron secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Cron job running at:', new Date().toISOString());

    // Check VAPID configuration
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ VAPID keys not configured');
      return NextResponse.json({
        error: 'Push notifications not configured',
        sent: 0
      }, { status: 500 });
    }

    // Get schedules that are due now
    const dueSchedules = getDueSchedules();

    if (dueSchedules.length === 0) {
      console.log('✅ No notifications due at this time');
      return NextResponse.json({
        success: true,
        message: 'No notifications due',
        sent: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`📤 Found ${dueSchedules.length} notification(s) to send`);

    // Send each notification
    const results = await Promise.allSettled(
      dueSchedules.map(async (schedule) => {
        try {
          // Prepare notification payload
          const notification = {
            title: schedule.title,
            body: schedule.body,
            icon: '/favicon-192.png',
            badge: '/favicon-192.png',
            tag: schedule.id,
            requireInteraction: schedule.type === 'one-time',
            data: schedule.data || {},
          };

          // Send push notification
          await webpush.sendNotification(
            schedule.subscription,
            JSON.stringify(notification)
          );

          console.log(`✅ Sent notification: ${schedule.title}`);

          // Mark as sent
          markScheduleAsSent(schedule.id);

          return { success: true, scheduleId: schedule.id };
        } catch (error: any) {
          console.error(`❌ Failed to send notification for schedule ${schedule.id}:`, error.message);

          // If subscription is invalid (410 Gone), we could remove it
          if (error.statusCode === 410) {
            console.log(`🗑️ Subscription expired for schedule: ${schedule.id}`);
            // TODO: Remove invalid schedule
          }

          throw error;
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Sent: ${successful}, ❌ Failed: ${failed}`);

    return NextResponse.json({
      success: true,
      message: `Processed ${dueSchedules.length} notification(s)`,
      sent: successful,
      failed: failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
