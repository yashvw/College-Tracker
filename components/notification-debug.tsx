'use client';

import { useEffect, useState } from 'react';
import { sendLocalNotification } from '@/lib/notifications';

export function NotificationDebug() {
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const checkNotifications = async () => {
      const info: string[] = [];
      
      // Check browser support
      info.push(`Notification API: ${'Notification' in window ? '✅ Supported' : '❌ Not supported'}`);
      info.push(`Service Worker API: ${'serviceWorker' in navigator ? '✅ Supported' : '❌ Not supported'}`);
      
      if ('Notification' in window) {
        info.push(`Current permission: ${Notification.permission}`);
      }
      
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          info.push(`Service Workers registered: ${registrations.length}`);
          registrations.forEach((reg, idx) => {
            info.push(`  - SW ${idx}: ${reg.scope}`);
          });
        } catch (e) {
          info.push(`Error checking SWs: ${String(e)}`);
        }
      }
      
      setStatus(info.join('\n'));
    };

    checkNotifications();
  }, []);

  return (
    <div className="fixed bottom-20 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-xs text-xs text-gray-300 font-mono z-40 whitespace-pre-wrap">
      <div className="mb-2 font-bold text-yellow-400">Debug Info:</div>
      {status}
      <button
        onClick={async () => {
          await sendLocalNotification('Test Notification', {
            body: 'This is a test notification from the app',
          });
        }}
        className="mt-3 w-full px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
      >
        Send Test Notification
      </button>
    </div>
  );
}
