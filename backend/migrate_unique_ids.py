#!/usr/bin/env python3
"""
Migration Script: Add Unique IDs to Existing Users
This script assigns 16-digit unique IDs to all existing users who don't have one.

Usage:
    python migrate_unique_ids.py [--dry-run] [--batch-size=50]

Options:
    --dry-run       Show what would be done without making changes
    --batch-size    Number of users to process in each batch (default: 50)
"""

import asyncio
import argparse
import sys
from datetime import datetime
from typing import List, Dict, Any

# Add the app directory to the Python path
sys.path.append('.')

from app.services.firebase_service import FirebaseService
from app.services.unique_id_service import UniqueIDService


class UniqueIDMigration:
    """Migration class for adding unique IDs to existing users."""

    def __init__(self, dry_run: bool = False, batch_size: int = 50):
        self.firebase_service = FirebaseService()
        self.unique_id_service = UniqueIDService()
        self.db = self.firebase_service.db
        self.dry_run = dry_run
        self.batch_size = batch_size
        
        # Statistics
        self.stats = {
            'total_users': 0,
            'users_with_unique_id': 0,
            'users_without_unique_id': 0,
            'unique_ids_assigned': 0,
            'errors': 0,
            'error_details': []
        }

    async def get_users_without_unique_id(self) -> List[Dict[str, Any]]:
        """Get all users who don't have a unique_id assigned."""
        try:
            users_ref = self.db.collection('users')
            all_users = users_ref.get()
            
            users_without_id = []
            
            for user_doc in all_users:
                user_data = user_doc.to_dict()
                user_data['uid'] = user_doc.id
                
                self.stats['total_users'] += 1
                
                # Check if user has unique_id
                if not user_data.get('unique_id'):
                    users_without_id.append(user_data)
                    self.stats['users_without_unique_id'] += 1
                else:
                    self.stats['users_with_unique_id'] += 1
            
            return users_without_id
        except Exception as e:
            print(f"❌ Error fetching users: {e}")
            self.stats['errors'] += 1
            self.stats['error_details'].append(f"Fetch users error: {e}")
            return []

    async def assign_unique_id_to_user(self, user_data: Dict[str, Any]) -> bool:
        """Assign a unique ID to a single user."""
        try:
            user_uid = user_data['uid']
            user_email = user_data.get('email', 'unknown')
            user_name = user_data.get('display_name') or user_data.get('username') or 'Unknown'
            
            if self.dry_run:
                # In dry run, just simulate the ID generation
                unique_id = self.unique_id_service.generate_unique_id()
                print(f"  🔸 Would assign unique ID {unique_id} to {user_name} ({user_email})")
                return True
            else:
                # Actually assign the unique ID
                unique_id = await self.unique_id_service.assign_unique_id_to_user(user_uid)
                print(f"  ✅ Assigned unique ID {unique_id} to {user_name} ({user_email})")
                self.stats['unique_ids_assigned'] += 1
                return True
                
        except Exception as e:
            user_email = user_data.get('email', 'unknown')
            print(f"  ❌ Failed to assign unique ID to {user_email}: {e}")
            self.stats['errors'] += 1
            self.stats['error_details'].append(f"User {user_email}: {e}")
            return False

    async def migrate_users_batch(self, users: List[Dict[str, Any]]) -> int:
        """Migrate a batch of users."""
        success_count = 0
        
        for user_data in users:
            if await self.assign_unique_id_to_user(user_data):
                success_count += 1
            
            # Small delay to avoid overwhelming the database
            await asyncio.sleep(0.1)
        
        return success_count

    async def run_migration(self):
        """Run the complete migration process."""
        print("🚀 Starting Unique ID Migration")
        print("=" * 50)
        
        if self.dry_run:
            print("🔍 DRY RUN MODE - No changes will be made")
            print("-" * 30)
        
        # Get users without unique IDs
        print("📋 Fetching users without unique IDs...")
        users_without_id = await self.get_users_without_unique_id()
        
        print(f"📊 Migration Statistics:")
        print(f"   Total users in database: {self.stats['total_users']}")
        print(f"   Users with unique ID: {self.stats['users_with_unique_id']}")
        print(f"   Users without unique ID: {self.stats['users_without_unique_id']}")
        print()
        
        if not users_without_id:
            print("✅ All users already have unique IDs. No migration needed!")
            return
        
        # Process users in batches
        print(f"🔄 Processing {len(users_without_id)} users in batches of {self.batch_size}...")
        print("-" * 50)
        
        total_success = 0
        
        for i in range(0, len(users_without_id), self.batch_size):
            batch = users_without_id[i:i + self.batch_size]
            batch_num = (i // self.batch_size) + 1
            total_batches = (len(users_without_id) + self.batch_size - 1) // self.batch_size
            
            print(f"📦 Processing batch {batch_num}/{total_batches} ({len(batch)} users)...")
            
            batch_success = await self.migrate_users_batch(batch)
            total_success += batch_success
            
            print(f"   Batch {batch_num} completed: {batch_success}/{len(batch)} successful")
            print()
        
        # Final statistics
        print("=" * 50)
        print("🎉 Migration Complete!")
        print(f"📊 Final Statistics:")
        print(f"   Users processed: {len(users_without_id)}")
        print(f"   Successful assignments: {total_success}")
        print(f"   Errors: {self.stats['errors']}")
        
        if self.stats['error_details']:
            print(f"\n❌ Error Details:")
            for error in self.stats['error_details']:
                print(f"   - {error}")
        
        if not self.dry_run:
            print(f"\n✅ {self.stats['unique_ids_assigned']} unique IDs successfully assigned!")
        else:
            print(f"\n🔍 Dry run completed. {len(users_without_id)} users would receive unique IDs.")

    async def validate_migration(self):
        """Validate that the migration was successful."""
        print("\n🔍 Validating migration results...")
        
        users_ref = self.db.collection('users')
        all_users = users_ref.get()
        
        validation_stats = {
            'total_users': 0,
            'users_with_valid_unique_id': 0,
            'users_without_unique_id': 0,
            'users_with_invalid_unique_id': 0,
            'duplicate_unique_ids': 0
        }
        
        unique_ids_seen = set()
        
        for user_doc in all_users:
            user_data = user_doc.to_dict()
            validation_stats['total_users'] += 1
            
            unique_id = user_data.get('unique_id')
            
            if not unique_id:
                validation_stats['users_without_unique_id'] += 1
            elif not await self.unique_id_service.validate_unique_id_format(unique_id):
                validation_stats['users_with_invalid_unique_id'] += 1
            elif unique_id in unique_ids_seen:
                validation_stats['duplicate_unique_ids'] += 1
            else:
                validation_stats['users_with_valid_unique_id'] += 1
                unique_ids_seen.add(unique_id)
        
        print("📊 Validation Results:")
        for key, value in validation_stats.items():
            print(f"   {key.replace('_', ' ').title()}: {value}")
        
        # Check for issues
        issues = (
            validation_stats['users_without_unique_id'] +
            validation_stats['users_with_invalid_unique_id'] +
            validation_stats['duplicate_unique_ids']
        )
        
        if issues == 0:
            print("✅ Validation passed! All users have valid unique IDs.")
        else:
            print(f"⚠️  Validation found {issues} issues that need attention.")


async def main():
    """Main function to run the migration."""
    parser = argparse.ArgumentParser(description="Migrate existing users to have unique IDs")
    parser.add_argument('--dry-run', action='store_true', 
                        help='Show what would be done without making changes')
    parser.add_argument('--batch-size', type=int, default=50,
                        help='Number of users to process in each batch')
    parser.add_argument('--validate-only', action='store_true',
                        help='Only validate existing unique IDs without migration')
    
    args = parser.parse_args()
    
    migration = UniqueIDMigration(dry_run=args.dry_run, batch_size=args.batch_size)
    
    try:
        if args.validate_only:
            await migration.validate_migration()
        else:
            await migration.run_migration()
            
            # Run validation after migration (unless it was a dry run)
            if not args.dry_run:
                await migration.validate_migration()
    
    except KeyboardInterrupt:
        print("\n⚠️  Migration interrupted by user")
    except Exception as e:
        print(f"\n❌ Migration failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
