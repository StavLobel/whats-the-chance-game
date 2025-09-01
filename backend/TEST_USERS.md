# Test Users Documentation

This document contains information about the test users created for the "What's the Chance?" game application.

## Test Users Created

### User 1

- **Email**: `testuser1@example.com`
- **Password**: `TestPassword123!`
- **Display Name**: John Doe
- **First Name**: John
- **Last Name**: Doe
- **Username**: johndoe
- **UID**: `6Op1SrQJdyVpHAo419YyUwT9NOo2`
- **Email Verified**: ✅ True

### User 2

- **Email**: `testuser2@example.com`
- **Password**: `TestPassword123!`
- **Display Name**: Jane Smith
- **First Name**: Jane
- **Last Name**: Smith
- **Username**: janesmith
- **UID**: `ZYWaZCihaeXcId5EW0ht2HAHTCq1`
- **Email Verified**: ✅ True

## Firebase Database Structure

The Firebase database has been updated with a comprehensive user schema across multiple collections:

### 🔥 Firebase Authentication

- **Users**: Created with email/password authentication
- **Custom Claims**: firstName, lastName, username, emailVerified
- **Email Verification**: Enabled for immediate use

### 📊 Firestore Collections

#### 1. `users` Collection (Profile Documents)

Each user has a profile document with the following fields:

```json
{
  "uid": "user-uid",
  "email": "user@example.com",
  "display_name": "User Display Name",
  "first_name": "User First Name",
  "last_name": "User Last Name",
  "username": "unique_username",
  "photo_url": "https://example.com/photo.jpg",
  "email_verified": true,
  "disabled": false,
  "created_at": "2025-01-28T...",
  "updated_at": "2025-01-28T..."
}
```

#### 2. `user_stats` Collection (Statistics Documents)

Each user has a statistics document for game tracking:

```json
{
  "uid": "user-uid",
  "total_challenges": 0,
  "challenges_won": 0,
  "challenges_lost": 0,
  "win_rate": 0.0,
  "total_matches": 0,
  "matches_won": 0,
  "matches_lost": 0,
  "average_response_time": null,
  "last_active": "2025-01-28T...",
  "created_at": "2025-01-28T...",
  "updated_at": "2025-01-28T..."
}
```

#### 3. `user_settings` Collection (Settings Documents)

Each user has a settings document for preferences:

```json
{
  "uid": "user-uid",
  "notifications": {
    "challenges": true,
    "messages": true,
    "game_updates": true,
    "marketing": false
  },
  "privacy": {
    "show_email": true,
    "show_profile": true,
    "allow_friend_requests": true
  },
  "theme": "auto",
  "language": "en",
  "created_at": "2025-01-28T...",
  "updated_at": "2025-01-28T..."
}
```

## Usage

These test users can be used for:

1. **Frontend Testing**: Login/signup functionality testing
2. **Backend Testing**: API endpoint testing with authenticated users
3. **Challenge Testing**: Creating and responding to challenges between users
4. **E2E Testing**: Complete user flow testing
5. **Profile Testing**: Testing user profile management with firstName, lastName, and username fields
6. **Database Testing**: Testing Firestore operations across all collections

## New User Fields Added

The user profiles now include additional fields:

- **firstName**: User's first name (max 50 characters)
- **lastName**: User's last name (max 50 characters)
- **username**: Unique username (max 30 characters, alphanumeric with underscores/hyphens)

### Field Validation Rules

- **firstName/lastName**: Cannot be empty if provided, max 50 characters
- **username**:
  - Minimum 3 characters
  - Maximum 30 characters
  - Can contain letters, numbers, underscores, and hyphens
  - Must be unique across all users

## Security Notes

⚠️ **Important**: These are test users with simple passwords. They should only be used in development/testing environments.

- Do not use these credentials in production
- These users are created in the Firebase project: `your-project-id`
- Users are created with email verification enabled for immediate use
- Custom claims are set for firstName, lastName, and username fields
- All Firestore documents are properly structured with timestamps

## Database Verification

The database structure has been verified and includes:

✅ **Firebase Auth**: Users with custom claims
✅ **Collection: users**: Profile documents with all fields
✅ **Collection: user_stats**: Statistics documents for game tracking
✅ **Collection: user_settings**: Settings documents for user preferences

## Creation Script

The users were created using the `create_test_users.py` script in the backend directory. To recreate or modify these users, run:

```bash
cd backend
python3 create_test_users.py
```

## Update Script

To update existing users with new profile fields, use:

```bash
cd backend
python3 update_test_users.py
```

## Firebase Console

You can view these users in the Firebase Console:

- **Authentication**: https://console.firebase.google.com/project/your-project-id/authentication/users
- **Firestore**: https://console.firebase.google.com/project/your-project-id/firestore

## Backend Schema Updates

The backend user schemas have been updated to include:

- `UserBase.first_name`: Optional first name field
- `UserBase.last_name`: Optional last name field
- `UserBase.username`: Optional unique username field
- Validation rules for all new fields
- Updated search functionality to include new fields

## API Integration

The new schema supports:

- **User Profile Management**: Complete CRUD operations
- **User Search**: Search by firstName, lastName, username, or email
- **Statistics Tracking**: Game performance metrics
- **Settings Management**: User preferences and privacy settings
- **Authentication**: Custom claims for enhanced user data

---

**Created**: January 28, 2025
**Updated**: January 28, 2025 (Added firstName, lastName, username fields)
**Database Updated**: January 28, 2025 (Complete Firestore structure)
**Project**: your-project-id
**Environment**: Development/Testing
