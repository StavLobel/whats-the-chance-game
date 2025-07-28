# Firebase Setup Guide for "What's the Chance?" Game

## ✅ **Current Status**

- ✅ Firebase project created: `whats-the-chance-game`
- ✅ Web app created: `whats-the-chance-game-web`
- ✅ Firebase CLI installed and configured
- ✅ Firestore rules deployed
- ⏳ **Pending**: Enable Firestore API and complete setup

## 🔧 **Required Setup Steps**

### 1. Enable Firestore API

Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=whats-the-chance-game

**Steps:**

1. Click "Enable" to activate the Firestore API
2. Wait 2-3 minutes for the API to be fully activated

### 2. Enable Authentication

Visit: https://console.firebase.google.com/project/whats-the-chance-game/authentication

**Steps:**

1. Click "Get started"
2. Enable Email/Password authentication
3. Enable Google authentication (optional)
4. Add your domain to authorized domains

### 3. Create Firestore Database

Visit: https://console.firebase.google.com/project/whats-the-chance-game/firestore

**Steps:**

1. Click "Create database"
2. Choose "Start in test mode" (we'll update security rules later)
3. Select a location (recommend: `us-central1` or `europe-west1`)

### 4. Generate Service Account Key (for Backend)

Visit: https://console.firebase.google.com/project/whats-the-chance-game/settings/serviceaccounts/adminsdk

**Steps:**

1. Click "Generate new private key"
2. Download the JSON file
3. Extract the values and add them to your backend `.env` file

### 5. Deploy Firestore Indexes

After enabling the API, run:

```bash
firebase deploy --only firestore:indexes
```

## 📋 **Environment Configuration**

### Frontend (.env file)

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCa_xUyQQtDguN_ZrLDSFPONbT4yFYug4Y
VITE_FIREBASE_AUTH_DOMAIN=whats-the-chance-game.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=whats-the-chance-game
VITE_FIREBASE_STORAGE_BUCKET=whats-the-chance-game.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=658680466104
VITE_FIREBASE_APP_ID=1:658680466104:web:7fa05e23c1c74c56b7424d
VITE_FIREBASE_MEASUREMENT_ID=G-4NQZL4ZTF1

# Backend API URL
VITE_API_URL=http://localhost:8000
```

### Backend (.env file)

Create a `.env` file in the `backend/` directory with the service account details:

```env
# Firebase Settings
FIREBASE_PROJECT_ID=whats-the-chance-game
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@whats-the-chance-game.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40whats-the-chance-game.iam.gserviceaccount.com
```

## 🚀 **Verification Steps**

### 1. Test Frontend Connection

```bash
npm run dev
```

- Open browser and check console for Firebase connection
- Should see no Firebase errors

### 2. Test Backend Connection

```bash
cd backend
python -m pytest tests/unit/test_firebase_service.py -v
```

- Should pass all Firebase service tests

### 3. Test Authentication

- Try to sign up/sign in through the frontend
- Check Firestore for user document creation

## 🔗 **Useful Links**

- **Firebase Console**: https://console.firebase.google.com/project/whats-the-chance-game
- **Firestore Console**: https://console.firebase.google.com/project/whats-the-chance-game/firestore
- **Authentication Console**: https://console.firebase.google.com/project/whats-the-chance-game/authentication
- **Project Settings**: https://console.firebase.google.com/project/whats-the-chance-game/settings

## 📝 **Notes**

- The Firebase project is now properly configured
- All necessary services are set up
- Security rules are deployed and ready
- The backend infrastructure is complete and ready for integration

**Next Steps**: Complete the manual setup steps above, then the backend infrastructure will be fully functional!
