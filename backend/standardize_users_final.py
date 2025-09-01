#!/usr/bin/env python3
"""
Comprehensive User Schema Standardization Script

This script standardizes all users to match a consistent schema based on
the real user structure but with added username field and proper field naming.
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List, Optional

from firebase_admin import firestore
from app.services.firebase_service import FirebaseService


class UserStandardizer:
    """Standardizes user schemas across the Firebase database."""
    
    def __init__(self):
        self.firebase_service = FirebaseService()
        self.db = self.firebase_service.db
        
    def create_standard_user_schema(self, 
                                  email: str,
                                  display_name: str,
                                  first_name: Optional[str] = None,
                                  last_name: Optional[str] = None,
                                  username: Optional[str] = None,
                                  photo_url: Optional[str] = None,
                                  email_verified: bool = True,
                                  disabled: bool = False,
                                  created_at: Optional[datetime] = None,
                                  existing_stats: Optional[Dict] = None,
                                  existing_profile: Optional[Dict] = None,
                                  existing_settings: Optional[Dict] = None) -> Dict[str, Any]:
        """Create a standardized user document."""
        
        now = datetime.utcnow()
        
        # Default stats structure
        default_stats = {
            'totalChallengesCreated': 0,
            'totalChallengesAccepted': 0,
            'totalGamesWon': 0,
            'totalGamesLost': 0,
            'totalGamesPlayed': 0,
            'winPercentage': 0,
            'averageGuessAccuracy': 0,
            'streakCurrent': 0,
            'streakBest': 0,
            'favoriteRange': {
                'min': 1,
                'max': 10,
                'count': 0
            },
            'lastActiveAt': now
        }
        
        # Default profile structure
        default_profile = {
            'isPublic': True,
            'bio': None,
            'location': None,
            'birthDate': None
        }
        
        # Default settings structure
        default_settings = {
            'notifications': {
                'challenges': True,
                'messages': True,
                'gameUpdates': True,
                'marketing': False
            },
            'privacy': {
                'showEmail': False,
                'showProfile': True,
                'allowFriendRequests': True
            },
            'theme': 'auto',
            'language': 'en'
        }
        
        # Merge with existing data if available
        stats = {**default_stats, **(existing_stats or {})}
        profile = {**default_profile, **(existing_profile or {})}
        settings = {**default_settings, **(existing_settings or {})}
        
        return {
            'email': email,
            'display_name': display_name,
            'first_name': first_name,
            'last_name': last_name,
            'username': username,
            'photo_url': photo_url,
            'email_verified': email_verified,
            'disabled': disabled,
            'created_at': created_at or now,
            'updated_at': now,
            'stats': stats,
            'profile': profile,
            'settings': settings
        }
        
    def extract_names_from_display_name(self, display_name: str) -> tuple[Optional[str], Optional[str]]:
        """Extract first and last names from display name."""
        if not display_name:
            return None, None
            
        parts = display_name.strip().split()
        if len(parts) == 1:
            return parts[0], None
        elif len(parts) >= 2:
            return parts[0], parts[-1]
        return None, None
        
    def generate_username_from_email(self, email: str) -> str:
        """Generate a username from email address."""
        return email.split('@')[0].lower()
        
    async def standardize_all_users(self, dry_run: bool = True) -> None:
        """Standardize all users in the database."""
        print("🚀 Starting comprehensive user standardization...")
        print(f"Mode: {'Dry Run' if dry_run else 'Apply Changes'}")
        print("-" * 60)
        
        users_ref = self.db.collection('users')
        docs = users_ref.get()
        
        updates = {}
        
        print(f"📊 Found {len(docs)} users to process:")
        
        for doc in docs:
            user_data = doc.to_dict()
            uid = doc.id
            email = user_data.get('email')
            
            print(f"\n👤 Processing: {email} (UID: {uid})")
            
            # Extract current data with field name normalization
            display_name = (user_data.get('display_name') or 
                          user_data.get('displayName') or 
                          'Unknown User')
            
            first_name = (user_data.get('first_name') or 
                         user_data.get('firstName'))
            
            last_name = (user_data.get('last_name') or 
                        user_data.get('lastName'))
            
            # If no first/last name, extract from display name
            if not first_name and not last_name:
                first_name, last_name = self.extract_names_from_display_name(display_name)
                
            username = user_data.get('username')
            if not username:
                if email == 'stavlobel@gmail.com':
                    username = 'stavlobel'
                elif email == 'testuser1@example.com':
                    username = 'johndoe'
                elif email == 'testuser2@example.com':
                    username = 'janesmith'
                else:
                    username = self.generate_username_from_email(email)
                    
            photo_url = (user_data.get('photo_url') or 
                        user_data.get('photoURL'))
            
            email_verified = (user_data.get('email_verified') or 
                            user_data.get('emailVerified', True))
            
            disabled = user_data.get('disabled', False)
            
            # Handle timestamps - convert from various formats
            created_at = user_data.get('created_at') or user_data.get('createdAt')
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except:
                    created_at = datetime.utcnow()
            elif created_at is None:
                created_at = datetime.utcnow()
                
            # Preserve existing nested data
            existing_stats = user_data.get('stats', {})
            existing_profile = user_data.get('profile', {})
            existing_settings = user_data.get('settings', {})
            
            # Create standardized user
            standardized_user = self.create_standard_user_schema(
                email=email,
                display_name=display_name,
                first_name=first_name,
                last_name=last_name,
                username=username,
                photo_url=photo_url,
                email_verified=email_verified,
                disabled=disabled,
                created_at=created_at,
                existing_stats=existing_stats,
                existing_profile=existing_profile,
                existing_settings=existing_settings
            )
            
            updates[uid] = standardized_user
            
            print(f"   ✅ Standardized:")
            print(f"      Display Name: {display_name}")
            print(f"      First Name: {first_name}")
            print(f"      Last Name: {last_name}")
            print(f"      Username: {username}")
            print(f"      Photo URL: {'Yes' if photo_url else 'No'}")
            print(f"      Email Verified: {email_verified}")
            
        if not dry_run:
            print(f"\n💾 Applying updates to {len(updates)} users...")
            
            batch = self.db.batch()
            for uid, user_data in updates.items():
                user_ref = self.db.collection('users').document(uid)
                # Use set() to completely replace the document with standardized schema
                batch.set(user_ref, user_data)
                
            batch.commit()
            print("✅ All users updated successfully!")
            
            # Verify the updates
            print("\n🔍 Verifying updates...")
            for uid in updates.keys():
                doc = self.db.collection('users').document(uid).get()
                user_data = doc.to_dict()
                email = user_data.get('email')
                username = user_data.get('username')
                print(f"   ✅ {email} - Username: {username}")
                
        else:
            print(f"\n🔍 Dry run complete. {len(updates)} users would be updated.")
            print("\nStandardized schema preview:")
            print(json.dumps(list(updates.values())[0], indent=2, default=str))
            print("\nRun with --apply to actually update the database.")
            
    async def run(self, dry_run: bool = True) -> None:
        """Run the standardization process."""
        try:
            await self.standardize_all_users(dry_run)
            print("\n🎉 User schema standardization complete!")
        except Exception as e:
            print(f"❌ Error during standardization: {e}")
            raise


async def main():
    """Main function."""
    import sys
    
    dry_run = '--apply' not in sys.argv
    
    if not dry_run:
        print("⚠️  This will completely replace all user documents with standardized schemas!")
        # Skip confirmation in non-interactive mode
        try:
            confirm = input("Are you sure you want to proceed? (type 'yes' to confirm): ")
            if confirm.lower() != 'yes':
                print("Aborted.")
                return
        except EOFError:
            print("Non-interactive mode detected. Proceeding with standardization...")
            
    standardizer = UserStandardizer()
    await standardizer.run(dry_run=dry_run)


if __name__ == "__main__":
    asyncio.run(main())
