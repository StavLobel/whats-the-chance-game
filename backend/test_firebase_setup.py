#!/usr/bin/env python3
"""
Simple test script to verify Firebase setup
"""

import os
import sys

# Set environment variables for testing
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["FIREBASE_PROJECT_ID"] = "whats-the-chance-game"

# Load the real Firebase credentials from the service account key
import json

with open("service-account-key.json", "r") as f:
    service_account = json.load(f)

os.environ["FIREBASE_PRIVATE_KEY_ID"] = service_account["private_key_id"]
os.environ["FIREBASE_PRIVATE_KEY"] = service_account["private_key"]
os.environ["FIREBASE_CLIENT_EMAIL"] = service_account["client_email"]
os.environ["FIREBASE_CLIENT_ID"] = service_account["client_id"]
os.environ["FIREBASE_AUTH_URI"] = service_account["auth_uri"]
os.environ["FIREBASE_TOKEN_URI"] = service_account["token_uri"]
os.environ["FIREBASE_AUTH_PROVIDER_X509_CERT_URL"] = service_account[
    "auth_provider_x509_cert_url"
]
os.environ["FIREBASE_CLIENT_X509_CERT_URL"] = service_account["client_x509_cert_url"]

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "app"))

try:
    from app.core.config import settings

    print("✅ Configuration loaded successfully!")
    print(f"Project ID: {settings.firebase_project_id}")
    print(f"App Name: {settings.app_name}")
    print(f"Debug Mode: {settings.debug}")

    from app.services.firebase_service import FirebaseService

    print("✅ Firebase service imported successfully!")

    # Test Firebase service initialization
    firebase_service = FirebaseService()
    print("✅ Firebase service initialized successfully!")

    print("\n🎉 Firebase setup is working correctly!")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback

    traceback.print_exc()
