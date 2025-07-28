#!/usr/bin/env python3
"""
Script to update backend .env file with real Firebase credentials
"""

import json
import os

# Read the service account key
with open("backend/service-account-key.json", "r") as f:
    service_account = json.load(f)

# Read the current .env file
env_file = "backend/.env"
with open(env_file, "r") as f:
    env_content = f.read()

# Update the Firebase credentials
env_content = env_content.replace(
    'FIREBASE_PRIVATE_KEY_ID="REPLACE_WITH_YOUR_PRIVATE_KEY_ID"',
    f'FIREBASE_PRIVATE_KEY_ID="{service_account["private_key_id"]}"',
)

env_content = env_content.replace(
    'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nREPLACE_WITH_YOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"',
    f'FIREBASE_PRIVATE_KEY="{service_account["private_key"].replace(chr(10), "\\n")}"',
)

env_content = env_content.replace(
    'FIREBASE_CLIENT_EMAIL="REPLACE_WITH_YOUR_CLIENT_EMAIL"',
    f'FIREBASE_CLIENT_EMAIL="{service_account["client_email"]}"',
)

env_content = env_content.replace(
    'FIREBASE_CLIENT_ID="REPLACE_WITH_YOUR_CLIENT_ID"',
    f'FIREBASE_CLIENT_ID="{service_account["client_id"]}"',
)

env_content = env_content.replace(
    'FIREBASE_CLIENT_X509_CERT_URL="REPLACE_WITH_YOUR_CERT_URL"',
    f'FIREBASE_CLIENT_X509_CERT_URL="{service_account["client_x509_cert_url"]}"',
)

# Write the updated .env file
with open(env_file, "w") as f:
    f.write(env_content)

print("✅ Backend .env file updated with real Firebase credentials!")
print(f"Private Key ID: {service_account['private_key_id']}")
print(f"Client Email: {service_account['client_email']}")
print(f"Client ID: {service_account['client_id']}")
