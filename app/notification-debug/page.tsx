'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationDebugPage() {
  const router = useRouter();
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEverything();
  }, []);

  const checkEverything = async () => {
    setLoading(true);
    const results: any = {};

    // 1. Check notification support
    results.notificationSupported = 'Notification' in window;
    results.serviceWorkerSupported = 'serviceWorker' in navigator;
    results.pushManagerSupported = 'PushManager' in window;

    // 2. Check permission
    results.notificationPermission = Notification.permission;

    // 3. Check VAPID key
    results.vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    results.vapidKeyConfigured = !!results.vapidKey;
    results.vapidKeyPreview = results.vapidKey ? results.vapidKey.substring(0, 30) + '...' : 'NOT SET';

    // 4. Check service worker
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        results.serviceWorkerRegistered = !!registration;

        if (registration) {
          results.serviceWorkerState = registration.active?.state || 'unknown';
          results.serviceWorkerScope = registration.scope;

          // Check for subscription
          const subscription = await registration.pushManager.getSubscription();
          results.hasSubscription = !!subscription;

          if (subscription) {
            results.subscriptionEndpoint = subscription.endpoint.substring(0, 80) + '...';
            results.subscriptionKeys = {
              p256dh: subscription.getKey('p256dh') ? 'Present' : 'Missing',
              auth: subscription.getKey('auth') ? 'Present' : 'Missing',
            };
          }
        }
      }
    } catch (error: any) {
      results.serviceWorkerError = error.message;
    }

    // 5. Check if PWA
    results.isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone === true;

    // 6. Check if HTTPS
    results.isHTTPS = window.location.protocol === 'https:';

    setStatus(results);
    setLoading(false);
  };

  const StatusRow = ({ label, value, good }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700">
      <span className="text-gray-300">{label}:</span>
      <span className={good ? 'text-green-400 font-mono text-sm' : 'text-red-400 font-mono text-sm'}>
        {String(value)}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto mb-4" />
          <p>Checking notification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notification Diagnostics</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            ← Back
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Browser Support</h2>
          <StatusRow label="Notifications API" value={status.notificationSupported ? '✅ Supported' : '❌ Not Supported'} good={status.notificationSupported} />
          <StatusRow label="Service Workers" value={status.serviceWorkerSupported ? '✅ Supported' : '❌ Not Supported'} good={status.serviceWorkerSupported} />
          <StatusRow label="Push Manager" value={status.pushManagerSupported ? '✅ Supported' : '❌ Not Supported'} good={status.pushManagerSupported} />
          <StatusRow label="HTTPS" value={status.isHTTPS ? '✅ Yes' : '❌ No (Required!)'} good={status.isHTTPS} />
          <StatusRow label="PWA Installed" value={status.isPWA ? '✅ Yes' : '⚠️ No (Install for best results)'} good={status.isPWA} />
        </div>

        <div className="bg-gray-900 rounded-lg p-6 space-y-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Permissions</h2>
          <StatusRow label="Notification Permission" value={status.notificationPermission} good={status.notificationPermission === 'granted'} />
        </div>

        <div className="bg-gray-900 rounded-lg p-6 space-y-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          <StatusRow label="VAPID Key Configured" value={status.vapidKeyConfigured ? '✅ Yes' : '❌ No'} good={status.vapidKeyConfigured} />
          {status.vapidKeyConfigured && (
            <div className="text-xs text-gray-500 font-mono break-all">
              {status.vapidKeyPreview}
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-lg p-6 space-y-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Service Worker</h2>
          <StatusRow label="Service Worker Registered" value={status.serviceWorkerRegistered ? '✅ Yes' : '❌ No'} good={status.serviceWorkerRegistered} />
          {status.serviceWorkerRegistered && (
            <>
              <StatusRow label="Service Worker State" value={status.serviceWorkerState} good={status.serviceWorkerState === 'activated'} />
              <div className="text-xs text-gray-500 break-all">
                Scope: {status.serviceWorkerScope}
              </div>
            </>
          )}
          {status.serviceWorkerError && (
            <div className="text-red-400 text-sm">Error: {status.serviceWorkerError}</div>
          )}
        </div>

        <div className="bg-gray-900 rounded-lg p-6 space-y-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Push Subscription</h2>
          <StatusRow label="Has Push Subscription" value={status.hasSubscription ? '✅ Yes' : '❌ No'} good={status.hasSubscription} />
          {status.hasSubscription && (
            <>
              <div className="text-xs text-gray-500 font-mono break-all mt-2">
                Endpoint: {status.subscriptionEndpoint}
              </div>
              <StatusRow label="p256dh Key" value={status.subscriptionKeys?.p256dh} good={status.subscriptionKeys?.p256dh === 'Present'} />
              <StatusRow label="Auth Key" value={status.subscriptionKeys?.auth} good={status.subscriptionKeys?.auth === 'Present'} />
            </>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={checkEverything}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            🔄 Refresh Status
          </button>

          {!status.hasSubscription && status.notificationPermission === 'granted' && (
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 text-yellow-200">
              <p className="font-semibold mb-2">⚠️ Permission granted but no subscription!</p>
              <p className="text-sm">
                This means notifications are allowed but push subscription wasn't created.
                Go back to the app, open Settings, and click "Enable" again.
              </p>
            </div>
          )}

          {!status.vapidKeyConfigured && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-200">
              <p className="font-semibold mb-2">❌ VAPID Key Missing!</p>
              <p className="text-sm mb-2">
                Push notifications require a VAPID key. Make sure you've set:
              </p>
              <code className="text-xs block bg-black p-2 rounded">
                NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_key_here
              </code>
              <p className="text-sm mt-2">
                Check your Vercel environment variables or .env.local file.
              </p>
            </div>
          )}

          {!status.isHTTPS && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-200">
              <p className="font-semibold mb-2">❌ HTTPS Required!</p>
              <p className="text-sm">
                Push notifications only work over HTTPS (or localhost for testing).
                Deploy to Vercel for HTTPS support.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Debug page • Check console for detailed logs</p>
        </div>
      </div>
    </div>
  );
}
