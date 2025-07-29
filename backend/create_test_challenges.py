#!/usr/bin/env python3
"""
Create Test Challenges Script

This script creates comprehensive test challenges with different statuses,
ranges, and languages for the "What's the Chance?" game.

Features:
- Multiple challenge statuses (pending, accepted, active, completed)
- Different number ranges (1-10, 1-50, 1-100)
- Mixed languages (English and Hebrew)
- Various challenge descriptions
- Realistic game scenarios
"""

import asyncio
import os
import random
import sys
from datetime import datetime, timedelta
from typing import Any, Dict, List

# Add the app directory to the path so we can import settings
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "app"))

from app.services.firebase_service import FirebaseService

# Test user UIDs from TEST_USERS.md
TEST_USERS = {
    "john_doe": {
        "email": "testuser1@example.com",
        "uid": "6Op1SrQJdyVpHAo419YyUwT9NOo2",
        "name": "John Doe",
        "username": "johndoe",
    },
    "jane_smith": {
        "email": "testuser2@example.com",
        "uid": "ZYWaZCihaeXcId5EW0ht2HAHTCq1",
        "name": "Jane Smith",
        "username": "janesmith",
    },
}

# Challenge descriptions in English and Hebrew
CHALLENGE_DESCRIPTIONS = {
    "english": [
        "Let's see who can guess the lucky number!",
        "I challenge you to a number guessing game!",
        "Think you can match my number? Let's find out!",
        "Ready for a quick number challenge?",
        "Who's got better luck? Let's test it!",
        "A friendly number guessing challenge!",
        "Can you guess what number I'm thinking?",
        "Let's play a quick number game!",
        "I bet you can't guess my number!",
        "Time for a number challenge!",
        "Ready to test your luck?",
        "Let's see who's more intuitive!",
        "A simple number guessing game!",
        "Can we both pick the same number?",
        "Let's try our luck with numbers!",
    ],
    "hebrew": [
        "בואו נראה מי יכול לנחש את המספר המזל!",
        "אני מאתגר אותך למשחק ניחוש מספרים!",
        "חושב שאתה יכול לנחש את המספר שלי? בואו נבדוק!",
        "מוכן לאתגר מספרים מהיר?",
        "למי יש יותר מזל? בואו נבדוק!",
        "אתגר ניחוש מספרים ידידותי!",
        "אתה יכול לנחש איזה מספר אני חושב?",
        "בואו נשחק משחק מספרים מהיר!",
        "אני מתערב שאתה לא יכול לנחש את המספר שלי!",
        "זמן לאתגר מספרים!",
        "מוכן לבדוק את המזל שלך?",
        "בואו נראה מי יותר אינטואיטיבי!",
        "משחק ניחוש מספרים פשוט!",
        "האם שנינו יכולים לבחור את אותו מספר?",
        "בואו ננסה את המזל שלנו עם מספרים!",
    ],
}

# Number ranges for different difficulty levels
NUMBER_RANGES = [
    {"min": 1, "max": 10, "name": "Easy (1-10)"},
    {"min": 1, "max": 25, "name": "Medium (1-25)"},
    {"min": 1, "max": 50, "name": "Medium-Hard (1-50)"},
    {"min": 1, "max": 100, "name": "Hard (1-100)"},
    {"min": 5, "max": 15, "name": "Narrow (5-15)"},
    {"min": 10, "max": 20, "name": "Tight (10-20)"},
]


def initialize_firebase():
    """Initialize Firebase Admin SDK using the existing service."""
    return FirebaseService()


def generate_challenge_id() -> str:
    """Generate a unique challenge ID."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    random_suffix = "".join(
        random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=6)
    )
    return f"challenge_{timestamp}_{random_suffix}"


def get_random_numbers(min_val: int, max_val: int) -> Dict[str, int]:
    """Generate random numbers for both users within the given range."""
    return {
        "from_user": random.randint(min_val, max_val),
        "to_user": random.randint(min_val, max_val),
    }


def create_challenge_data(
    challenge_id: str,
    from_user: str,
    to_user: str,
    description: str,
    status: str,
    range_data: Dict[str, int] = None,
    numbers: Dict[str, int] = None,
    result: str = None,
    created_at: datetime = None,
    completed_at: datetime = None,
) -> Dict[str, Any]:
    """Create a challenge document data structure."""

    if created_at is None:
        created_at = datetime.now() - timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
        )

    challenge_data = {
        "id": challenge_id,
        "description": description,
        "from_user": from_user,
        "to_user": to_user,
        "status": status,
        "created_at": created_at,
        "updated_at": created_at,
    }

    if range_data:
        challenge_data["range"] = range_data

    if numbers:
        challenge_data["numbers"] = numbers

    if result:
        challenge_data["result"] = result
        challenge_data["completed_at"] = completed_at or datetime.now()

    return challenge_data


def create_test_challenges() -> List[Dict[str, Any]]:
    """Create comprehensive test challenges with various scenarios."""

    challenges = []
    users = list(TEST_USERS.values())

    # 1. PENDING CHALLENGES (5 challenges)
    print("Creating pending challenges...")
    for i in range(5):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]

        # Alternate between English and Hebrew
        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = create_challenge_data(
            challenge_id=generate_challenge_id(),
            from_user=from_user,
            to_user=to_user,
            description=description,
            status="pending",
        )
        challenges.append(challenge_data)

    # 2. ACCEPTED CHALLENGES (3 challenges)
    print("Creating accepted challenges...")
    for i in range(3):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]
        range_data = random.choice(NUMBER_RANGES)

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = create_challenge_data(
            challenge_id=generate_challenge_id(),
            from_user=from_user,
            to_user=to_user,
            description=description,
            status="accepted",
            range_data={"min": range_data["min"], "max": range_data["max"]},
        )
        challenges.append(challenge_data)

    # 3. ACTIVE CHALLENGES (4 challenges)
    print("Creating active challenges...")
    for i in range(4):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]
        range_data = random.choice(NUMBER_RANGES)

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = create_challenge_data(
            challenge_id=generate_challenge_id(),
            from_user=from_user,
            to_user=to_user,
            description=description,
            status="active",
            range_data={"min": range_data["min"], "max": range_data["max"]},
        )
        challenges.append(challenge_data)

    # 4. COMPLETED CHALLENGES - MATCHES (6 challenges)
    print("Creating completed challenges with matches...")
    for i in range(6):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]
        range_data = random.choice(NUMBER_RANGES)

        # Generate matching numbers (same number for both users)
        matching_number = random.randint(range_data["min"], range_data["max"])
        numbers = {"from_user": matching_number, "to_user": matching_number}

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = create_challenge_data(
            challenge_id=generate_challenge_id(),
            from_user=from_user,
            to_user=to_user,
            description=description,
            status="completed",
            range_data={"min": range_data["min"], "max": range_data["max"]},
            numbers=numbers,
            result="match",
        )
        challenges.append(challenge_data)

    # 5. COMPLETED CHALLENGES - NO MATCHES (6 challenges)
    print("Creating completed challenges with no matches...")
    for i in range(6):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]
        range_data = random.choice(NUMBER_RANGES)

        # Generate different numbers for both users
        numbers = get_random_numbers(range_data["min"], range_data["max"])
        # Ensure they're different
        while numbers["from_user"] == numbers["to_user"]:
            numbers = get_random_numbers(range_data["min"], range_data["max"])

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = create_challenge_data(
            challenge_id=generate_challenge_id(),
            from_user=from_user,
            to_user=to_user,
            description=description,
            status="completed",
            range_data={"min": range_data["min"], "max": range_data["max"]},
            numbers=numbers,
            result="no_match",
        )
        challenges.append(challenge_data)

    # 6. REJECTED CHALLENGES (2 challenges)
    print("Creating rejected challenges...")
    for i in range(2):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = create_challenge_data(
            challenge_id=generate_challenge_id(),
            from_user=from_user,
            to_user=to_user,
            description=description,
            status="rejected",
        )
        challenges.append(challenge_data)

    return challenges


async def upload_challenges_to_firestore(challenges: List[Dict[str, Any]]):
    """Upload challenges to Firestore database."""
    firebase_service = initialize_firebase()

    print(f"\n📤 Uploading {len(challenges)} challenges to Firestore...")

    for challenge in challenges:
        try:
            await firebase_service.create_document(
                collection_name="challenges",
                data=challenge,
                document_id=challenge["id"],
            )
            print(f"✅ Created challenge: {challenge['id']}")
        except Exception as e:
            print(f"❌ Failed to create challenge {challenge['id']}: {e}")

    print("✅ All challenges uploaded successfully!")


def print_challenge_summary(challenges: List[Dict[str, Any]]):
    """Print a summary of created challenges."""
    print("\n" + "=" * 60)
    print("📊 CHALLENGE CREATION SUMMARY")
    print("=" * 60)

    # Count by status
    status_counts = {}
    language_counts = {"english": 0, "hebrew": 0}
    range_counts = {}

    for challenge in challenges:
        status = challenge["status"]
        status_counts[status] = status_counts.get(status, 0) + 1

        # Count languages (simple heuristic based on description)
        description = challenge["description"]
        if any(char in description for char in "אבגדהוזחטיכסעפצקרשת"):
            language_counts["hebrew"] += 1
        else:
            language_counts["english"] += 1

        # Count ranges
        if "range" in challenge:
            range_key = (
                f"{challenge['range']['min']}-{challenge['range']['max']}"
            )
            range_counts[range_key] = range_counts.get(range_key, 0) + 1

    print("\n📈 Status Distribution:")
    for status, count in status_counts.items():
        print(f"   • {status.capitalize()}: {count} challenges")

    print("\n🌍 Language Distribution:")
    for language, count in language_counts.items():
        print(f"   • {language.capitalize()}: {count} challenges")

    print("\n🎯 Number Range Distribution:")
    for range_key, count in range_counts.items():
        print(f"   • Range {range_key}: {count} challenges")

    print(f"\n📊 Total Challenges Created: {len(challenges)}")
    print("=" * 60)


def main():
    """Main function to create and upload test challenges."""
    print("🎮 Creating Test Challenges for 'What's the Chance?' Game")
    print("=" * 60)

    try:
        # Create test challenges
        challenges = create_test_challenges()

        # Print summary
        print_challenge_summary(challenges)

        # Upload to Firestore
        asyncio.run(upload_challenges_to_firestore(challenges))

        print("\n🎉 Test challenges creation completed successfully!")
        print("\n📋 Next Steps:")
        print("   1. Test the challenges in the frontend application")
        print("   2. Verify different statuses are displayed correctly")
        print("   3. Test Hebrew and English text rendering")
        print("   4. Verify number ranges and game logic")
        print("   5. Test challenge filtering and search functionality")

    except Exception as e:
        print(f"\n❌ Error creating test challenges: {e}")
        print("Make sure Firebase service account credentials are available.")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
