'use client';

import { useEffect } from 'react';

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

        // Prepare task reminders
        const taskReminders = tasks.filter(t => (t.remindDaysBefore || 0) > 0);

        // Prepare habit reminders (for now, we'll add UI to set reminder times later)
        const habitReminders: any[] = []; // Will be populated when we add reminder time UI

        console.log('📅 Syncing notification schedules...');
        console.log(`  - ${classSchedules.length} class schedules`);
        console.log(`  - ${taskReminders.length} task reminders`);
        console.log(`  - ${habitReminders.length} habit reminders`);

        // Sync with server
        const response = await fetch('/api/notifications/sync-schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            classSchedules,
            taskReminders,
            habitReminders,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Synced ${data.synced} notification schedules to Vercel Cron`);
        } else {
          console.error('❌ Failed to sync notification schedules');
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
  }, [subjects, tasks, habits, notificationPermission]);
}
