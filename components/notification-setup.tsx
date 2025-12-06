'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NotificationSetup() {
  const { notificationSupported, notificationPermission, enableNotifications } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !notificationSupported) return null;

  const isGranted = notificationPermission === 'granted';

  return (
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
            <span className="hidden sm:inline">Notifications On</span>
          </>
        ) : (
          <>
            <BellOff className="h-4 w-4" />
            <span className="hidden sm:inline">Enable Notifications</span>
          </>
        )}
      </Button>
    </div>
  );
}
