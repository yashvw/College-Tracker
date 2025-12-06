# Upstash QStash Setup Guide - Free Scheduled Notifications

## 🎉 Why QStash?

QStash is perfect for your College Tracker because:
- ✅ **500 requests/day FREE** (no credit card needed!)
- ✅ Schedule notifications with any delay (1 min to days)
- ✅ Works on Vercel Hobby plan
- ✅ Reliable background delivery
- ✅ No Vercel Pro subscription needed

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Free Upstash Account

1. **Go to:** https://console.upstash.com
2. **Click "Sign Up"** (or "Get Started")
3. **Sign up with:**
   - GitHub (recommended - instant)
   - Google
   - Email

4. **No credit card required!** ✅

---

### Step 2: Create QStash Database

1. After signing in, you'll see the Upstash Console
2. **Click "QStash"** in the left sidebar
3. You'll see a message: "QStash is ready to use"
4. That's it! QStash is automatically enabled for free accounts

---

### Step 3: Get Your API Keys

1. In the **QStash** section, you'll see:
   - **QSTASH_TOKEN** (API token)
   - **QSTASH_CURRENT_SIGNING_KEY** (for webhook verification)
   - **QSTASH_NEXT_SIGNING_KEY** (for webhook verification)

2. **Click the copy icon** next to each one

3. You'll need all three for full security (or just QSTASH_TOKEN for basic setup)

---

### Step 4: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard:** https://vercel.com
2. **Open your project:** College-Tracker
3. **Settings → Environment Variables**
4. **Add these variables:**

**Required:**
```
QSTASH_TOKEN=eyJxxxxxxxxxxxxxxxxxxxxxxx
```

**Optional (for security):**
```
QSTASH_CURRENT_SIGNING_KEY=sig_xxxxxxxxxxxxxx
QSTASH_NEXT_SIGNING_KEY=sig_xxxxxxxxxxxxxx
```

5. **Check all environments:** Production, Preview, Development
6. **Click "Save"** for each

---

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait ~2 minutes for deployment to complete

---

## ✅ **Verify It's Working**

### Test 1: Check Configuration

Visit: `https://your-app.vercel.app/api/notifications/qstash-webhook`

Should show:
```json
{
  "message": "QStash webhook endpoint is ready",
  "configured": true,
  "signatureVerification": true
}
```

### Test 2: Schedule a Notification

1. Open your app on your phone
2. Go to Settings (gear icon)
3. Enable notifications (if not already)
4. Select "1 minute" from dropdown
5. Tap "Schedule"
6. Close the app
7. Wait 1 minute
8. 📱 Notification appears!

---

## 🔑 **Environment Variables Summary**

You need **7 environment variables total** on Vercel:

### Push Notifications (Already set):
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDQq...
VAPID_PRIVATE_KEY=Ohuy...
VAPID_SUBJECT=mailto:yashvw25@gmail.com
```

### QStash (New - from Upstash Console):
```env
QSTASH_TOKEN=eyJxxxxxxx...
QSTASH_CURRENT_SIGNING_KEY=sig_xxxxx...
QSTASH_NEXT_SIGNING_KEY=sig_xxxxx...
```

### Optional (for cron security - can skip):
```env
CRON_SECRET=your-random-secret
```

---

## 📊 **How QStash Works**

### Architecture:

```
┌─────────────────────┐
│  Your App (User)    │
│  Clicks "Schedule"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  POST /api/notifications/           │
│       schedule-qstash               │
│  - Receives: subscription + delay   │
│  - Calls QStash API                 │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Upstash QStash Service             │
│  - Stores the scheduled task        │
│  - Waits for the specified delay    │
│  - Runs on Upstash servers (not     │
│    your Vercel function)            │
└──────────┬──────────────────────────┘
           │
           │ (After delay)
           ▼
┌─────────────────────────────────────┐
│  POST /api/notifications/           │
│       qstash-webhook                │
│  - Receives notification data       │
│  - Sends push notification          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  📱 User's Device                   │
│  Notification appears!              │
└─────────────────────────────────────┘
```

### The Flow:

1. **User schedules:** "Send notification in 5 minutes"
2. **Your API calls QStash:** `qstash.publishJSON({ delay: 300 })`
3. **QStash stores it:** On their servers (not yours!)
4. **QStash waits:** 5 minutes (on their infrastructure)
5. **QStash calls your webhook:** POST to `/api/notifications/qstash-webhook`
6. **Your webhook sends push:** Using web-push
7. **User receives notification:** Even if app is closed!

---

## 🆓 **Free Tier Limits**

### QStash Free Plan:
- **500 messages/day** (plenty for personal use!)
- **10 messages/second** rate limit
- **7 days message retention**
- **3 retries** per message
- **No credit card required**

### What This Means:
- 500 scheduled notifications per day
- Perfect for class schedules (maybe 5-10 per day)
- More than enough for testing
- If you exceed, just upgrade (still cheap)

---

## 🔐 **Security (Webhook Verification)**

QStash signs all webhook requests. Your code verifies them:

```typescript
// Automatic signature verification
export const POST = verifySignatureAppRouter(handler);
```

**What this prevents:**
- ❌ Unauthorized webhook calls
- ❌ Fake notifications
- ❌ Replay attacks

**Requires:**
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`

**Optional:** If you skip these keys, webhooks will work but won't be verified (less secure).

---

## 📱 **Testing Schedule**

### Quick Tests:

**1 minute test:**
```
Schedule → Wait 60 seconds → Notification arrives
```

**2 minute test:**
```
Schedule → Close app → Wait 2 minutes → Notification arrives
```

**5 minute test:**
```
Schedule → Lock phone → Wait 5 minutes → Notification on lock screen
```

**Multiple schedules:**
```
Schedule 3 notifications (1min, 2min, 5min)
Close app
All 3 arrive at their scheduled times!
```

---

## 🎯 **Use Cases**

### 1. Test Feature (Current):
- Schedule for 1-30 minutes
- Test background notifications
- Verify push system works

### 2. Class Reminders (Future):
- Daily: "Math class in 15 minutes"
- Weekly: "Lab session tomorrow"
- Custom: Per your timetable

### 3. Habit Reminders (Future):
- Daily: "Morning run reminder - 7 AM"
- Weekly: "Review notes every Sunday"

### 4. Task Deadlines (Future):
- "Assignment due in 2 days"
- "Exam tomorrow at 10 AM"

---

## 🐛 **Troubleshooting**

### "QStash not configured" Error

**Solution:**
1. Make sure you added `QSTASH_TOKEN` to Vercel
2. Redeploy your app
3. Check spelling (case-sensitive!)
4. Verify token from Upstash Console

### "Failed to schedule notification"

**Check:**
1. QSTASH_TOKEN is set correctly
2. Vercel deployment succeeded
3. HTTPS is enabled (Vercel does this automatically)
4. Check Vercel function logs

### Notification Not Arriving

**Check:**
1. Wait the full delay time (QStash is accurate)
2. Check Upstash Console → QStash → Messages (see delivery status)
3. Check Vercel logs for webhook calls
4. Verify your subscription is valid

---

## 📊 **Monitoring**

### Upstash Console:

1. Go to: https://console.upstash.com
2. Click **"QStash"**
3. Click **"Messages"** tab
4. You'll see:
   - Pending messages (waiting to be sent)
   - Delivered messages (successfully sent)
   - Failed messages (with error details)

### Vercel Logs:

1. Vercel Dashboard → Your Project
2. Click **"Deployments"**
3. Click **"Functions"** tab
4. Find `/api/notifications/qstash-webhook`
5. See when QStash called your webhook

---

## 💰 **Pricing Comparison**

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Upstash QStash** | 500 msg/day | $0.60 per 100K |
| **Vercel Cron (Pro)** | N/A | $20/month |
| **AWS EventBridge** | 1M free/month | $1 per 1M |
| **Firebase Cloud Tasks** | None | $0.40 per 1M |

**Upstash is the best free option!**

---

## 🚀 **What You Get**

### Before (setTimeout):
```
Schedule → setTimeout → ❌ Function dies → Never sent
```

### After (QStash):
```
Schedule → QStash stores it → QStash waits → QStash calls webhook → ✅ Sent
```

### Key Differences:
- ✅ Runs on Upstash servers (not Vercel)
- ✅ Survives function termination
- ✅ Actually works in production
- ✅ Free and reliable

---

## 📝 **Next Steps**

1. ✅ Create Upstash account (https://console.upstash.com)
2. ✅ Copy QSTASH_TOKEN
3. ✅ Add to Vercel environment variables
4. ✅ Redeploy
5. ✅ Test scheduling
6. ✅ See notifications arrive!

---

## 🎓 **Understanding the Difference**

### Why setTimeout Doesn't Work:

```javascript
// In serverless function
setTimeout(() => {
  console.log('Hello')  // ❌ Never runs
}, 60000)

return Response.json({ scheduled: true })
// Function terminates here ☠️
// setTimeout is destroyed!
```

### Why QStash Works:

```javascript
// In serverless function
await qstash.publishJSON({
  url: 'my-webhook',
  delay: 60
})
// ✅ QStash stores this on THEIR servers

return Response.json({ scheduled: true })
// Function terminates ☠️
// But QStash is still running on Upstash servers!

// 60 seconds later...
// QStash calls your webhook ✅
// Notification sent! ✅
```

---

## 🎉 **Summary**

**QStash solves the serverless scheduling problem by:**
1. Running on external servers (Upstash)
2. Storing scheduled tasks persistently
3. Calling your webhook at the right time
4. Working independently of your Vercel functions

**It's like having a dedicated cron server, but free!**

---

**Ready to set it up?** Go to https://console.upstash.com and create your free account! 🚀
