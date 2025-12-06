'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, registerServiceWorker, subscribeToPushNotifications } from '@/lib/notifications';

export function useNotifications() {
    // --- Custom notification scheduling logic ---
    const [pendingNotification, setPendingNotification] = useState<null | {
      id: string;
      subject: string;
      tag?: string;
      startTime: string;
      endTime: string;
      day: number;
      notifyOffset: number;
      notifyWhen: 'before' | 'after';
    }>(null);

    useEffect(() => {
      // Only run in browser
      if (typeof window === 'undefined') return;

      // Load schedule from localStorage
      const raw = localStorage.getItem('notificationSchedule');
      if (!raw) return;
      const schedule = JSON.parse(raw);

      // Check every minute for due notifications
      const interval = setInterval(() => {
        const now = new Date();
        const nowDay = now.getDay();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        for (const entry of schedule) {
          if (entry.day !== nowDay) continue;
          const [startH, startM] = entry.startTime.split(':').map(Number);
          const [endH, endM] = entry.endTime.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          let triggerTime = null;
          if (entry.notifyWhen === 'before') {
            triggerTime = startMinutes - entry.notifyOffset;
          } else {
            triggerTime = endMinutes + entry.notifyOffset;
          }
          // If current time matches trigger time (within 1 minute)
          if (nowMinutes === triggerTime) {
            // Send real device notification with link
            if (Notification.permission === 'granted') {
              const timeStr = `${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}`;
              const url = `${window.location.origin}/attendance/mark?subject=${encodeURIComponent(entry.subjectName)}&time=${encodeURIComponent(timeStr)}`;
              const body = `${entry.subjectName}${entry.tag ? ` (${entry.tag})` : ''}\n${timeStr}\nTap to mark attendance.`;
              const notification = new Notification('Class Reminder', {
                body,
                icon: '/favicon-192.png',
                badge: '/favicon-192.png',
                data: { url },
              });
              notification.onclick = function () {
                window.sessionStorage.setItem('fromNotification', 'true');
                window.open(url, '_blank');
              };
            }
          }
        }
      }, 60000); // check every minute
      return () => clearInterval(interval);
    }, []);

    // Helper to format time as h:mm am/pm
    function formatTime(time: string) {
      const [h, m] = time.split(':').map(Number);
      const ampm = h >= 12 ? 'pm' : 'am';
      const hour = h % 12 === 0 ? 12 : h % 12;
      return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    // Handler for Attended/Missed actions
    const handleAttendanceAction = (subject: string, action: 'attended' | 'missed') => {
      // Load attendance data from localStorage
      const raw = localStorage.getItem('attendanceData');
      let data = raw ? JSON.parse(raw) : {};
      if (!data[subject]) {
        data[subject] = { attended: 0, missed: 0 };
      }
      if (action === 'attended') {
        data[subject].attended += 1;
      } else {
        data[subject].missed += 1;
      }
      localStorage.setItem('attendanceData', JSON.stringify(data));
      setPendingNotification(null);
    };
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check notification support
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setNotificationSupported(supported);

    if (!supported) return;

    // Set initial permission state
    setNotificationPermission(Notification.permission);

    // Initialize service worker and notifications
    const initNotifications = async () => {
      const swRegistration = await registerServiceWorker();
      if (swRegistration) {
        const subscription = await swRegistration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    };

    initNotifications();
  }, []);

  const enableNotifications = async () => {
    if (!notificationSupported) {
      console.error('❌ Notifications not supported on this device')
      alert('Your device does not support notifications');
      return;
    }

    try {
      console.log('📱 Step 1: Checking notification support...')
      if (!('Notification' in window)) {
        console.error('❌ Notification API not available')
        return
      }

      console.log('📱 Step 2: Current permission:', Notification.permission)
      
      // If already granted, no need to request
      if (Notification.permission === 'granted') {
        console.log('✅ Permission already granted')
        return
      }

      // Request permission - this shows the browser prompt
      console.log('📱 Step 3: Requesting permission from browser (this should show a prompt)...')
      const permission = await Notification.requestPermission();
      console.log('📱 Step 4: User responded with:', permission)

      // Update state with new permission
      setNotificationPermission(permission);

      if (permission === 'granted') {
        console.log('✅ Permission granted! Setting up notifications...')
        // Register service worker
        const swRegistration = await registerServiceWorker();
        if (swRegistration) {
          console.log('✅ Service worker registered')
          // Try to subscribe to push notifications (optional, falls back to local)
          const pushSubscription = await subscribeToPushNotifications();
          setIsSubscribed(!!pushSubscription);
          console.log('✅ Notifications enabled! Local notifications will work immediately.');
        }
      } else if (permission === 'default') {
        console.log('ℹ️ User dismissed the prompt (permission: default)')
      } else {
        console.warn('⚠️ User denied notification permission')
        alert('Notifications were blocked.\n\nTo enable them:\n1. Click the lock/info icon in the address bar\n2. Find "Notifications" and change it to "Allow"\n3. Come back and click Enable again');
      }
    } catch (error) {
      console.error('❌ Error enabling notifications:', error);
    }
  };

  return {
    notificationSupported,
    notificationPermission,
    isSubscribed,
    enableNotifications,
  };
}
