# Push Notifications for PWA - Complete Setup Guide

## What's Already Done ✅

Your College Tracker PWA now has **full push notification support**:

1. ✅ Web-push library installed
2. ✅ VAPID keys generated and configured
3. ✅ API endpoints for subscribing and sending notifications
4. ✅ Service worker configured to handle push events
5. ✅ Client-side notification subscription flow
6. ✅ Manifest configured with notification permissions

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| **Android (Chrome)** | ✅ Full Support | All push notification features work |
| **Android (Firefox)** | ✅ Full Support | All features work |
| **Android (Edge)** | ✅ Full Support | All features work |
| **iOS Safari 16.4+** | ⚠️ Limited | Only works when app is added to home screen |
| **iOS Safari <16.4** | ❌ Not Supported | No push notification support |
| **Desktop Chrome** | ✅ Full Support | Works in browser |
| **Desktop Firefox** | ✅ Full Support | Works in browser |
| **Desktop Safari** | ⚠️ Limited | macOS 13+ (Ventura) only |

## How to Enable Notifications

### For Android Users:

1. **Install the PWA:**
   - Open the app in Chrome/Firefox/Edge
   - Tap the menu (⋮) → "Add to Home screen" or "Install app"
   - Tap "Add" or "Install"

2. **Enable Notifications:**
   - Open the installed PWA from your home screen
   - Tap the bell icon or settings
   - Tap "Enable Notifications"
   - Allow notifications when prompted
   - ✅ You're done! You'll now receive push notifications

### For iOS Users (iOS 16.4+):

1. **Install the PWA:**
   - Open the app in Safari
   - Tap the Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add"

2. **Enable Notifications:**
   - Open the installed PWA from your home screen (NOT Safari!)
   - Tap the bell icon or settings
   - Tap "Enable Notifications"
   - Allow notifications when prompted
   - ✅ You'll receive notifications (only when app is on home screen)

3. **Important iOS Notes:**
   - ❗ Notifications only work if opened from home screen
   - ❗ Won't work if opened in Safari browser
   - ❗ Requires iOS 16.4 or later
   - ❗ App must be installed as PWA first

## Testing Notifications

### Method 1: Quick Test via Browser Console

1. Open your app in a browser
2. Enable notifications via the UI
3. Open DevTools Console (F12)
4. Run this command:

```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Notification',
    body: 'This is a test push notification from your College Tracker!',
    tag: 'test',
    requireInteraction: false,
    data: { url: '/' }
  })
})
.then(r => r.json())
.then(data => console.log('Result:', data))
```

### Method 2: Test via cURL

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Class Reminder",
    "body": "Your Physics class starts in 15 minutes",
    "tag": "class-physics",
    "requireInteraction": true,
    "data": {
      "subject": "Physics",
      "time": "2:00 PM"
    }
  }'
```

### Method 3: Test on Live Production

Replace `localhost:3000` with your production URL:

```bash
curl -X POST https://your-app.vercel.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "Testing push notifications on production!",
    "tag": "test"
  }'
```

## How It Works

### Architecture

```
┌─────────────┐
│   Device    │
│  (Android/  │
│    iOS)     │
└──────┬──────┘
       │ 1. User enables notifications
       ▼
┌─────────────────────────────┐
│  Browser / PWA              │
│  - Requests permission      │
│  - Subscribes to push       │
│  - Sends subscription to    │
│    your server              │
└──────┬──────────────────────┘
       │ 2. Subscription saved
       ▼
┌─────────────────────────────┐
│  Your Server                │
│  /api/notifications/        │
│  subscribe                  │
│  - Stores subscription      │
└──────┬──────────────────────┘
       │
       │ 3. Later: Send notification
       ▼
┌─────────────────────────────┐
│  Your Server                │
│  /api/notifications/send    │
│  - Sends push to all        │
│    subscribers via web-push │
└──────┬──────────────────────┘
       │ 4. Push delivered
       ▼
┌─────────────────────────────┐
│  Push Service (FCM/APNs)    │
│  - Google (Android)         │
│  - Apple (iOS)              │
└──────┬──────────────────────┘
       │ 5. Notification shown
       ▼
┌─────────────┐
│   Device    │
│  Shows      │
│  Notification│
└─────────────┘
```

### What Happens When You Send a Notification

1. **Server Side:**
   - You call `/api/notifications/send` with notification data
   - Server uses `web-push` library to send to all subscribers
   - VAPID keys authenticate your server

2. **Push Service:**
   - Google FCM (Android) or Apple APNs (iOS) receives the push
   - Delivers to the user's device

3. **Device:**
   - Service worker (`public/sw.js`) receives the push event
   - Displays notification via `showNotification()`

4. **User Interaction:**
   - User taps notification
   - Service worker handles click event
   - Opens app to specific page (e.g., `/attendance/mark`)

## Sending Notifications from Your Code

### Example: Send Attendance Reminder

```typescript
// In your scheduled notification logic
async function sendAttendanceReminder(subject: string, time: string) {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Class Reminder',
        body: `${subject} class at ${time}`,
        tag: `class-${subject}`,
        requireInteraction: true,
        data: {
          subject: subject,
          time: time,
          url: `/attendance/mark?subject=${encodeURIComponent(subject)}`
        }
      })
    });

    const result = await response.json();
    console.log(`Sent to ${result.sent} devices`);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
```

### Example: Send Habit Reminder

```typescript
async function sendHabitReminder(habitName: string) {
  await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Habit Reminder',
      body: `Don't forget to complete: ${habitName}`,
      tag: 'habit-reminder',
      data: { url: '/?page=habits' }
    })
  });
}
```

## Environment Variables

Your `.env.local` file should contain:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDQqYkCyqVQOxKFycDN53_xasCqV40G53uqYmhdU0fegXHRV5Mcpavunqz0bIyZOZ1CHN9YJ3XhtcQZLdamravo
VAPID_PRIVATE_KEY=OhuyFYeiHizPdxtgCdpW03fiD4mMA9wv1-IlwyvyIqI
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important:**
- ✅ `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Can be exposed to client
- ❌ `VAPID_PRIVATE_KEY` - Keep secret! Never expose to client
- 📧 `VAPID_SUBJECT` - Your contact email (used by push services)

## Deploying to Production

### Vercel (Recommended)

1. **Add Environment Variables:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add all three VAPID variables
   - Redeploy your app

2. **Update Your Domain:**
   - If using custom domain, VAPID keys must match
   - Don't regenerate keys after users subscribe

3. **HTTPS Required:**
   - Vercel provides HTTPS by default
   - Service workers require HTTPS (except localhost)

### Other Platforms

Same process - just add the environment variables to your platform's settings.

## Troubleshooting

### Notifications Not Appearing

**Android:**
- ✅ Check if app is installed as PWA (not just a website shortcut)
- ✅ Check notification permissions in Android Settings → Apps → College Tracker
- ✅ Ensure "Do Not Disturb" is off
- ✅ Check if battery optimization is blocking notifications

**iOS:**
- ✅ Ensure iOS 16.4 or later
- ✅ App must be opened from home screen icon
- ✅ Check Settings → Notifications → College Tracker
- ✅ Try removing and re-adding to home screen

**All Platforms:**
- ✅ Check browser console for errors
- ✅ Verify VAPID keys are set correctly
- ✅ Test with `/api/notifications/send` endpoint
- ✅ Check service worker is registered (DevTools → Application → Service Workers)

### "No subscriptions found" Error

This means no devices have subscribed yet:
1. Open the app on your device
2. Click "Enable Notifications"
3. Allow notifications when prompted
4. Check `/api/notifications/subscribe` GET endpoint to verify

### VAPID Errors

```
Error: No valid VAPID keys found
```

**Solution:** Check your `.env.local` file exists and has all three variables.

## Database Integration (Optional)

Currently, subscriptions are stored in memory and cleared on server restart. For production, replace the in-memory store with a database:

### Using Prisma (Example)

1. Install Prisma:
```bash
npm install @prisma/client
npx prisma init
```

2. Add schema:
```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  endpoint  String   @unique
  auth      String
  p256dh    String
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

3. Update `app/api/notifications/subscribe/route.ts`:
```typescript
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const subscription = await request.json();

  await prisma.pushSubscription.upsert({
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

## Security Best Practices

1. ✅ **Never expose private VAPID key** - Only on server
2. ✅ **Validate notification content** - Prevent XSS
3. ✅ **Rate limit notification sends** - Prevent spam
4. ✅ **Remove invalid subscriptions** - Clean up 410 errors
5. ✅ **Use HTTPS in production** - Required for service workers
6. ✅ **Don't send sensitive data** - Notifications are visible

## Next Steps

1. ✅ Deploy your app to production (Vercel, Netlify, etc.)
2. ✅ Add environment variables to your hosting platform
3. ✅ Install the PWA on your phone
4. ✅ Enable notifications
5. ✅ Test sending notifications
6. ✅ Integrate with your scheduled notification system
7. ✅ (Optional) Set up a database for persistent storage

## Resources

- [Web Push API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push Library](https://github.com/web-push-libs/web-push)
- [iOS Web Push Support](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)

---

🎉 **Your PWA now has full push notification support!** Install it on your phone and start receiving notifications.
