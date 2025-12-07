import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';

// Initialize QStash client
const qstashToken = process.env.QSTASH_TOKEN;
let qstash: Client | null = null;

if (qstashToken) {
  qstash = new Client({ token: qstashToken });
}

// This endpoint schedules recurring class notifications using QStash schedules
export async function POST(request: NextRequest) {
  try {
    const { subscription, classSchedules } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    if (!classSchedules || !Array.isArray(classSchedules)) {
      return NextResponse.json(
        { error: 'classSchedules must be an array' },
        { status: 400 }
      );
    }

    if (!qstash || !qstashToken) {
      return NextResponse.json(
        {
          error: 'QStash not configured',
          message: 'Set QSTASH_TOKEN in environment variables'
        },
        { status: 500 }
      );
    }

    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const webhookUrl = `${baseUrl}/api/notifications/class-reminder-webhook`;

    console.log(`📅 Setting up ${classSchedules.length} recurring class notifications`);

    const results = [];

    for (const schedule of classSchedules) {
      const { id, day, startTime, endTime, subjectName, tag, notifyWhen, notifyOffset } = schedule;

      // Calculate notification time
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      let notifyHour, notifyMin;

      if (notifyWhen === 'before') {
        notifyHour = startHour;
        notifyMin = startMin - notifyOffset;
        while (notifyMin < 0) {
          notifyMin += 60;
          notifyHour -= 1;
        }
      } else {
        notifyHour = endHour;
        notifyMin = endMin + notifyOffset;
        while (notifyMin >= 60) {
          notifyMin -= 60;
          notifyHour += 1;
        }
      }

      // Convert to cron format (minute hour * * dayOfWeek)
      const cronSchedule = `${notifyMin} ${notifyHour} * * ${day}`;

      console.log(`📅 Class: ${subjectName}, Day: ${day}, Time: ${notifyHour}:${String(notifyMin).padStart(2, '0')}`);
      console.log(`📅 Cron: ${cronSchedule}`);

      try {
        // Schedule next 4 weeks of this class (free tier friendly)
        // Find next occurrence of this day
        const now = new Date();
        const scheduleIds = [];

        for (let week = 0; week < 4; week++) {
          const nextDate = new Date(now);
          let daysUntilClass = day - nextDate.getDay();
          if (daysUntilClass <= 0) daysUntilClass += 7; // Next week if already passed this week
          daysUntilClass += (week * 7); // Add weeks

          nextDate.setDate(nextDate.getDate() + daysUntilClass);
          nextDate.setHours(notifyHour, notifyMin, 0, 0);

          // Only schedule if in the future
          if (nextDate > now) {
            const delaySeconds = Math.floor((nextDate.getTime() - now.getTime()) / 1000);

            const response = await qstash.publishJSON({
              url: webhookUrl,
              body: {
                subscription,
                title: '📚 Class Reminder',
                body: `${subjectName}${tag ? ` (${tag})` : ''} class ${notifyWhen === 'before' ? 'starts' : 'ends'} in ${notifyOffset} minutes`,
                icon: '/favicon-192.png',
                badge: '/favicon-192.png',
                tag: `class-${id}-${week}`,
                data: {
                  type: 'class',
                  subject: subjectName,
                  scheduleId: id,
                  url: `/attendance/mark?subject=${encodeURIComponent(subjectName)}`,
                },
              },
              delay: delaySeconds,
            });

            scheduleIds.push(response.messageId);
            console.log(`✅ Scheduled ${subjectName} for ${nextDate.toISOString()}`);
          }
        }

        results.push({
          classId: id,
          subject: subjectName,
          qstashScheduleIds: scheduleIds,
          occurrences: scheduleIds.length,
          success: true,
        });
      } catch (error: any) {
        console.error(`❌ Failed to schedule ${subjectName}:`, error.message);
        results.push({
          classId: id,
          subject: subjectName,
          success: false,
          error: error.message,
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Created ${successful} schedules, ❌ ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Created ${successful} recurring notification schedules`,
      created: successful,
      failed,
      results,
    });
  } catch (error: any) {
    console.error('❌ Error creating recurring schedules:', error);
    return NextResponse.json(
      { error: 'Failed to create schedules', details: error.message },
      { status: 500 }
    );
  }
}

// Delete all recurring schedules for this user
export async function DELETE(request: NextRequest) {
  try {
    const { scheduleIds } = await request.json();

    if (!qstash) {
      return NextResponse.json(
        { error: 'QStash not configured' },
        { status: 500 }
      );
    }

    if (!scheduleIds || !Array.isArray(scheduleIds)) {
      return NextResponse.json(
        { error: 'scheduleIds array required' },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      scheduleIds.map(id => qstash!.schedules.delete(id))
    );

    const deleted = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      deleted,
      message: `Deleted ${deleted} schedules`,
    });
  } catch (error: any) {
    console.error('❌ Error deleting schedules:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedules', details: error.message },
      { status: 500 }
    );
  }
}
