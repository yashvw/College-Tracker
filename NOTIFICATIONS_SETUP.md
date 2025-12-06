# Push Notifications Setup Guide for College Tracker

## Overview
Your College Tracker app now has the infrastructure for push notifications. This guide explains how to set it up completely and send notifications to users.

## What's Already Implemented

### 1. **Service Worker** (`/public/sw.js`)
- Handles incoming push notifications
- Displays notifications in the system notification panel
- Handles notification clicks (opens app or specific pages)

### 2. **Client-Side Notification Library** (`/lib/notifications.ts`)
- `registerServiceWorker()` - Registers the service worker
- `requestNotificationPermission()` - Asks user for permission
- `subscribeToPushNotifications()` - Subscribes to push notifications
- `sendLocalNotification()` - Sends local notifications

### 3. **Hooks** (`/hooks/use-notifications.ts`)
- `useNotifications()` - React hook to manage notification state
- Automatically handles service worker registration and permission status

### 4. **UI Component** (`/components/notification-setup.tsx`)
- `<NotificationSetup />` - Button that appears in the app header
- Users can click to enable notifications
- Shows current permission status

### 5. **API Endpoints**
- `POST /api/notifications/subscribe` - Store user subscriptions
- `POST /api/notifications/send` - Send notifications to users

## Complete Setup Instructions

### Step 1: Generate VAPID Keys (One-time Setup)

You need VAPID keys to enable push notifications. Run this command:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

This will output:
```
Public Key: [long string]
Private Key: [long string]
```

### Step 2: Add Environment Variables

Create or update your `.env.local` file:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

### Step 3: Install Web-Push Library

```bash
npm install web-push
```

### Step 4: Update API to Send Notifications

Replace the content of `app/api/notifications/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:example@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { title, body, tag, subscriptions } = await request.json();

    if (!title || !body || !subscriptions || !Array.isArray(subscriptions)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      tag: tag || 'default',
      icon: '/favicon-192.png',
      badge: '/favicon-192.png',
    });

    const results = await Promise.allSettled(
      subscriptions.map(subscription =>
        webpush.sendNotification(subscription, payload)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: `Sent to ${successful} users, ${failed} failed`,
      results: { successful, failed },
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
```

### Step 5: Update Subscription API

Replace the content of `app/api/notifications/subscribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

// In a real app, use a database like Prisma, MongoDB, etc.
// For now, this is in-memory (will be cleared on restart)
let subscriptions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const exists = subscriptions.some(s => s.endpoint === subscription.endpoint);
    
    if (!exists) {
      subscriptions.push(subscription);
    }

    console.log(`Total subscriptions: ${subscriptions.length}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription stored',
    });
  } catch (error) {
    console.error('Error storing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to store subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // This is for demo purposes only - don't expose all subscriptions in production!
  return NextResponse.json({
    count: subscriptions.length,
    // Don't send actual subscriptions for security
  });
}
```

## Testing Notifications

### Test Local Notifications
Add a button to your page to test local notifications:

```typescript
import { sendLocalNotification } from '@/lib/notifications';

// In your component:
<button
  onClick={() => sendLocalNotification('Test Title', {
    body: 'This is a test notification',
    tag: 'test',
  })}
>
  Test Notification
</button>
```

### Test Push Notifications
Create a test endpoint or use curl:

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test push notification",
    "subscriptions": []
  }'
```

## Common Use Cases

### 1. Reminder for Upcoming Task
```typescript
// Send when a task deadline is approaching
const daysUntil = 2;
await sendLocalNotification(
  'Upcoming Task',
  {
    body: `Your task is due in ${daysUntil} days`,
    tag: `task-${taskId}`,
    requireInteraction: true,
  }
);
```

### 2. Attendance Reminder
```typescript
await sendLocalNotification(
  'Attendance Check-in',
  {
    body: 'Have you marked attendance for today?',
    tag: 'attendance-reminder',
  }
);
```

### 3. Habit Tracker Reminder
```typescript
await sendLocalNotification(
  'Daily Habit',
  {
    body: 'Time to complete your morning run',
    tag: `habit-${habitId}`,
  }
);
```

## Database Integration

For production, store subscriptions in a database:

### Example with Prisma:

1. **Schema (schema.prisma):**
```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  endpoint  String   @unique
  auth      String
  p256dh    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. **API Update:**
```typescript
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const subscription = await request.json();
  
  const stored = await db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { updatedAt: new Date() },
    create: {
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
    },
  });

  return NextResponse.json({ success: true });
}
```

## Security Considerations

1. **Never expose VAPID private key** - Keep it in server-side env variables only
2. **Validate subscriptions** - Check subscription format before storing
3. **Rate limit** - Don't send too many notifications (users will unsubscribe)
4. **Unsubscribe handling** - Remove invalid subscriptions when they fail
5. **Respect permissions** - Always request user permission first

## Browser Support

- ✅ Chrome/Edge 50+
- ✅ Firefox 48+
- ✅ Opera 37+
- ✅ Android browsers
- ⚠️ Safari (limited support, uses local notifications)

## Troubleshooting

### Service Worker not registering?
- Check browser console for errors
- Ensure `/public/sw.js` exists
- Check that HTTPS is enabled (required for service workers in production)

### Notifications not showing?
- Check if permission is granted in browser settings
- Verify notification is being sent to correct endpoint
- Check service worker is active in DevTools

### Can't receive push notifications?
- VAPID keys must be generated and set in env variables
- Subscription endpoint must be valid
- Check web-push library is installed and configured

## Next Steps

1. Add a database to persist subscriptions
2. Create scheduled tasks to send reminder notifications
3. Implement user preferences for notification types
4. Add sounds and vibration patterns to notifications
5. Track notification engagement metrics

For more info, see:
- [Web Push API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push Library](https://github.com/web-push-libs/web-push)
