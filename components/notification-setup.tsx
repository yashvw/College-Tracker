'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Send, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function NotificationSetup() {
  const { notificationSupported, notificationPermission, enableNotifications } = useNotifications();
  const [mounted, setMounted] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if app is installed as PWA
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
    setIsPWA(isInstalled);
  }, []);

  const sendTestNotification = async () => {
    setTesting(true);

    try {
      // Get current subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        toast.error('No subscription found. Please enable notifications first.');
        setTesting(false);
        return;
      }

      // Send test notification
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Test notification sent! Check your device notification panel.', {
          description: 'If you don\'t see it, make sure the app is installed as PWA and notifications are allowed in system settings.',
          duration: 5000,
        });
      } else {
        toast.error(data.error || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification. Check console for details.');
    } finally {
      setTesting(false);
    }
  };

  if (!mounted || !notificationSupported) return null;

  const isGranted = notificationPermission === 'granted';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant={isGranted ? 'default' : 'outline'}
          size="sm"
          onClick={enableNotifications}
          disabled={isGranted}
          className="gap-2"
          title={isGranted ? 'Notifications enabled' : 'Click to enable notifications'}
        >
          {isGranted ? (
            <>
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Enabled</span>
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" />
              <span className="hidden sm:inline">Enable</span>
            </>
          )}
        </Button>

        {isGranted && (
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            disabled={testing}
            className="gap-2"
            title="Send a test notification to this device"
          >
            {testing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="hidden sm:inline">Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Test</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Status indicators */}
      {isGranted && (
        <div className="flex items-center gap-2 text-xs">
          {isPWA ? (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span>PWA Installed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-3 w-3" />
              <span>Install as PWA for best results</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
