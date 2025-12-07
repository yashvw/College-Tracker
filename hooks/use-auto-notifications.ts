'use client';

import { useEffect, useState } from 'react';

interface Subject {
  id: string;
  name: string;
  tags?: string[];
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  type: 'exam' | 'assignment';
  remindDaysBefore?: number;
}

interface Habit {
  id: string;
  name: string;
  reminderTime?: string; // "HH:MM" format
}

interface UseAutoNotificationsProps {
  subjects: Subject[];
  tasks: Task[];
  habits: Habit[];
  notificationPermission: NotificationPermission | null;
}

export function useAutoNotifications({
  subjects,
  tasks,
  habits,
  notificationPermission,
}: UseAutoNotificationsProps) {
  // Watch for notification schedule changes in localStorage
  const [notificationScheduleVersion, setNotificationScheduleVersion] = useState(0);

  useEffect(() => {
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notificationSchedule') {
        setNotificationScheduleVersion(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also poll every 3 seconds to catch same-tab changes
    const interval = setInterval(() => {
      const current = localStorage.getItem('notificationSchedule');
      if (current) {
        setNotificationScheduleVersion(prev => prev + 1);
      }
    }, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Sync schedules whenever they change
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const syncSchedules = async () => {
      try {
        // Get current push subscription
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          console.log('⚠️ No push subscription found. Skipping auto-notification sync.');
          return;
        }

        // Get class schedules from localStorage
        const classSchedulesRaw = localStorage.getItem('notificationSchedule');
        const classSchedules = classSchedulesRaw ? JSON.parse(classSchedulesRaw) : [];

        console.log('📅 Setting up recurring class notifications with QStash...');
        console.log(`  - ${classSchedules.length} class schedules`);

        if (classSchedules.length > 0) {
          // Set up QStash recurring schedules for classes
          const response = await fetch('/api/notifications/schedule-recurring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription,
              classSchedules,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Created ${data.created} QStash recurring schedules for classes`);

            // Store QStash schedule IDs for later management
            const scheduleIds = data.results
              .filter((r: any) => r.success)
              .map((r: any) => r.qstashScheduleId);

            if (scheduleIds.length > 0) {
              localStorage.setItem('qstashScheduleIds', JSON.stringify(scheduleIds));
            }
          } else {
            const errorData = await response.json();
            console.error('❌ Failed to create QStash schedules:', errorData.error);
          }
        }

        // Task reminders with QStash one-time schedules
        const taskReminders = tasks.filter(t => (t.remindDaysBefore || 0) > 0);

        if (taskReminders.length > 0) {
          console.log(`📝 Scheduling ${taskReminders.length} task reminders...`);

          for (const task of taskReminders) {
            const dueDate = new Date(task.dueDate);
            const reminderDate = new Date(dueDate);
            reminderDate.setDate(reminderDate.getDate() - (task.remindDaysBefore || 0));
            reminderDate.setHours(9, 0, 0, 0);

            if (reminderDate > new Date()) {
              const delayMinutes = Math.floor((reminderDate.getTime() - Date.now()) / (60 * 1000));

              if (delayMinutes > 0) {
                await fetch('/api/notifications/schedule-qstash', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    subscription,
                    delayMinutes,
                  }),
                });
              }
            }
          }

          console.log(`✅ Task reminders scheduled`);
        }
      } catch (error) {
        console.error('❌ Error syncing notification schedules:', error);
      }
    };

    // Debounce sync to avoid too many calls
    const timeout = setTimeout(() => {
      syncSchedules();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [subjects, tasks, habits, notificationPermission, notificationScheduleVersion]);
}
