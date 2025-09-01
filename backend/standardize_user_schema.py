#!/usr/bin/env python3
"""
User Schema Standardization Script

This script examines the current users in the Firebase database,
identifies the schema differences, and standardizes all users based
on the real user (stavlobel@gmail.com) schema while adding a username field.
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List

from firebase_admin import firestore
from app.services.firebase_service import FirebaseService


class UserSchemaStandardizer:
    """Class to standardize user schemas in Firebase."""
    
    def __init__(self):
        self.firebase_service = FirebaseService()
        self.db = self.firebase_service.db
        
    async def examine_users(self) -> Dict[str, Any]:
        """Examine all users and their schemas."""
        print("🔍 Examining users in Firebase...")
        
        users_ref = self.db.collection('users')
        docs = users_ref.get()
        
        users_data = {}
        for doc in docs:
            user_data = doc.to_dict()
            user_data['uid'] = doc.id
            users_data[doc.id] = user_data
            
        print(f"Found {len(users_data)} users:")
        for uid, data in users_data.items():
            email = data.get('email', 'N/A')
            display_name = data.get('display_name', data.get('displayName', 'N/A'))
            print(f"  - {email} ({display_name}) - UID: {uid}")
            
        return users_data
        
    def analyze_schemas(self, users_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the schema differences between users."""
        print("\n📊 Analyzing user schemas...")
        
        # Find the real user (stavlobel@gmail.com)
        real_user = None
        test_users = []
        
        for uid, data in users_data.items():
            if data.get('email') == 'stavlobel@gmail.com':
                real_user = data
            else:
                test_users.append(data)
                
        if not real_user:
            print("❌ Real user (stavlobel@gmail.com) not found!")
            return {}
            
        print(f"\n✅ Real user found: {real_user.get('email')}")
        print("Real user schema:")
        self._print_schema(real_user)
        
        print(f"\n📝 Test users ({len(test_users)}):")
        for i, user in enumerate(test_users, 1):
            print(f"\nTest User {i}: {user.get('email')}")
            self._print_schema(user)
            
        return {
            'real_user': real_user,
            'test_users': test_users,
            'schema_analysis': self._compare_schemas(real_user, test_users)
        }
        
    def _print_schema(self, user: Dict[str, Any]) -> None:
        """Print user schema in a readable format."""
        for key, value in sorted(user.items()):
            if isinstance(value, datetime):
                value = value.isoformat()
            print(f"    {key}: {type(value).__name__} = {value}")
            
    def _compare_schemas(self, real_user: Dict[str, Any], test_users: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compare schemas and identify differences."""
        real_fields = set(real_user.keys())
        
        differences = {}
        for i, test_user in enumerate(test_users):
            test_fields = set(test_user.keys())
            
            missing_in_test = real_fields - test_fields
            extra_in_test = test_fields - real_fields
            
            differences[test_user.get('email', f'test_user_{i}')] = {
                'missing_fields': list(missing_in_test),
                'extra_fields': list(extra_in_test),
                'common_fields': list(real_fields & test_fields)
            }
            
        return differences
        
    def create_standardized_schema(self, real_user: Dict[str, Any]) -> Dict[str, Any]:
        """Create a standardized schema based on the real user."""
        print("\n🏗️  Creating standardized schema...")
        
        # Base schema from real user
        standard_schema = {
            'email': real_user.get('email'),
            'display_name': real_user.get('display_name', real_user.get('displayName')),
            'first_name': real_user.get('first_name', real_user.get('firstName')),
            'last_name': real_user.get('last_name', real_user.get('lastName')),
            'photo_url': real_user.get('photo_url', real_user.get('photoURL')),
            'email_verified': real_user.get('email_verified', real_user.get('emailVerified', True)),
            'disabled': real_user.get('disabled', False),
            'created_at': real_user.get('created_at'),
            'updated_at': real_user.get('updated_at'),
            # Add username field (required for all users)
            'username': None  # Will be set per user
        }
        
        print("Standard schema template:")
        for key, value in sorted(standard_schema.items()):
            print(f"    {key}: {type(value).__name__ if value is not None else 'Any'}")
            
        return standard_schema
        
    async def standardize_users(self, users_data: Dict[str, Any], standard_schema: Dict[str, Any], dry_run: bool = True) -> None:
        """Standardize all users to the new schema."""
        print(f"\n{'🔧' if not dry_run else '🧪'} {'Standardizing' if not dry_run else 'Simulating standardization of'} users...")
        
        updates = {}
        
        for uid, user_data in users_data.items():
            email = user_data.get('email')
            
            # Create standardized user data
            standardized_user = standard_schema.copy()
            
            # Map existing fields to standard schema
            standardized_user.update({
                'email': email,
                'display_name': user_data.get('display_name', user_data.get('displayName')),
                'first_name': user_data.get('first_name', user_data.get('firstName')),
                'last_name': user_data.get('last_name', user_data.get('lastName')),
                'photo_url': user_data.get('photo_url', user_data.get('photoURL')),
                'email_verified': user_data.get('email_verified', user_data.get('emailVerified', True)),
                'disabled': user_data.get('disabled', False),
                'created_at': user_data.get('created_at'),
                'updated_at': datetime.utcnow()
            })
            
            # Generate username if not exists
            existing_username = user_data.get('username')
            if not existing_username:
                if email == 'stavlobel@gmail.com':
                    standardized_user['username'] = 'stavlobel'
                elif email == 'testuser1@example.com':
                    standardized_user['username'] = 'johndoe'
                elif email == 'testuser2@example.com':
                    standardized_user['username'] = 'janesmith'
                else:
                    # Generate username from email
                    username = email.split('@')[0].lower()
                    standardized_user['username'] = username
            else:
                standardized_user['username'] = existing_username
                
            # Remove None values
            standardized_user = {k: v for k, v in standardized_user.items() if v is not None}
            
            updates[uid] = standardized_user
            
            print(f"\n👤 User: {email}")
            print(f"   UID: {uid}")
            print(f"   Username: {standardized_user['username']}")
            
            # Show what would change
            changes = []
            for key, new_value in standardized_user.items():
                old_value = user_data.get(key)
                if old_value != new_value:
                    changes.append(f"     {key}: {old_value} → {new_value}")
                    
            if changes:
                print("   Changes:")
                for change in changes:
                    print(change)
            else:
                print("   No changes needed")
                
        if not dry_run:
            print(f"\n💾 Applying updates to {len(updates)} users...")
            batch = self.db.batch()
            
            for uid, user_data in updates.items():
                user_ref = self.db.collection('users').document(uid)
                batch.set(user_ref, user_data, merge=True)
                
            batch.commit()
            print("✅ Users updated successfully!")
        else:
            print(f"\n🔍 Dry run complete. {len(updates)} users would be updated.")
            print("Run with --apply to actually update the database.")
            
        return updates
        
    async def run(self, dry_run: bool = True) -> None:
        """Run the complete standardization process."""
        print("🚀 Starting user schema standardization...")
        print(f"Mode: {'Dry Run' if dry_run else 'Apply Changes'}")
        print("-" * 50)
        
        try:
            # Step 1: Examine current users
            users_data = await self.examine_users()
            
            if not users_data:
                print("❌ No users found in database!")
                return
                
            # Step 2: Analyze schemas
            analysis = self.analyze_schemas(users_data)
            
            if not analysis:
                return
                
            # Step 3: Create standard schema
            standard_schema = self.create_standardized_schema(analysis['real_user'])
            
            # Step 4: Standardize users
            await self.standardize_users(users_data, standard_schema, dry_run)
            
            print("\n✅ Schema standardization complete!")
            
        except Exception as e:
            print(f"❌ Error during standardization: {e}")
            raise


async def main():
    """Main function."""
    import sys
    
    dry_run = '--apply' not in sys.argv
    
    if not dry_run:
        confirm = input("⚠️  This will modify the database. Are you sure? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Aborted.")
            return
            
    standardizer = UserSchemaStandardizer()
    await standardizer.run(dry_run=dry_run)


if __name__ == "__main__":
    asyncio.run(main())
