# Test Challenges Documentation

This document explains how to create and import test challenges for the "What's the Chance?" game application.

## Overview

The test challenges system provides comprehensive test data with:

- **Multiple challenge statuses**: pending, accepted, active, completed, rejected
- **Different number ranges**: Easy (1-10), Medium (1-25), Hard (1-100), etc.
- **Mixed languages**: English and Hebrew descriptions
- **Realistic game scenarios**: Matches and no-matches with various numbers

## Files

### 1. `create_test_challenges_api.py`

Generates test challenge data and saves it to `test_challenges_data.json`.

**Features:**

- Creates 26 comprehensive test challenges
- Mix of English and Hebrew descriptions
- Various number ranges and difficulty levels
- Different challenge statuses
- Realistic game outcomes (matches/no-matches)

**Usage:**

```bash
cd backend
python3 create_test_challenges_api.py
```

**Output:**

- `test_challenges_data.json` - Challenge data ready for import

### 2. `import_test_challenges.py`

Imports the test challenges from JSON into the Firestore database.

**Prerequisites:**

- Firebase service account credentials properly configured
- Backend `.env` file updated with real Firebase credentials
- `test_challenges_data.json` file exists

**Usage:**

```bash
cd backend
python3 import_test_challenges.py
```

**Features:**

- Interactive confirmation before import
- Progress tracking during import
- Error handling and reporting
- Summary of successful/failed imports

### 3. `test_challenges_data.json`

Generated challenge data file containing all test challenges.

**Structure:**

```json
[
  {
    "from_user": "6Op1SrQJdyVpHAo419YyUwT9NOo2",
    "to_user": "ZYWaZCihaeXcId5EW0ht2HAHTCq1",
    "description": "Let's see who can guess the lucky number!",
    "status": "pending",
    "language": "english"
  },
  {
    "from_user": "ZYWaZCihaeXcId5EW0ht2HAHTCq1",
    "to_user": "6Op1SrQJdyVpHAo419YyUwT9NOo2",
    "description": "בואו נראה מי יכול לנחש את המספר המזל!",
    "status": "completed",
    "range": { "min": 1, "max": 10 },
    "numbers": { "from_user": 5, "to_user": 5 },
    "result": "match",
    "language": "hebrew"
  }
]
```

## Test Users

The challenges use the following test users:

### John Doe

- **Email**: testuser1@example.com
- **UID**: 6Op1SrQJdyVpHAo419YyUwT9NOo2
- **Username**: johndoe

### Jane Smith

- **Email**: testuser2@example.com
- **UID**: ZYWaZCihaeXcId5EW0ht2HAHTCq1
- **Username**: janesmith

## Challenge Distribution

### Status Distribution

- **Pending**: 5 challenges
- **Accepted**: 3 challenges
- **Active**: 4 challenges
- **Completed**: 12 challenges (6 matches, 6 no-matches)
- **Rejected**: 2 challenges

### Language Distribution

- **English**: 14 challenges
- **Hebrew**: 12 challenges

### Number Range Distribution

- **Easy (1-10)**: 5 challenges
- **Medium (1-25)**: 2 challenges
- **Medium-Hard (1-50)**: 4 challenges
- **Hard (1-100)**: 3 challenges
- **Narrow (5-15)**: 1 challenge
- **Tight (10-20)**: 4 challenges

## Challenge Descriptions

### English Descriptions

- "Let's see who can guess the lucky number!"
- "I challenge you to a number guessing game!"
- "Think you can match my number? Let's find out!"
- "Ready for a quick number challenge?"
- "Who's got better luck? Let's test it!"
- And 10 more variations...

### Hebrew Descriptions

- "בואו נראה מי יכול לנחש את המספר המזל!"
- "אני מאתגר אותך למשחק ניחוש מספרים!"
- "חושב שאתה יכול לנחש את המספר שלי? בואו נבדוק!"
- "מוכן לאתגר מספרים מהיר?"
- "למי יש יותר מזל? בואו נבדוק!"
- And 10 more variations...

## Setup Instructions

### Step 1: Generate Test Data

```bash
cd backend
python3 create_test_challenges_api.py
```

This creates `test_challenges_data.json` with 26 test challenges.

### Step 2: Configure Firebase (if not already done)

1. Get Firebase service account credentials
2. Update `backend/.env` with real Firebase credentials
3. Ensure Firebase project is properly configured

### Step 3: Import Challenges

```bash
cd backend
python3 import_test_challenges.py
```

Follow the interactive prompts to import challenges.

### Step 4: Verify Import

Check the Firestore console to verify challenges were imported:

- Collection: `challenges`
- Should contain 26 documents with various statuses

## Testing Scenarios

### Frontend Testing

1. **Login with test users**:
   - testuser1@example.com / TestPassword123!
   - testuser2@example.com / TestPassword123!

2. **View different challenge statuses**:
   - Pending challenges (awaiting response)
   - Accepted challenges (with number ranges)
   - Active challenges (ready for number submission)
   - Completed challenges (with results)

3. **Test language support**:
   - Verify Hebrew text renders correctly
   - Check English text display
   - Test mixed language scenarios

4. **Test number ranges**:
   - Easy ranges (1-10)
   - Medium ranges (1-25, 1-50)
   - Hard ranges (1-100)
   - Narrow ranges (5-15, 10-20)

### API Testing

1. **Get challenges by user**:

   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:8000/challenges/?user_id=6Op1SrQJdyVpHAo419YyUwT9NOo2
   ```

2. **Get challenges by status**:

   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:8000/challenges/?status=completed
   ```

3. **Get challenge details**:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:8000/challenges/<challenge_id>
   ```

## Troubleshooting

### Firebase Credentials Issues

If you get Firebase credential errors:

1. Check that `backend/.env` has real Firebase credentials
2. Verify Firebase service account key is properly formatted
3. Ensure Firebase project is active and accessible

### Import Failures

If challenges fail to import:

1. Check Firebase connection
2. Verify collection permissions
3. Check for duplicate document IDs
4. Review error messages for specific issues

### Data Validation

If challenges don't appear correctly:

1. Verify challenge document structure
2. Check user UIDs match test users
3. Ensure status values are valid
4. Verify number ranges are within bounds

## Customization

### Adding More Challenges

Edit `create_test_challenges_api.py`:

1. Modify `CHALLENGE_DESCRIPTIONS` for new text
2. Add new `NUMBER_RANGES` for different difficulties
3. Adjust challenge counts in `create_test_challenges_data()`

### Modifying Test Users

Update `TEST_USERS` in both scripts:

1. Add new user UIDs
2. Update user information
3. Adjust challenge distribution

### Changing Languages

Add new languages to `CHALLENGE_DESCRIPTIONS`:

1. Add language key (e.g., "spanish")
2. Add array of descriptions
3. Update language selection logic

## Next Steps

After importing test challenges:

1. **Test Frontend Integration**:
   - Verify challenges display correctly
   - Test filtering and search
   - Check responsive design

2. **Test Real-time Features**:
   - Challenge status updates
   - Live notifications
   - Real-time number submissions

3. **Test Game Logic**:
   - Number matching algorithm
   - Range validation
   - Result calculation

4. **Performance Testing**:
   - Load testing with multiple challenges
   - Database query optimization
   - Frontend rendering performance

---

**Created**: January 29, 2025  
**Updated**: January 29, 2025  
**Project**: whats-the-chance-game  
**Environment**: Development/Testing
