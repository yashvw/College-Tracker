# Quick Start - Push Notifications

## ✅ What's Been Set Up

Your College Tracker PWA now has **complete push notification support** for iOS and Android!

## 🚀 Quick Start (5 minutes)

### 1. Start Your Dev Server

```bash
npm run dev
```

### 2. Test on Your Computer

1. Open http://localhost:3000
2. Click the bell icon in the header
3. Click "Enable Notifications"
4. Allow notifications when prompted

### 3. Send a Test Notification

Open browser console (F12) and run:

```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test!',
    body: 'Your notifications are working! 🎉',
  })
}).then(r => r.json()).then(console.log)
```

You should see a notification pop up!

## 📱 Test on Mobile Device (Android/iOS)

### For Android:

1. Deploy your app to a public URL (Vercel, Netlify, etc.)
2. Add environment variables on your hosting platform:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (from .env.local)
   - `VAPID_PRIVATE_KEY` (from .env.local)
   - `VAPID_SUBJECT` (from .env.local)
3. Open your deployed app on your Android phone
4. Tap menu → "Add to Home Screen" or "Install app"
5. Open the installed app
6. Tap bell icon → Enable Notifications
7. Send a test notification from your computer

### For iOS (16.4+):

1. Same as Android steps 1-2
2. Open Safari on your iPhone
3. Tap Share → "Add to Home Screen"
4. Open the app from your home screen (NOT Safari)
5. Enable notifications
6. Send a test notification

## 🔧 Configuration

Your `.env.local` already has VAPID keys configured:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDQq...
VAPID_PRIVATE_KEY=Ohuy...
VAPID_SUBJECT=mailto:your-email@example.com
```

**⚠️ Important:** When deploying, add these same variables to your hosting platform's environment settings.

## 📚 Full Documentation

- **Complete Guide:** See `PWA_PUSH_NOTIFICATIONS_GUIDE.md`
- **Platform Support:** Android (full), iOS 16.4+ (when installed as PWA)
- **Testing Component:** Import `<NotificationTest />` from `@/components/notification-test`

## 🎯 Integration Examples

### Send Scheduled Class Reminder

```typescript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Class Reminder',
    body: 'Physics class in 15 minutes',
    data: { subject: 'Physics', time: '2:00 PM' }
  })
})
```

### Send Habit Reminder

```typescript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Habit Reminder',
    body: 'Complete your morning run!',
    data: { url: '/?page=habits' }
  })
})
```

## ✨ Next Steps

1. ✅ Test locally (done above)
2. 🚀 Deploy to production (Vercel/Netlify)
3. 📱 Install PWA on your phone
4. 🔔 Enable notifications
5. 🧪 Send test notifications
6. 🔗 Integrate with your scheduled notification system

---

**Questions?** Check the full guide: `PWA_PUSH_NOTIFICATIONS_GUIDE.md`
