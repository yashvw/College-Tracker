# QStash Quick Start - Get Scheduled Notifications Working in 5 Minutes

## 🎯 What You're Setting Up

**Free scheduled notifications** that work even when your app is closed!

---

## 🚀 Step-by-Step Setup

### 1️⃣ Create Upstash Account (1 minute)

1. **Go to:** https://console.upstash.com
2. **Click "Sign Up"**
3. **Choose:** Sign up with GitHub (fastest) or Google
4. ✅ **No credit card required!**

---

### 2️⃣ Get Your QStash Token (1 minute)

After signing in:

1. **Look at the left sidebar** → Click **"QStash"**
2. You'll see a page that says **"QStash"** at the top
3. **Scroll down** to find:

```
┌─────────────────────────────────────┐
│ REST API                            │
│                                     │
│ QSTASH_URL                          │
│ https://qstash.upstash.io          │
│ [Copy]                              │
│                                     │
│ QSTASH_TOKEN                        │
│ eyJxxxxxxxxxxxxxxxxxx...            │
│ [Copy]                          ← COPY THIS!
│                                     │
│ QSTASH_CURRENT_SIGNING_KEY          │
│ sig_xxxxxxxxxxxxxx...               │
│ [Copy]                          ← COPY THIS!
│                                     │
│ QSTASH_NEXT_SIGNING_KEY             │
│ sig_xxxxxxxxxxxxxx...               │
│ [Copy]                          ← COPY THIS!
└─────────────────────────────────────┘
```

4. **Copy all three** (click the copy icon next to each)

---

### 3️⃣ Add to Vercel (2 minutes)

1. **Go to:** https://vercel.com
2. **Open your project:** College-Tracker
3. **Click:** Settings → Environment Variables
4. **Add these three variables:**

**Variable 1:**
- Name: `QSTASH_TOKEN`
- Value: (paste the long token starting with `eyJ...`)
- Environment: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

**Variable 2:**
- Name: `QSTASH_CURRENT_SIGNING_KEY`
- Value: (paste the key starting with `sig_...`)
- Environment: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

**Variable 3:**
- Name: `QSTASH_NEXT_SIGNING_KEY`
- Value: (paste the other key starting with `sig_...`)
- Environment: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

---

### 4️⃣ Redeploy (1 minute)

1. **Go to:** Deployments tab
2. **Click:** the **"..."** menu on latest deployment
3. **Click:** "Redeploy"
4. **Wait:** ~2 minutes for deployment to complete

---

### 5️⃣ Test It! (30 seconds)

1. **Open your app** on your phone (from home screen if PWA)
2. **Tap Settings** (gear icon)
3. **Enable notifications** (if not already enabled)
4. **Select "1 minute"** from dropdown
5. **Tap "Schedule"**
6. **Close the app completely**
7. **Wait 1 minute**
8. 📱 **Notification appears!** 🎉

---

## ✅ **Verification Checklist**

Before testing, make sure:

- [ ] Upstash account created
- [ ] QSTASH_TOKEN copied from Upstash Console
- [ ] QSTASH_CURRENT_SIGNING_KEY copied
- [ ] QSTASH_NEXT_SIGNING_KEY copied
- [ ] All 3 added to Vercel environment variables
- [ ] App redeployed
- [ ] VAPID keys still set (from before)
- [ ] Notifications enabled on your device

---

## 🎯 **What Happens**

### The Flow:

```
1. You click "Schedule" (1 minute)
   ↓
2. Your app calls: /api/notifications/schedule-qstash
   ↓
3. Your API calls Upstash: "Send notification in 60 seconds"
   ↓
4. Upstash stores it on THEIR servers
   ↓
5. You close your app
   ↓
6. 60 seconds later...
   ↓
7. Upstash calls your webhook: /api/notifications/qstash-webhook
   ↓
8. Your webhook sends push notification
   ↓
9. 📱 You see the notification!
```

---

## 🐛 **Troubleshooting**

### "QStash not configured" Error

**Check:**
1. Is `QSTASH_TOKEN` set in Vercel?
2. Did you redeploy after adding it?
3. Is it spelled correctly? (case-sensitive!)

**Fix:**
- Go to Vercel → Settings → Environment Variables
- Verify QSTASH_TOKEN exists
- Redeploy

---

### No Notification After 1 Minute

**Check Upstash Console:**
1. Go to https://console.upstash.com
2. Click "QStash" → "Messages"
3. Look for your scheduled message
4. Check status: Pending, Delivered, or Failed

**If Failed:**
- Click on the message to see error details
- Common issue: Webhook URL incorrect
- Solution: Verify your Vercel URL is correct

**Check Vercel Logs:**
1. Vercel Dashboard → Deployments
2. Click latest deployment → Functions
3. Find `/api/notifications/qstash-webhook`
4. Should show it was called by QStash

---

### "Invalid signature" Error

**This means:**
- QStash signing keys are wrong

**Fix:**
1. Copy QSTASH_CURRENT_SIGNING_KEY again from Upstash
2. Copy QSTASH_NEXT_SIGNING_KEY again from Upstash
3. Update in Vercel
4. Redeploy

---

## 📊 **Monitoring**

### See All Scheduled Messages:

1. **Upstash Console** → QStash → Messages
2. You'll see:
   - ⏳ Pending: Waiting to be sent
   - ✅ Delivered: Successfully sent
   - ❌ Failed: Error details shown

### Check Delivery:

Each message shows:
- Scheduled time
- Delivery time
- Status
- Retry attempts
- Error messages (if any)

---

## 💡 **Pro Tips**

1. **Start with 1 minute** - Quick feedback
2. **Check Upstash Console** - See real-time status
3. **Close the app** - Tests background delivery
4. **Check phone settings** - Allow notifications
5. **Install as PWA** - Best experience

---

## 🎉 **You're Done!**

After setup:
- ✅ Schedule notifications from Settings
- ✅ Choose delay (1-30 minutes)
- ✅ Close the app
- ✅ Receive notifications automatically
- ✅ 500 free notifications per day
- ✅ Works forever (no credit card!)

---

## 🔗 **Useful Links**

- **Upstash Console:** https://console.upstash.com
- **QStash Docs:** https://upstash.com/docs/qstash
- **Your Vercel Project:** https://vercel.com/dashboard

---

**Any questions? Check `UPSTASH_SETUP.md` for detailed documentation!**
