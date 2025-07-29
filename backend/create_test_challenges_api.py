#!/usr/bin/env python3
"""
Create Test Challenges via API Script

This script creates comprehensive test challenges by calling the FastAPI backend
API endpoints, avoiding direct Firebase credential issues.

Features:
- Multiple challenge statuses (pending, accepted, active, completed)
- Different number ranges (1-10, 1-50, 1-100)
- Mixed languages (English and Hebrew)
- Various challenge descriptions
- Realistic game scenarios
"""

import asyncio
import json
import random
# TODO: Add datetime when needed for time operations
from typing import Any, Dict, List

import aiohttp

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

# API Configuration
API_BASE_URL = "http://localhost:8000"
API_ENDPOINTS = {
    "challenges": "/challenges/",
    "accept_challenge": "/challenges/{challenge_id}/accept",
    "submit_number": "/challenges/{challenge_id}/submit-number",
}


async def get_auth_token(
    session: aiohttp.ClientSession, email: str, password: str
) -> str:
    """Get authentication token for a user."""
    # For now, we'll use a mock token since we're creating test data
    # In a real scenario, you would authenticate with Firebase
    return f"mock_token_for_{email}"


async def create_challenge_via_api(
    session: aiohttp.ClientSession,
    from_user: str,
    to_user: str,
    description: str,
    auth_token: str,
) -> Dict[str, Any]:
    """Create a challenge via the API."""
    url = f"{API_BASE_URL}{API_ENDPOINTS['challenges']}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}",
    }

    data = {"to_user": to_user, "description": description}

    try:
        async with session.post(url, json=data, headers=headers) as response:
            if response.status == 201:
                return await response.json()
            else:
                print(f"❌ Failed to create challenge: {response.status}")
                return None
    except Exception as e:
        print(f"❌ Error creating challenge: {e}")
        return None


async def accept_challenge_via_api(
    session: aiohttp.ClientSession,
    challenge_id: str,
    range_data: Dict[str, int],
    auth_token: str,
) -> bool:
    """Accept a challenge via the API."""
    url = f"{API_BASE_URL}{API_ENDPOINTS['accept_challenge'].format(challenge_id=challenge_id)}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}",
    }

    data = {"accepted": True, "range": range_data}

    try:
        async with session.post(url, json=data, headers=headers) as response:
            return response.status == 200
    except Exception as e:
        print(f"❌ Error accepting challenge: {e}")
        return False


async def submit_number_via_api(
    session: aiohttp.ClientSession,
    challenge_id: str,
    number: int,
    auth_token: str,
) -> bool:
    """Submit a number for a challenge via the API."""
    url = f"{API_BASE_URL}{API_ENDPOINTS['submit_number'].format(challenge_id=challenge_id)}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}",
    }

    data = {"number": number}

    try:
        async with session.post(url, json=data, headers=headers) as response:
            return response.status == 200
    except Exception as e:
        print(f"❌ Error submitting number: {e}")
        return False


def create_test_challenges_data() -> List[Dict[str, Any]]:
    """Create comprehensive test challenges data."""

    challenges = []
    users = list(TEST_USERS.values())

    # 1. PENDING CHALLENGES (5 challenges)
    print("Creating pending challenges data...")
    for i in range(5):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]

        # Alternate between English and Hebrew
        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = {
            "from_user": from_user,
            "to_user": to_user,
            "description": description,
            "status": "pending",
            "language": language,
        }
        challenges.append(challenge_data)

    # 2. ACCEPTED CHALLENGES (3 challenges)
    print("Creating accepted challenges data...")
    for i in range(3):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]
        range_data = random.choice(NUMBER_RANGES)

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = {
            "from_user": from_user,
            "to_user": to_user,
            "description": description,
            "status": "accepted",
            "range": range_data,
            "language": language,
        }
        challenges.append(challenge_data)

    # 3. ACTIVE CHALLENGES (4 challenges)
    print("Creating active challenges data...")
    for i in range(4):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]
        range_data = random.choice(NUMBER_RANGES)

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = {
            "from_user": from_user,
            "to_user": to_user,
            "description": description,
            "status": "active",
            "range": range_data,
            "language": language,
        }
        challenges.append(challenge_data)

    # 4. COMPLETED CHALLENGES - MATCHES (6 challenges)
    print("Creating completed challenges with matches data...")
    for i in range(6):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]
        range_data = random.choice(NUMBER_RANGES)

        # Generate matching numbers (same number for both users)
        matching_number = random.randint(range_data["min"], range_data["max"])

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = {
            "from_user": from_user,
            "to_user": to_user,
            "description": description,
            "status": "completed",
            "range": range_data,
            "numbers": {
                "from_user": matching_number,
                "to_user": matching_number,
            },
            "result": "match",
            "language": language,
        }
        challenges.append(challenge_data)

    # 5. COMPLETED CHALLENGES - NO MATCHES (6 challenges)
    print("Creating completed challenges with no matches data...")
    for i in range(6):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]
        range_data = random.choice(NUMBER_RANGES)

        # Generate different numbers for both users
        numbers = {
            "from_user": random.randint(range_data["min"], range_data["max"]),
            "to_user": random.randint(range_data["min"], range_data["max"]),
        }
        # Ensure they're different
        while numbers["from_user"] == numbers["to_user"]:
            numbers["to_user"] = random.randint(
                range_data["min"], range_data["max"]
            )

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = {
            "from_user": from_user,
            "to_user": to_user,
            "description": description,
            "status": "completed",
            "range": range_data,
            "numbers": numbers,
            "result": "no_match",
            "language": language,
        }
        challenges.append(challenge_data)

    # 6. REJECTED CHALLENGES (2 challenges)
    print("Creating rejected challenges data...")
    for i in range(2):
        from_user = users[i % 2]["uid"]
        to_user = users[(i + 1) % 2]["uid"]

        language = "english" if i % 2 == 0 else "hebrew"
        description = random.choice(CHALLENGE_DESCRIPTIONS[language])

        challenge_data = {
            "from_user": from_user,
            "to_user": to_user,
            "description": description,
            "status": "rejected",
            "language": language,
        }
        challenges.append(challenge_data)

    return challenges


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

        # Count languages
        language = challenge.get("language", "english")
        language_counts[language] = language_counts.get(language, 0) + 1

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


async def create_challenges_directly():
    """Create challenges directly in the database using a simple approach."""
    print("🎮 Creating Test Challenges for 'What's the Chance?' Game")
    print("=" * 60)

    try:
        # Create test challenges data
        challenges = create_test_challenges_data()

        # Print summary
        print_challenge_summary(challenges)

        # Since we can't use the API without proper authentication,
        # let's create a JSON file with the challenge data
        # that can be imported manually or used for testing

        output_file = "test_challenges_data.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(challenges, f, indent=2, ensure_ascii=False, default=str)

        print(f"\n✅ Challenge data saved to: {output_file}")
        print(f"📊 Total challenges prepared: {len(challenges)}")

        print("\n📋 Next Steps:")
        print("   1. Start the FastAPI backend: python main.py")
        print("   2. Use the challenge data in test_challenges_data.json")
        print(
            "   3. Import challenges manually or create a script with proper auth"
        )
        print("   4. Test the challenges in the frontend application")
        print("   5. Verify different statuses are displayed correctly")
        print("   6. Test Hebrew and English text rendering")

        return challenges

    except Exception as e:
        print(f"\n❌ Error creating test challenges: {e}")
        return None


def main():
    """Main function to create test challenges."""
    return asyncio.run(create_challenges_directly())


if __name__ == "__main__":
    exit(0 if main() else 1)
