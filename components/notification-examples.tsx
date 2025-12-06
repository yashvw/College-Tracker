'use client';

import { sendLocalNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

/**
 * Example component showing how to send notifications for different events
 * in the College Tracker app
 */
export function NotificationExamples() {
  const [isSending, setIsSending] = useState(false);

  const sendAttendanceReminder = async () => {
    setIsSending(true);
    try {
      await sendLocalNotification('📚 Attendance Reminder', {
        body: 'Have you marked attendance for today?',
        tag: 'attendance-reminder',
        requireInteraction: false,
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendUpcomingTaskNotification = async () => {
    setIsSending(true);
    try {
      await sendLocalNotification('⏰ Upcoming Task', {
        body: 'Your assignment submission is due in 2 days',
        tag: 'task-upcoming',
        requireInteraction: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendHabitReminder = async () => {
    setIsSending(true);
    try {
      await sendLocalNotification('🎯 Daily Habit', {
        body: 'Time to complete your morning run - keep your streak alive!',
        tag: 'habit-reminder',
        requireInteraction: false,
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendBackOnTrackNotification = async () => {
    setIsSending(true);
    try {
      await sendLocalNotification('📈 Back on Track', {
        body: 'Great! Your attendance for Mathematics is now 85%',
        tag: 'attendance-improvement',
        requireInteraction: false,
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendExamReminder = async () => {
    setIsSending(true);
    try {
      await sendLocalNotification('📝 Exam Alert', {
        body: 'Physics Final Exam starts in 3 days',
        tag: 'exam-reminder',
        requireInteraction: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Test Notifications</h3>
      <Button
        size="sm"
        variant="outline"
        onClick={sendAttendanceReminder}
        disabled={isSending}
        className="w-full justify-start text-xs"
      >
        📍 Attendance Reminder
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={sendUpcomingTaskNotification}
        disabled={isSending}
        className="w-full justify-start text-xs"
      >
        📅 Upcoming Task
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={sendHabitReminder}
        disabled={isSending}
        className="w-full justify-start text-xs"
      >
        🏃 Habit Reminder
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={sendBackOnTrackNotification}
        disabled={isSending}
        className="w-full justify-start text-xs"
      >
        ✅ Back on Track
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={sendExamReminder}
        disabled={isSending}
        className="w-full justify-start text-xs"
      >
        🎓 Exam Reminder
      </Button>
    </div>
  );
}
