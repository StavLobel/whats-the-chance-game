# 🚀 Firebase Production Setup Guide

## 🔧 **Step 1: Enable Billing (In Progress)**

### **What You Need to Do:**

1. **In the browser that opened:**
   - Click "Enable Billing"
   - Select or create a billing account
   - Add a payment method
   - Complete the setup

2. **Wait 2-3 minutes** for propagation

### **Why Billing is Required:**

- Google requires billing account on file (even for free tier)
- **You won't be charged** unless you exceed free limits
- Standard for all Google Cloud services

## 🔧 **Step 2: Create Firestore Database**

After billing is enabled, run:

```bash
gcloud firestore databases create --location=us-central1
```

## 🔧 **Step 3: Deploy Firestore Indexes**

```bash
firebase deploy --only firestore:indexes
```

## 🔧 **Step 4: Enable Authentication**

### **Visit Firebase Console:**

https://console.firebase.google.com/project/whats-the-chance-game/authentication

### **Steps:**

1. Click "Get started"
2. Enable "Email/Password" authentication
3. Add your domain to authorized domains (optional for development)

## 🔧 **Step 5: Generate Service Account Key**

### **Visit Service Accounts:**

https://console.firebase.google.com/project/whats-the-chance-game/settings/serviceaccounts/adminsdk

### **Steps:**

1. Click "Generate new private key"
2. Download the JSON file
3. Extract values and update `backend/.env`

### **Example backend/.env:**

```env
FIREBASE_PROJECT_ID=whats-the-chance-game
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@whats-the-chance-game.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40whats-the-chance-game.iam.gserviceaccount.com
```

## 🔧 **Step 6: Test the Setup**

### **Test Frontend:**

```bash
npm run dev
```

- Open browser and check console for Firebase connection
- Should see no Firebase errors

### **Test Backend:**

```bash
cd backend
python -m pytest tests/unit/test_firebase_service.py -v
```

- Should pass all Firebase service tests

### **Test Authentication:**

- Try to sign up/sign in through the frontend
- Check Firestore for user document creation

## 📊 **Firebase Free Tier Limits**

### **What's Included:**

- **Firestore Database**: 1GB storage, 50,000 reads/day, 20,000 writes/day
- **Authentication**: Unlimited users
- **Hosting**: 10GB storage, 360MB/day bandwidth

### **For Your Game:**

- **Conservative estimate**: 100 users/day = 2% of free limits
- **Aggressive estimate**: 1,000 users/day = 40% of free limits
- **You likely won't exceed free limits**

### **Cost if You Exceed:**

- **Reads**: $0.06 per 100,000 reads
- **Writes**: $0.18 per 100,000 writes
- **Storage**: $0.18 per GB/month

## 🔗 **Useful Links**

- **Firebase Console**: https://console.firebase.google.com/project/whats-the-chance-game
- **Firestore Console**: https://console.firebase.google.com/project/whats-the-chance-game/firestore
- **Authentication Console**: https://console.firebase.google.com/project/whats-the-chance-game/authentication
- **Project Settings**: https://console.firebase.google.com/project/whats-the-chance-game/settings
- **Billing Setup**: https://console.developers.google.com/billing/enable?project=whats-the-chance-game

## 🎯 **Current Status**

- ✅ **Firebase Project**: Created and configured
- ✅ **APIs**: Enabled (Firestore, Firebase)
- ⏳ **Billing**: In progress (you're setting this up now)
- ⏳ **Database**: Will create after billing
- ⏳ **Authentication**: Will enable after database
- ⏳ **Service Account**: Will generate after setup

## 🚀 **Next Steps**

1. **Complete billing setup** (in browser)
2. **Wait 2-3 minutes** for propagation
3. **Run the commands above** to complete setup
4. **Test everything** to ensure it's working

---

**Once billing is enabled, we can complete the entire setup in just a few commands!** 🎉
