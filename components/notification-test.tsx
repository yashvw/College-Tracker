'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NotificationTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const sendTestNotification = async () => {
    setLoading(true);
    setResult('Sending...');

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Notification 📱',
          body: 'This is a test push notification from your College Tracker!',
          tag: 'test',
          requireInteraction: false,
          data: { url: '/' },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success! Sent to ${data.sent} device(s). Failed: ${data.failed}`);
      } else {
        setResult(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Failed to send: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const sendClassReminder = async () => {
    setLoading(true);
    setResult('Sending class reminder...');

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Class Reminder 🔔',
          body: 'Your Physics class starts in 15 minutes',
          tag: 'class-physics',
          requireInteraction: true,
          data: {
            subject: 'Physics',
            time: '2:00 PM',
            url: '/attendance/mark?subject=Physics&time=2:00 PM',
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Class reminder sent to ${data.sent} device(s)`);
      } else {
        setResult(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Failed to send: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const sendHabitReminder = async () => {
    setLoading(true);
    setResult('Sending habit reminder...');

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Habit Reminder 🎯',
          body: "Don't forget to complete your morning run today!",
          tag: 'habit-reminder',
          requireInteraction: false,
          data: { url: '/?page=habits' },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Habit reminder sent to ${data.sent} device(s)`);
      } else {
        setResult(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Failed to send: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptions = async () => {
    setLoading(true);
    setResult('Checking subscriptions...');

    try {
      const response = await fetch('/api/notifications/subscribe');
      const data = await response.json();

      setResult(`📊 Total subscriptions: ${data.count}\n\n${JSON.stringify(data.subscriptions, null, 2)}`);
    } catch (error) {
      setResult(`❌ Failed to check: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Push Notification Testing</CardTitle>
        <CardDescription>
          Test push notifications on your device. Make sure you've enabled notifications first!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={sendTestNotification} disabled={loading} variant="default">
            Send Test Notification
          </Button>

          <Button onClick={sendClassReminder} disabled={loading} variant="secondary">
            Class Reminder
          </Button>

          <Button onClick={sendHabitReminder} disabled={loading} variant="secondary">
            Habit Reminder
          </Button>

          <Button onClick={checkSubscriptions} disabled={loading} variant="outline">
            Check Subscriptions
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap break-words">{result}</pre>
          </div>
        )}

        <div className="mt-6 p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm font-semibold mb-2">📝 How to test:</p>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Enable notifications using the bell icon in the header</li>
            <li>Click one of the buttons above to send a test notification</li>
            <li>Check your device notification center</li>
            <li>Install the app as PWA for best results on mobile</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
