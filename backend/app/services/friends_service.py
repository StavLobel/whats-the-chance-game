"""
Friends Service
Handles all friend-related business logic including friend requests,
friendships management, and friend suggestions.

This module provides:
- Friend request sending, accepting, rejecting
- Friend list management
- Friend suggestions based on mutual connections
- User search functionality
- Privacy and blocking features
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from firebase_admin import firestore
from google.cloud.firestore_v1 import FieldFilter, Query

from app.core.config import settings
from app.services.firebase_service import FirebaseService
from app.schemas.friends import (
    FriendRequest,
    FriendRequestCreate,
    FriendRequestUpdate,
    FriendRequestWithUsers,
    Friendship,
    FriendshipCreate,
    FriendshipWithUser,
    FriendSearch,
    FriendSuggestion,
    FriendActivity,
    BlockedUser,
    BlockUserRequest,
    FriendPrivacySettings,
)


class FriendService:
    """Service for managing friend relationships."""
    
    def __init__(self):
        self.firebase_service = FirebaseService()
        self.db = self.firebase_service.db
        
    async def search_users(
        self, 
        current_user_id: str, 
        search_params: FriendSearch
    ) -> Dict[str, Any]:
        """Search for users based on query parameters."""
        users_ref = self.db.collection('users')
        
        # Get blocked users to exclude from results
        blocked_ids = await self._get_blocked_user_ids(current_user_id)
        blocked_ids.add(current_user_id)  # Exclude self
        
        # Search by username, displayName, or email
        query = search_params.query.lower()
        results = []
        
        # Search in username
        if query:
            username_query = users_ref.where('username', '>=', query).where('username', '<=', query + '\uf8ff')
            username_results = username_query.limit(search_params.limit).get()
            
            for doc in username_results:
                user_data = doc.to_dict()
                user_data['uid'] = doc.id
                if doc.id not in blocked_ids:
                    results.append(user_data)
        
        # If we need more results, search in displayName
        if len(results) < search_params.limit:
            display_query = users_ref.where('display_name', '>=', query).where('display_name', '<=', query + '\uf8ff')
            display_results = display_query.limit(search_params.limit - len(results)).get()
            
            existing_ids = {user['uid'] for user in results}
            for doc in display_results:
                if doc.id not in existing_ids and doc.id not in blocked_ids:
                    user_data = doc.to_dict()
                    user_data['uid'] = doc.id
                    results.append(user_data)
        
        # If we still need more results, search in email
        if len(results) < search_params.limit:
            email_query = users_ref.where('email', '>=', query).where('email', '<=', query + '\uf8ff')
            email_results = email_query.limit(search_params.limit - len(results)).get()
            
            existing_ids = {user['uid'] for user in results}
            for doc in email_results:
                if doc.id not in existing_ids and doc.id not in blocked_ids:
                    user_data = doc.to_dict()
                    user_data['uid'] = doc.id
                    results.append(user_data)
        
        # Apply filters
        if search_params.online_only:
            results = [u for u in results if u.get('isOnline', False)]
            
        if search_params.mutual_friends_only:
            # Get current user's friends
            friends = await self.get_friends(current_user_id)
            friend_ids = {f.friend['uid'] for f in friends}
            
            # Filter by mutual friends
            filtered_results = []
            for user in results:
                user_friends = await self._get_friend_ids(user['uid'])
                mutual_count = len(friend_ids.intersection(user_friends))
                if mutual_count > 0:
                    user['mutualFriendsCount'] = mutual_count
                    filtered_results.append(user)
            results = filtered_results
        
        # Return results in the expected format
        return {
            "users": results[:search_params.limit],
            "total": len(results),
            "query": search_params.query
        }
    
    async def send_friend_request(
        self, 
        from_user_id: str, 
        request: FriendRequestCreate
    ) -> FriendRequest:
        """Send a friend request to another user."""
        # Check if already friends
        if await self._are_friends(from_user_id, request.to_user_id):
            raise ValueError("Already friends with this user")
        
        # Check if request already exists
        existing = await self._get_pending_request(from_user_id, request.to_user_id)
        if existing:
            raise ValueError("Friend request already sent")
        
        # Check if blocked
        if await self._is_blocked(from_user_id, request.to_user_id):
            raise ValueError("Cannot send friend request to this user")
        
        # Create friend request
        request_data = {
            'fromUserId': from_user_id,
            'toUserId': request.to_user_id,
            'message': request.message,
            'status': 'pending',
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
        }
        
        doc_ref = self.db.collection('friendRequests').document()
        doc_ref.set(request_data)
        
        # Create notification
        await self.firebase_service.create_notification(
            user_id=request.to_user_id,
            notification_type='friend_request',
            title='New Friend Request',
            message=f'You have a new friend request',
            data={'requestId': doc_ref.id, 'fromUserId': from_user_id}
        )
        
        request_data['id'] = doc_ref.id
        request_data['createdAt'] = datetime.utcnow()
        request_data['updatedAt'] = datetime.utcnow()
        
        return FriendRequest(**request_data)
    
    async def get_friend_requests(
        self, 
        user_id: str, 
        request_type: str = 'received',
        page: int = 1,
        per_page: int = 20
    ) -> Dict[str, Any]:
        """Get friend requests for a user."""
        requests_ref = self.db.collection('friendRequests')
        
        if request_type == 'received':
            query = requests_ref.where('toUserId', '==', user_id)
        else:  # sent
            query = requests_ref.where('fromUserId', '==', user_id)
        
        query = query.where('status', '==', 'pending')
        query = query.order_by('createdAt', direction=Query.DESCENDING)
        
        # Pagination
        offset = (page - 1) * per_page
        requests_docs = query.offset(offset).limit(per_page).get()
        
        # Get user details for each request
        requests_with_users = []
        for doc in requests_docs:
            request_data = doc.to_dict()
            request_data['id'] = doc.id
            
            # Get user details
            from_user = await self.firebase_service.get_user(request_data['fromUserId'])
            to_user = await self.firebase_service.get_user(request_data['toUserId'])
            
            request_with_users = FriendRequestWithUsers(
                **request_data,
                from_user=from_user,
                to_user=to_user
            )
            requests_with_users.append(request_with_users)
        
        # Get total count
        total = len(query.get())
        
        return {
            'requests': requests_with_users,
            'total': total,
            'page': page,
            'per_page': per_page
        }
    
    async def update_friend_request(
        self, 
        request_id: str, 
        user_id: str, 
        update: FriendRequestUpdate
    ) -> FriendRequest:
        """Accept or reject a friend request."""
        request_ref = self.db.collection('friendRequests').document(request_id)
        request_doc = request_ref.get()
        
        if not request_doc.exists:
            raise ValueError("Friend request not found")
        
        request_data = request_doc.to_dict()
        
        # Verify user is the recipient
        if request_data['toUserId'] != user_id:
            raise ValueError("Unauthorized to update this request")
        
        # Update request status
        request_ref.update({
            'status': update.status,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        # If accepted, create friendship
        if update.status == 'accepted':
            await self._create_friendship(
                request_data['fromUserId'],
                request_data['toUserId'],
                request_id
            )
            
            # Notify the sender
            await self.firebase_service.create_notification(
                user_id=request_data['fromUserId'],
                notification_type='friend_request_accepted',
                title='Friend Request Accepted',
                message=f'Your friend request was accepted',
                data={'requestId': request_id, 'userId': user_id}
            )
        
        request_data['id'] = request_id
        request_data['status'] = update.status
        request_data['updatedAt'] = datetime.utcnow()
        
        return FriendRequest(**request_data)
    
    async def get_friends(
        self, 
        user_id: str,
        page: int = 1,
        per_page: int = 20,
        online_only: bool = False
    ) -> List[FriendshipWithUser]:
        """Get user's friends list."""
        friendships_ref = self.db.collection('friendships')
        
        # Query friendships where user is either user1 or user2
        query1 = friendships_ref.where('user1Id', '==', user_id).where('isActive', '==', True)
        query2 = friendships_ref.where('user2Id', '==', user_id).where('isActive', '==', True)
        
        # Get results
        docs1 = query1.get()
        docs2 = query2.get()
        
        # Combine results
        friendships = []
        for doc in docs1:
            data = doc.to_dict()
            data['id'] = doc.id
            friend_id = data['user2Id']
            friend = await self.firebase_service.get_user(friend_id)
            
            if online_only and not friend.get('isOnline', False):
                continue
                
            friendship = FriendshipWithUser(
                **data,
                friend=friend,
                online_status=friend.get('isOnline', False),
                last_active=friend.get('lastActive')
            )
            friendships.append(friendship)
        
        for doc in docs2:
            data = doc.to_dict()
            data['id'] = doc.id
            friend_id = data['user1Id']
            friend = await self.firebase_service.get_user(friend_id)
            
            if online_only and not friend.get('isOnline', False):
                continue
                
            friendship = FriendshipWithUser(
                **data,
                friend=friend,
                online_status=friend.get('isOnline', False),
                last_active=friend.get('lastActive')
            )
            friendships.append(friendship)
        
        # Sort by online status and last active
        friendships.sort(key=lambda f: (not f.online_status, f.last_active or datetime.min), reverse=True)
        
        # Paginate
        offset = (page - 1) * per_page
        paginated = friendships[offset:offset + per_page]
        
        return paginated
    
    async def remove_friend(self, user_id: str, friend_id: str) -> bool:
        """Remove a friend connection."""
        friendships_ref = self.db.collection('friendships')
        
        # Find the friendship document
        query1 = friendships_ref.where('user1Id', '==', user_id).where('user2Id', '==', friend_id)
        query2 = friendships_ref.where('user1Id', '==', friend_id).where('user2Id', '==', user_id)
        
        docs1 = query1.get()
        docs2 = query2.get()
        
        friendship_doc = None
        if docs1:
            friendship_doc = docs1[0]
        elif docs2:
            friendship_doc = docs2[0]
        
        if not friendship_doc:
            raise ValueError("Friendship not found")
        
        # Mark as inactive instead of deleting
        friendship_doc.reference.update({
            'isActive': False,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        return True
    
    async def get_friend_suggestions(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[FriendSuggestion]:
        """Get friend suggestions based on mutual friends."""
        # Get user's friends
        friends = await self.get_friends(user_id, per_page=100)
        friend_ids = {f.friend['uid'] for f in friends}
        
        # Get friends of friends
        suggestions_map = {}
        
        for friend in friends:
            friend_of_friends = await self._get_friend_ids(friend.friend['uid'])
            
            for fof_id in friend_of_friends:
                # Skip if already friends or is self
                if fof_id in friend_ids or fof_id == user_id:
                    continue
                
                # Check if blocked
                if await self._is_blocked(user_id, fof_id):
                    continue
                
                # Count mutual friends
                if fof_id not in suggestions_map:
                    suggestions_map[fof_id] = {
                        'mutual_friends': 0,
                        'mutual_friend_names': []
                    }
                
                suggestions_map[fof_id]['mutual_friends'] += 1
                suggestions_map[fof_id]['mutual_friend_names'].append(
                    friend.friend.get('displayName', friend.friend.get('email'))
                )
        
        # Sort by mutual friends count
        sorted_suggestions = sorted(
            suggestions_map.items(), 
            key=lambda x: x[1]['mutual_friends'], 
            reverse=True
        )[:limit]
        
        # Build suggestion objects
        suggestions = []
        for user_id, data in sorted_suggestions:
            user = await self.firebase_service.get_user(user_id)
            if user:
                suggestion = FriendSuggestion(
                    user_id=user_id,
                    user=user,
                    mutual_friends_count=data['mutual_friends'],
                    suggestion_reason=f"Mutual friends with {', '.join(data['mutual_friend_names'][:2])}",
                    score=min(data['mutual_friends'] / 10.0, 1.0)
                )
                suggestions.append(suggestion)
        
        return suggestions
    
    async def block_user(
        self, 
        blocker_id: str, 
        block_request: BlockUserRequest
    ) -> BlockedUser:
        """Block a user."""
        # Remove friend connection if exists
        try:
            await self.remove_friend(blocker_id, block_request.user_id)
        except ValueError:
            pass  # Not friends
        
        # Create block record
        block_data = {
            'blockerId': blocker_id,
            'blockedId': block_request.user_id,
            'reason': block_request.reason,
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = self.db.collection('blockedUsers').document()
        doc_ref.set(block_data)
        
        block_data['id'] = doc_ref.id
        block_data['createdAt'] = datetime.utcnow()
        
        return BlockedUser(**block_data)
    
    async def unblock_user(self, blocker_id: str, blocked_id: str) -> bool:
        """Unblock a user."""
        blocks_ref = self.db.collection('blockedUsers')
        query = blocks_ref.where('blockerId', '==', blocker_id).where('blockedId', '==', blocked_id)
        
        docs = query.get()
        if not docs:
            raise ValueError("User not blocked")
        
        for doc in docs:
            doc.reference.delete()
        
        return True
    
    async def update_privacy_settings(
        self, 
        user_id: str, 
        settings: FriendPrivacySettings
    ) -> FriendPrivacySettings:
        """Update user's friend privacy settings."""
        user_ref = self.db.collection('users').document(user_id)
        
        privacy_data = settings.dict()
        user_ref.update({
            'friendPrivacySettings': privacy_data
        })
        
        return settings
    
    # Helper methods
    async def _are_friends(self, user1_id: str, user2_id: str) -> bool:
        """Check if two users are friends."""
        friendships_ref = self.db.collection('friendships')
        
        query1 = friendships_ref.where('user1Id', '==', user1_id).where('user2Id', '==', user2_id).where('isActive', '==', True)
        query2 = friendships_ref.where('user1Id', '==', user2_id).where('user2Id', '==', user1_id).where('isActive', '==', True)
        
        return bool(query1.get()) or bool(query2.get())
    
    async def _get_pending_request(self, from_user_id: str, to_user_id: str) -> Optional[Dict]:
        """Get pending friend request between two users."""
        requests_ref = self.db.collection('friendRequests')
        
        # Check both directions
        query1 = requests_ref.where('fromUserId', '==', from_user_id).where('toUserId', '==', to_user_id).where('status', '==', 'pending')
        query2 = requests_ref.where('fromUserId', '==', to_user_id).where('toUserId', '==', from_user_id).where('status', '==', 'pending')
        
        docs1 = query1.get()
        docs2 = query2.get()
        
        if docs1:
            return docs1[0].to_dict()
        elif docs2:
            return docs2[0].to_dict()
        
        return None
    
    async def _is_blocked(self, user1_id: str, user2_id: str) -> bool:
        """Check if either user has blocked the other."""
        blocks_ref = self.db.collection('blockedUsers')
        
        query1 = blocks_ref.where('blockerId', '==', user1_id).where('blockedId', '==', user2_id)
        query2 = blocks_ref.where('blockerId', '==', user2_id).where('blockedId', '==', user1_id)
        
        return bool(query1.get()) or bool(query2.get())
    
    async def _get_blocked_user_ids(self, user_id: str) -> set:
        """Get IDs of users blocked by or who blocked the given user."""
        blocks_ref = self.db.collection('blockedUsers')
        
        blocked_by_user = blocks_ref.where('blockerId', '==', user_id).get()
        blocked_user = blocks_ref.where('blockedId', '==', user_id).get()
        
        blocked_ids = set()
        for doc in blocked_by_user:
            blocked_ids.add(doc.to_dict()['blockedId'])
        for doc in blocked_user:
            blocked_ids.add(doc.to_dict()['blockerId'])
        
        return blocked_ids
    
    async def _create_friendship(self, user1_id: str, user2_id: str, request_id: Optional[str] = None):
        """Create a friendship between two users."""
        friendship_data = {
            'user1Id': user1_id,
            'user2Id': user2_id,
            'isActive': True,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'fromRequestId': request_id
        }
        
        self.db.collection('friendships').add(friendship_data)
    
    async def _get_friend_ids(self, user_id: str) -> set:
        """Get IDs of user's friends."""
        friendships_ref = self.db.collection('friendships')
        
        query1 = friendships_ref.where('user1Id', '==', user_id).where('isActive', '==', True)
        query2 = friendships_ref.where('user2Id', '==', user_id).where('isActive', '==', True)
        
        friend_ids = set()
        
        for doc in query1.get():
            friend_ids.add(doc.to_dict()['user2Id'])
        
        for doc in query2.get():
            friend_ids.add(doc.to_dict()['user1Id'])
        
        return friend_ids
