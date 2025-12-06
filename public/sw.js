// Public Service Worker for handling push notifications and background tasks
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'College Tracker';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon-192.png',
    badge: '/favicon-192.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'open',
        title: 'Open App',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      (async () => {
        const notificationData = event.notification && event.notification.data ? event.notification.data : {};

        // Construct target URL. If `data.url` provided, use it, otherwise build attendance mark URL
        let targetUrl = '/';
        try {
          if (notificationData.url) {
            targetUrl = notificationData.url;
          } else if (notificationData.subject) {
            const params = new URLSearchParams({
              subject: notificationData.subject || '',
              time: notificationData.time || '',
              day: notificationData.day || '',
              type: notificationData.type || '',
              fromNotification: 'true',
            });
            targetUrl = `/attendance/mark?${params.toString()}`;
          }
        } catch (err) {
          targetUrl = '/';
        }

        const windowClients = await clients.matchAll({ type: 'window' });
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If an existing client is open with the same URL, focus it
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }

        // Otherwise open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })()
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.tag);
});
