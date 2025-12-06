'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Target, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationStatus() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const syncNow = async () => {
    setSyncing(true);

    try {
      // Get current subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        toast.error('Please enable notifications first');
        setSyncing(false);
        return;
      }

      // Get class schedules from localStorage
      const classSchedulesRaw = localStorage.getItem('notificationSchedule');
      const classSchedules = classSchedulesRaw ? JSON.parse(classSchedulesRaw) : [];

      // Get tasks from localStorage
      const tasksRaw = localStorage.getItem('tasks');
      const tasks = tasksRaw ? JSON.parse(tasksRaw) : [];
      const taskReminders = tasks.filter((t: any) => (t.remindDaysBefore || 0) > 0);

      // Sync with server
      const response = await fetch('/api/notifications/sync-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          classSchedules,
          taskReminders,
          habitReminders: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Synced ${data.synced} notification schedules!`);
        loadSchedules();
      } else {
        toast.error('Failed to sync schedules');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Error syncing schedules');
    } finally {
      setSyncing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'class': return <Calendar className="h-4 w-4" />;
      case 'task': return <FileText className="h-4 w-4" />;
      case 'habit': return <Target className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const classSchedules = schedules.filter(s => s.id?.startsWith('class-'));
  const taskSchedules = schedules.filter(s => s.id?.startsWith('task-'));
  const habitSchedules = schedules.filter(s => s.id?.startsWith('habit-'));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Active Notifications</CardTitle>
            <CardDescription>
              Automatic reminders for classes, tasks, and habits
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={syncNow}
            disabled={syncing}
          >
            {syncing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Now
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : schedules.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">No active notifications</p>
            <p className="text-xs text-muted-foreground">
              Add class schedules, set task reminders, or configure habit notifications
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Class Notifications */}
            {classSchedules.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Class Reminders</h4>
                  <Badge variant="secondary">{classSchedules.length}</Badge>
                </div>
                <div className="pl-6 space-y-1">
                  {classSchedules.slice(0, 3).map((schedule) => (
                    <p key={schedule.id} className="text-xs text-muted-foreground">
                      {schedule.title} - {schedule.enabled ? '✅ Active' : '⏸️ Paused'}
                    </p>
                  ))}
                  {classSchedules.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{classSchedules.length - 3} more...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Task Notifications */}
            {taskSchedules.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Task Reminders</h4>
                  <Badge variant="secondary">{taskSchedules.length}</Badge>
                </div>
                <div className="pl-6 space-y-1">
                  {taskSchedules.slice(0, 3).map((schedule) => (
                    <p key={schedule.id} className="text-xs text-muted-foreground">
                      {schedule.title} - {schedule.enabled ? '✅ Active' : '⏸️ Paused'}
                    </p>
                  ))}
                  {taskSchedules.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{taskSchedules.length - 3} more...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Habit Notifications */}
            {habitSchedules.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Habit Reminders</h4>
                  <Badge variant="secondary">{habitSchedules.length}</Badge>
                </div>
                <div className="pl-6 space-y-1">
                  {habitSchedules.slice(0, 3).map((schedule) => (
                    <p key={schedule.id} className="text-xs text-muted-foreground">
                      {schedule.title} - {schedule.enabled ? '✅ Active' : '⏸️ Paused'}
                    </p>
                  ))}
                  {habitSchedules.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{habitSchedules.length - 3} more...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {schedules.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Notifications are sent automatically by Vercel Cron.
              Changes to your schedules will sync automatically.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
