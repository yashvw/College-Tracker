# How to Install College Tracker as PWA and Enable Push Notifications

## ✨ What You Get

When you install College Tracker as a PWA (Progressive Web App):
- 📱 **App-like experience** - Looks and feels like a native app
- 🔔 **Real push notifications** - Get notified even when app is closed
- 📴 **Works offline** - Access your data without internet
- 🚀 **Fast loading** - Instant app launch from home screen
- 💾 **Less storage** - Smaller than native apps

---

## 📱 Installation Guide

### For Android (Chrome/Edge/Firefox)

#### Step 1: Open the App
1. Open Chrome browser on your Android phone
2. Go to your College Tracker URL (e.g., `https://your-app.vercel.app`)

#### Step 2: Install
**Method 1 - Install Prompt:**
- Wait for the "Add to Home Screen" banner at the bottom
- Tap **"Install"** or **"Add"**

**Method 2 - Manual:**
- Tap the menu (⋮) in the top-right corner
- Select **"Add to Home screen"** or **"Install app"**
- Tap **"Add"** or **"Install"**

#### Step 3: Open from Home Screen
- Go to your home screen
- Find the "College Tracker" icon
- Tap to open (it will open in full-screen mode)

#### Step 4: Enable Notifications
1. Once the app is open, look for the bell icon in the header
2. Tap **"Enable"** button
3. When browser asks for permission, tap **"Allow"**
4. You'll see a **"Test"** button appear
5. Tap **"Test"** to send yourself a test notification
6. Check your notification panel - you should see it!

✅ **Done!** You'll now receive:
- Class reminders
- Task deadlines
- Habit reminders
- All notifications even when the app is closed!

---

### For iOS (Safari 16.4+)

#### Requirements
- ⚠️ iOS 16.4 or later
- ⚠️ Must use Safari browser
- ⚠️ Must be added to home screen (push notifications don't work in Safari browser)

#### Step 1: Open in Safari
1. Open **Safari** on your iPhone/iPad
2. Go to your College Tracker URL

#### Step 2: Add to Home Screen
1. Tap the **Share button** (square with arrow pointing up)
2. Scroll down and tap **"Add to Home Screen"**
3. Edit the name if you want (default: "College Tracker")
4. Tap **"Add"**

#### Step 3: Open from Home Screen
- ⚠️ **IMPORTANT:** You MUST open the app from the home screen icon
- Opening in Safari browser won't work for notifications
- Go to your home screen
- Tap the "College Tracker" icon

#### Step 4: Enable Notifications
1. Look for the bell icon in the header
2. Tap **"Enable"** button
3. When iOS asks for permission, tap **"Allow"**
4. You'll see a **"Test"** button appear
5. Tap **"Test"** to send yourself a test notification
6. **Lock your phone** or switch to another app
7. You should see the notification appear!

✅ **Done!** Notifications will work when:
- App is open from home screen
- App is in background
- App is completely closed
- Phone is locked

---

## 🔧 Troubleshooting

### Notifications Not Working on Android

**Check Notification Permissions:**
1. Go to **Settings** → **Apps** → **College Tracker**
2. Tap **Notifications**
3. Make sure **"Allow notifications"** is ON
4. Make sure **"Show notifications"** is ON

**Check Do Not Disturb:**
1. Swipe down from top to see Quick Settings
2. Make sure **"Do Not Disturb"** is OFF

**Check Battery Optimization:**
1. Go to **Settings** → **Apps** → **College Tracker**
2. Tap **Battery**
3. Select **"Unrestricted"** or disable battery optimization

**Reinstall the App:**
1. Long-press the app icon → **App info** → **Uninstall**
2. Reinstall using the steps above
3. Enable notifications again

---

### Notifications Not Working on iOS

**Verify iOS Version:**
1. Go to **Settings** → **General** → **About**
2. Check **"iOS Version"** - must be 16.4 or higher
3. If lower, update iOS first

**Check Notification Permissions:**
1. Go to **Settings** → **Notifications**
2. Find **"College Tracker"**
3. Make sure **"Allow Notifications"** is ON
4. Make sure **"Lock Screen"** and **"Notification Center"** are checked

**Must Open from Home Screen:**
1. ⚠️ Opening in Safari browser won't work
2. You MUST use the home screen icon
3. Try removing and re-adding to home screen

**Check Focus Modes:**
1. Go to **Settings** → **Focus**
2. Make sure College Tracker is allowed in your active Focus mode

**Clear Safari Data (Last Resort):**
1. Go to **Settings** → **Safari**
2. Tap **"Clear History and Website Data"**
3. Reinstall the PWA
4. Enable notifications again

---

### "Test" Button Not Appearing

This means notifications weren't enabled successfully:

1. **Check browser console:**
   - Open the app
   - Look for error messages in DevTools console

2. **Try in different browser:**
   - Android: Try Chrome, Edge, or Firefox
   - iOS: Must use Safari

3. **Check HTTPS:**
   - Make sure your URL starts with `https://`
   - PWAs require HTTPS (except localhost)

4. **Reinstall:**
   - Remove the app from home screen
   - Clear browser cache
   - Reinstall and try again

---

## 🧪 Testing Notifications

### After Installation:

1. ✅ Enable notifications (bell icon)
2. ✅ Tap **"Test"** button
3. ✅ You should see:
   - Toast message: "Test notification sent!"
   - Notification in your device's notification panel
   - Title: "🎉 Test Notification!"
   - Body: Message about push notifications working

4. ✅ **Test with app closed:**
   - Send a test notification
   - Close the app (swipe away)
   - Notification should still appear!

5. ✅ **Test with phone locked:**
   - Send a test notification
   - Lock your phone
   - Notification should appear on lock screen!

---

## 📊 What Notifications You'll Receive

Once set up, you'll automatically get:

1. **Class Reminders** ⏰
   - Before your scheduled classes
   - Customizable timing (before/after class)

2. **Task Deadlines** 📝
   - Exam reminders
   - Assignment due dates
   - Custom reminder days

3. **Habit Reminders** 🎯
   - Daily habit check-ins
   - Streak maintenance alerts

4. **Backup Reminders** 💾
   - Weekly backup suggestions
   - Data export reminders

---

## 🔐 Privacy & Security

- ✅ All notifications are end-to-end encrypted
- ✅ Your data stays on your device (localStorage)
- ✅ Push subscriptions are unique per device
- ✅ No personal data sent with notifications
- ✅ You can disable anytime in Settings

---

## ❓ FAQ

**Q: Do notifications work when the app is closed?**
A: Yes! That's the whole point. They work even when the app is completely closed.

**Q: Do I need an internet connection?**
A: Yes, to receive push notifications. But the app works offline for viewing data.

**Q: Can I use this on desktop?**
A: Yes! Desktop Chrome, Edge, and Firefox support PWA notifications.

**Q: How many devices can I install on?**
A: Unlimited! Each device gets its own push subscription.

**Q: Will this drain my battery?**
A: No. Push notifications are very battery-efficient.

**Q: Can I customize notification sounds?**
A: Sounds are controlled by your device's system notification settings.

**Q: What if I change my phone?**
A: Just install the PWA on your new phone and enable notifications again.

---

## 🆘 Still Having Issues?

If notifications still don't work after trying everything:

1. **Check server logs** (if you have access to Vercel)
2. **Try on a different device** to isolate the issue
3. **Check browser DevTools console** for error messages
4. **Verify VAPID keys** are set correctly in environment variables
5. **Ensure service worker** is registered (check in DevTools → Application → Service Workers)

---

**Need help?** Check the browser console or reach out with:
- Device model and OS version
- Browser name and version
- Error messages from console
- Screenshots of the issue

🎉 **Enjoy your notifications!**
