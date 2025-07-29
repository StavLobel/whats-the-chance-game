#!/usr/bin/env python3
"""
Import Test Challenges Script

This script imports the test challenges data from test_challenges_data.json
into the Firestore database using the existing Firebase service.

Usage:
    python3 import_test_challenges.py

Prerequisites:
    1. Firebase service account credentials properly configured
    2. Backend .env file updated with real Firebase credentials
    3. test_challenges_data.json file exists
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from typing import Any, Dict, List

# Add the app directory to the path so we can import settings
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.services.firebase_service import FirebaseService


def load_test_challenges() -> List[Dict[str, Any]]:
    """Load test challenges from JSON file."""
    try:
        with open("test_challenges_data.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ test_challenges_data.json not found!")
        print(
            "   Run create_test_challenges_api.py first to generate the data."
        )
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON file: {e}")
        return []


def generate_challenge_id() -> str:
    """Generate a unique challenge ID."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    import random

    random_suffix = "".join(
        random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=6)
    )
    return f"challenge_{timestamp}_{random_suffix}"


def prepare_challenge_for_import(
    challenge_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Prepare challenge data for import into Firestore."""

    # Generate a unique ID
    challenge_id = generate_challenge_id()

    # Create the challenge document
    challenge_doc = {
        "id": challenge_id,
        "description": challenge_data["description"],
        "from_user": challenge_data["from_user"],
        "to_user": challenge_data["to_user"],
        "status": challenge_data["status"],
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    }

    # Add range if present
    if "range" in challenge_data:
        challenge_doc["range"] = {
            "min": challenge_data["range"]["min"],
            "max": challenge_data["range"]["max"],
        }

    # Add numbers if present
    if "numbers" in challenge_data:
        challenge_doc["numbers"] = {
            "from_user": challenge_data["numbers"]["from_user"],
            "to_user": challenge_data["numbers"]["to_user"],
        }

    # Add result if present
    if "result" in challenge_data:
        challenge_doc["result"] = challenge_data["result"]
        challenge_doc["completed_at"] = datetime.now()

    return challenge_doc


async def import_challenges_to_firestore(challenges: List[Dict[str, Any]]):
    """Import challenges to Firestore database."""
    firebase_service = FirebaseService()

    print(f"\n📤 Importing {len(challenges)} challenges to Firestore...")

    successful_imports = 0
    failed_imports = 0

    for i, challenge_data in enumerate(challenges, 1):
        try:
            # Prepare the challenge for import
            challenge_doc = prepare_challenge_for_import(challenge_data)

            # Import to Firestore
            await firebase_service.create_document(
                collection_name="challenges",
                data=challenge_doc,
                document_id=challenge_doc["id"],
            )

            print(
                f"✅ [{i:2d}/{len(challenges)}] Imported: {challenge_doc['id']} ({challenge_data['status']})"
            )
            successful_imports += 1

        except Exception as e:
            print(
                f"❌ [{i:2d}/{len(challenges)}] Failed to import challenge: {e}"
            )
            failed_imports += 1

    print(f"\n📊 Import Summary:")
    print(f"   ✅ Successful: {successful_imports}")
    print(f"   ❌ Failed: {failed_imports}")
    print(f"   📊 Total: {len(challenges)}")

    if successful_imports > 0:
        print("\n🎉 Challenges imported successfully!")
        print("\n📋 Next Steps:")
        print("   1. Test the challenges in the frontend application")
        print("   2. Verify different statuses are displayed correctly")
        print("   3. Test Hebrew and English text rendering")
        print("   4. Verify number ranges and game logic")
        print("   5. Test challenge filtering and search functionality")
    else:
        print("\n❌ No challenges were imported successfully.")
        print("   Check your Firebase credentials and try again.")


def print_import_summary(challenges: List[Dict[str, Any]]):
    """Print a summary of challenges to be imported."""
    print("\n" + "=" * 60)
    print("📊 CHALLENGE IMPORT SUMMARY")
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

    print(f"\n📈 Status Distribution:")
    for status, count in status_counts.items():
        print(f"   • {status.capitalize()}: {count} challenges")

    print(f"\n🌍 Language Distribution:")
    for language, count in language_counts.items():
        print(f"   • {language.capitalize()}: {count} challenges")

    print(f"\n🎯 Number Range Distribution:")
    for range_key, count in range_counts.items():
        print(f"   • Range {range_key}: {count} challenges")

    print(f"\n📊 Total Challenges to Import: {len(challenges)}")
    print("=" * 60)


async def main():
    """Main function to import test challenges."""
    print("🎮 Importing Test Challenges to Firestore")
    print("=" * 60)

    # Load test challenges
    challenges = load_test_challenges()

    if not challenges:
        print("❌ No challenges to import!")
        return False

    # Print import summary
    print_import_summary(challenges)

    # Confirm import
    print(
        f"\n⚠️  This will import {len(challenges)} challenges to your Firestore database."
    )
    response = input("Do you want to continue? (y/N): ").strip().lower()

    if response not in ["y", "yes"]:
        print("❌ Import cancelled.")
        return False

    # Import challenges
    await import_challenges_to_firestore(challenges)

    return True


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
