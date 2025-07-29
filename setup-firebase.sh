#!/bin/bash

# Firebase Setup Script for "What's the Chance?" Game
# This script helps complete the Firebase project setup

set -e

echo "🔥 Setting up Firebase for 'What's the Chance?' Game"
echo "=================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI ready"

# Project details
PROJECT_ID="whats-the-chance-game"
WEB_APP_ID="1:658680466104:web:7fa05e23c1c74c56b7424d"

echo ""
echo "📋 Current Project Status:"
echo "Project ID: $PROJECT_ID"
echo "Web App ID: $WEB_APP_ID"

# Get web app configuration
echo ""
echo "📱 Web App Configuration:"
firebase apps:sdkconfig WEB $WEB_APP_ID

echo ""
echo "🔧 Manual Setup Steps Required:"
echo "=================================="
echo ""
echo "1. Enable Firestore API:"
echo "   Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=$PROJECT_ID"
echo "   Click 'Enable' and wait 2-3 minutes"
echo ""
echo "2. Enable Authentication:"
echo "   Visit: https://console.firebase.google.com/project/$PROJECT_ID/authentication"
echo "   Click 'Get started' and enable Email/Password authentication"
echo ""
echo "3. Create Firestore Database:"
echo "   Visit: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
echo "   Click 'Create database' and choose 'Start in test mode'"
echo ""
echo "4. Generate Service Account Key:"
echo "   Visit: https://console.firebase.google.com/project/$PROJECT_ID/settings/serviceaccounts/adminsdk"
echo "   Click 'Generate new private key' and download the JSON file"
echo ""

# Create environment files
echo "📝 Creating environment files..."

# Frontend .env
cat > .env << EOF
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
EOF

echo "✅ Created .env file for frontend"

# Backend .env template
cat > backend/.env << EOF
# Application Settings
APP_NAME="What's the Chance? API"
APP_VERSION="0.1.0"
DEBUG=true

# Server Settings
HOST="0.0.0.0"
PORT=8000

# CORS Settings (comma-separated)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8080,https://localhost:3000,https://localhost:8080"

# Security Settings
SECRET_KEY="your-secret-key-here-change-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Firebase Settings
FIREBASE_PROJECT_ID="whats-the-chance-game"
FIREBASE_PRIVATE_KEY_ID="REPLACE_WITH_YOUR_PRIVATE_KEY_ID"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nREPLACE_WITH_YOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL="REPLACE_WITH_YOUR_CLIENT_EMAIL"
FIREBASE_CLIENT_ID="REPLACE_WITH_YOUR_CLIENT_ID"
FIREBASE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
FIREBASE_TOKEN_URI="https://oauth2.googleapis.com/token"
FIREBASE_AUTH_PROVIDER_X509_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
FIREBASE_CLIENT_X509_CERT_URL="REPLACE_WITH_YOUR_CERT_URL"

# Database Settings
FIRESTORE_COLLECTION_PREFIX=""

# Redis Settings
REDIS_URL="redis://localhost:6379"
REDIS_DB=0

# Logging Settings
LOG_LEVEL="INFO"
EOF

echo "✅ Created backend/.env file (update with service account details)"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo ""
echo "1. Complete the manual setup steps above"
echo "2. Update backend/.env with your service account details"
echo "3. Deploy Firestore indexes: firebase deploy --only firestore:indexes"
echo "4. Test the setup: npm run dev"
echo ""
echo "📚 For detailed instructions, see: FIREBASE_SETUP.md"
echo ""
echo "🎉 Firebase setup script completed!" 