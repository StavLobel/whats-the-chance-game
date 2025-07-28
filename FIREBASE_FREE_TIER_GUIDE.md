# 🔥 Firebase Free Tier Guide - "What's the Chance?" Game

## 💰 **Firebase Pricing - What's Actually Free**

### ✅ **Firebase Spark Plan (Free Forever)**

- **Firestore Database**: 1GB storage, 50,000 reads/day, 20,000 writes/day
- **Authentication**: Unlimited users
- **Hosting**: 10GB storage, 360MB/day bandwidth
- **Cloud Functions**: 2 million invocations/month
- **Cloud Storage**: 5GB storage, 1GB/day bandwidth

### 🎯 **For Your Game - Free Tier is Perfect!**

- **User Authentication**: ✅ Unlimited users
- **Challenge Storage**: ✅ ~10,000 challenges (1GB limit)
- **Game History**: ✅ ~100,000 game sessions
- **User Statistics**: ✅ ~50,000 user profiles
- **Real-time Updates**: ✅ Included in reads/writes

## 🚀 **Option 1: Firebase Emulators (100% Free, No Billing)**

### **Perfect for Development & Testing**

```bash
# Start Firebase emulators
firebase emulators:start --only firestore,auth

# Your app will connect to local emulators automatically
npm run dev
```

### **Benefits:**

- ✅ **No billing setup required**
- ✅ **Unlimited usage**
- ✅ **Perfect for development**
- ✅ **Can be used for small production apps**
- ✅ **Real Firebase API, just local**

### **Configuration:**

Your app is already configured to use emulators in development mode:

```typescript
// src/lib/firebase.ts
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 🌐 **Option 2: Firebase Free Tier (Requires Billing Setup)**

### **Why Billing Setup is Required:**

- Google requires a billing account on file (even for free tier)
- **You won't be charged** unless you exceed free limits
- This is standard for all Google Cloud services

### **Free Tier Limits for Your Game:**

- **50,000 reads/day**: ~1,667 users playing 30 times/day
- **20,000 writes/day**: ~667 users creating 30 challenges/day
- **1GB storage**: ~10,000 challenges with full data

### **Cost if You Exceed Limits:**

- **Reads**: $0.06 per 100,000 reads
- **Writes**: $0.18 per 100,000 writes
- **Storage**: $0.18 per GB/month

## 🎯 **Recommendation: Start with Emulators**

### **Development Phase:**

1. **Use Firebase Emulators** (100% free, no setup)
2. **Test all features locally**
3. **Perfect for development and testing**

### **Production Phase:**

1. **Enable billing** (required for production)
2. **Use Firebase free tier** (generous limits)
3. **Monitor usage** (unlikely to exceed free limits)

## 🔧 **Quick Setup - Emulators Only**

### **1. Start Emulators**

```bash
firebase emulators:start --only firestore,auth
```

### **2. Run Your App**

```bash
npm run dev
```

### **3. Test Everything**

- User registration/login
- Challenge creation
- Game mechanics
- Real-time updates

## 📊 **Usage Estimation for Your Game**

### **Conservative Estimate (Free Tier):**

- **100 active users/day**
- **Each user plays 10 games/day**
- **Total reads**: 1,000/day (2% of free limit)
- **Total writes**: 500/day (2.5% of free limit)
- **Storage**: ~50MB (5% of free limit)

### **Aggressive Estimate (Still Free):**

- **1,000 active users/day**
- **Each user plays 20 games/day**
- **Total reads**: 20,000/day (40% of free limit)
- **Total writes**: 10,000/day (50% of free limit)
- **Storage**: ~500MB (50% of free limit)

## 🚀 **Next Steps**

### **For Development (Recommended):**

1. ✅ **Emulators are already running**
2. ✅ **Your app is configured for emulators**
3. ✅ **Start developing immediately**
4. ✅ **No billing setup needed**

### **For Production (When Ready):**

1. Enable billing (required but free)
2. Create Firestore database
3. Deploy to production
4. Monitor usage (likely to stay within free limits)

## 💡 **Bottom Line**

**You can develop and test your entire game for FREE using Firebase emulators!**

- ✅ **No billing setup required**
- ✅ **Unlimited usage during development**
- ✅ **Real Firebase API**
- ✅ **Perfect for your game's scale**

**Start developing now with emulators, and only set up billing when you're ready for production!** 🎉

---

**Current Status**: Firebase emulators are running and ready for development!
