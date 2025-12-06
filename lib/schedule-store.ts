// Notification schedule storage
// In production, replace with a database (Prisma, Supabase, etc.)

export interface NotificationSchedule {
  id: string;
  subscription: any; // Push subscription object
  type: 'one-time' | 'recurring';
  title: string;
  body: string;
  scheduledTime?: string; // ISO string for one-time
  recurringPattern?: {
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    time: string; // "HH:MM" format
  };
  data?: any;
  enabled: boolean;
  createdAt: string;
  lastSent?: string; // ISO string
}

// In-memory store (will reset on server restart/redeploy)
let schedules: NotificationSchedule[] = [];

export function addSchedule(schedule: NotificationSchedule): void {
  // Remove existing schedule with same ID
  schedules = schedules.filter(s => s.id !== schedule.id);

  schedules.push({
    ...schedule,
    createdAt: schedule.createdAt || new Date().toISOString(),
  });

  console.log(`✅ Schedule added: ${schedule.title} (${schedule.type})`);
  console.log(`📊 Total schedules: ${schedules.length}`);
}

export function getSchedules(): NotificationSchedule[] {
  return schedules;
}

export function getActiveSchedules(): NotificationSchedule[] {
  return schedules.filter(s => s.enabled);
}

export function removeSchedule(id: string): boolean {
  const initialLength = schedules.length;
  schedules = schedules.filter(s => s.id !== id);
  const removed = schedules.length < initialLength;

  if (removed) {
    console.log(`🗑️ Schedule removed: ${id}`);
    console.log(`📊 Total schedules: ${schedules.length}`);
  }

  return removed;
}

export function updateSchedule(id: string, updates: Partial<NotificationSchedule>): boolean {
  const index = schedules.findIndex(s => s.id === id);

  if (index >= 0) {
    schedules[index] = { ...schedules[index], ...updates };
    console.log(`✅ Schedule updated: ${id}`);
    return true;
  }

  return false;
}

export function markScheduleAsSent(id: string): void {
  const schedule = schedules.find(s => s.id === id);
  if (schedule) {
    schedule.lastSent = new Date().toISOString();
  }
}

// Get schedules that should be sent now
export function getDueSchedules(): NotificationSchedule[] {
  const now = new Date();
  const currentDay = now.getDay(); // 0-6
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentMinute = now.getHours() * 60 + now.getMinutes();

  return schedules.filter(schedule => {
    if (!schedule.enabled) return false;

    if (schedule.type === 'one-time') {
      // Check if it's time for one-time notification
      if (!schedule.scheduledTime) return false;

      const scheduledDate = new Date(schedule.scheduledTime);
      const scheduledMinute = scheduledDate.getHours() * 60 + scheduledDate.getMinutes();

      // Check if scheduled time is within current minute
      // and hasn't been sent yet
      const isCurrentMinute = currentMinute === scheduledMinute &&
                             scheduledDate.toDateString() === now.toDateString();

      const notSentYet = !schedule.lastSent ||
                         new Date(schedule.lastSent) < scheduledDate;

      return isCurrentMinute && notSentYet;
    } else if (schedule.type === 'recurring') {
      // Check if it's time for recurring notification
      if (!schedule.recurringPattern) return false;

      const { daysOfWeek, time } = schedule.recurringPattern;

      // Check if today is one of the scheduled days
      if (!daysOfWeek.includes(currentDay)) return false;

      // Check if current time matches scheduled time
      if (time !== currentTime) return false;

      // Check if already sent today
      if (schedule.lastSent) {
        const lastSentDate = new Date(schedule.lastSent);
        if (lastSentDate.toDateString() === now.toDateString()) {
          return false; // Already sent today
        }
      }

      return true;
    }

    return false;
  });
}

export function getScheduleCount(): number {
  return schedules.length;
}
