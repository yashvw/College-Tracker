import { NextRequest, NextResponse } from 'next/server';
import { addSchedule } from '@/lib/schedule-store';

// This endpoint syncs user's class schedules to the notification system
export async function POST(request: NextRequest) {
  try {
    const { subscription, classSchedules, taskReminders, habitReminders } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    let syncedCount = 0;

    // Sync class schedules (recurring notifications)
    if (classSchedules && Array.isArray(classSchedules)) {
      for (const classSchedule of classSchedules) {
        const { id, day, startTime, subjectName, tag, notifyWhen, notifyOffset } = classSchedule;

        // Calculate notification time
        const [startHour, startMin] = startTime.split(':').map(Number);
        let notifyHour = startHour;
        let notifyMin = startMin;

        if (notifyWhen === 'before') {
          notifyMin -= notifyOffset;
          while (notifyMin < 0) {
            notifyMin += 60;
            notifyHour -= 1;
          }
        } else {
          notifyMin += notifyOffset;
          while (notifyMin >= 60) {
            notifyMin -= 60;
            notifyHour += 1;
          }
        }

        const notifyTime = `${String(notifyHour).padStart(2, '0')}:${String(notifyMin).padStart(2, '0')}`;

        // Create recurring schedule
        addSchedule({
          id: `class-${id}`,
          subscription,
          type: 'recurring',
          title: '📚 Class Reminder',
          body: `${subjectName}${tag ? ` (${tag})` : ''} class ${notifyWhen === 'before' ? 'starts' : 'ends'} in ${notifyOffset} minutes`,
          recurringPattern: {
            daysOfWeek: [day],
            time: notifyTime,
          },
          data: {
            type: 'class',
            subject: subjectName,
            url: `/attendance/mark?subject=${encodeURIComponent(subjectName)}`,
          },
          enabled: true,
          createdAt: new Date().toISOString(),
        });

        syncedCount++;
      }
    }

    // Sync task reminders (one-time notifications)
    if (taskReminders && Array.isArray(taskReminders)) {
      for (const task of taskReminders) {
        const { id, title, dueDate, type, remindDaysBefore } = task;

        if ((remindDaysBefore || 0) > 0) {
          const taskDueDate = new Date(dueDate);
          const reminderDate = new Date(taskDueDate);
          reminderDate.setDate(reminderDate.getDate() - remindDaysBefore);
          reminderDate.setHours(9, 0, 0, 0); // 9 AM reminder

          // Only schedule if reminder is in the future
          if (reminderDate > new Date()) {
            addSchedule({
              id: `task-${id}`,
              subscription,
              type: 'one-time',
              title: type === 'exam' ? '📝 Exam Reminder' : '📄 Assignment Reminder',
              body: `${title} is due in ${remindDaysBefore} days! (${taskDueDate.toLocaleDateString()})`,
              scheduledTime: reminderDate.toISOString(),
              data: {
                type: 'task',
                taskId: id,
                url: '/?page=exams',
              },
              enabled: true,
              createdAt: new Date().toISOString(),
            });

            syncedCount++;
          }
        }
      }
    }

    // Sync habit reminders (recurring notifications)
    if (habitReminders && Array.isArray(habitReminders)) {
      for (const habit of habitReminders) {
        const { id, name, reminderTime } = habit;

        if (reminderTime) {
          // Default to daily at specified time
          addSchedule({
            id: `habit-${id}`,
            subscription,
            type: 'recurring',
            title: '🎯 Habit Reminder',
            body: `Time to complete: ${name}`,
            recurringPattern: {
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
              time: reminderTime, // e.g., "07:00"
            },
            data: {
              type: 'habit',
              habitId: id,
              url: '/?page=habits',
            },
            enabled: true,
            createdAt: new Date().toISOString(),
          });

          syncedCount++;
        }
      }
    }

    console.log(`✅ Synced ${syncedCount} notification schedules`);

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} notification schedules`,
      synced: syncedCount,
    });
  } catch (error: any) {
    console.error('❌ Error syncing schedules:', error);
    return NextResponse.json(
      { error: 'Failed to sync schedules', details: error.message },
      { status: 500 }
    );
  }
}
