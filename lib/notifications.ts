// Notification utility hook for managing push notifications
export async function requestNotificationPermission() {
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.warn('❌ This browser does not support notifications');
    return false;
  }

  // If already granted, return true
  if (Notification.permission === 'granted') {
    console.log('✅ Notification permission already granted');
    return true;
  }

  // If permission denied, don't ask again
  if (Notification.permission === 'denied') {
    console.warn('⚠️ Notification permission was previously denied');
    return false;
  }

  // Request permission - this should show the browser prompt
  try {
    console.log('📢 Requesting notification permission from browser...');
    const permission = await Notification.requestPermission();
    console.log('📢 Browser permission response:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('✅ Service Worker registered successfully');
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
}

export async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if VAPID key is available
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.log('⚠️ VAPID key not configured. Push notifications disabled. Local notifications still work!');
      return null;
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      console.log('✅ Already subscribed to push notifications');
      // Still send to server in case it was cleared
      await sendSubscriptionToServer(subscription);
      return subscription;
    }

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    console.log('✅ Subscribed to push notifications');

    // Send subscription to server
    await sendSubscriptionToServer(subscription);

    return subscription;
  } catch (error) {
    console.error('⚠️ Push notifications not available. Local notifications still work:', error);
    return null;
  }
}

async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription on server');
    }

    const data = await response.json();
    console.log('✅ Subscription saved on server:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Failed to save subscription on server:', error);
    throw error;
  }
}

export async function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/favicon-192.png',
      badge: '/favicon-192.png',
      ...options,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
