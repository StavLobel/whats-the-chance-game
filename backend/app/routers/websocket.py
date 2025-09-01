"""
WebSocket Router
Real-time communication for the game

This module provides WebSocket endpoints for:
- Real-time challenge updates
- Live notifications
- User presence tracking
"""

import json
import logging
from typing import Dict, List, Optional, Set

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query
from firebase_admin import auth

logger = logging.getLogger(__name__)

router = APIRouter()

# Store active WebSocket connections
# Format: {user_id: [websocket1, websocket2, ...]}
active_connections: Dict[str, List[WebSocket]] = {}


class ConnectionManager:
    """Manages WebSocket connections for real-time communication."""
    
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
        
        # Notify others that user is online
        await self.broadcast_to_all({
            "type": "user_online",
            "data": {"userId": user_id}
        }, exclude_user=user_id)
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
                # Notify others that user is offline (async operation handled separately)
                return True  # User is now completely offline
        
        logger.info(f"User {user_id} disconnected. Remaining connections: {len(self.active_connections.get(user_id, []))}")
        return False
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send a message to all connections of a specific user."""
        if user_id in self.active_connections:
            disconnected = []
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {e}")
                    disconnected.append(websocket)
            
            # Clean up disconnected websockets
            for ws in disconnected:
                self.active_connections[user_id].discard(ws)
    
    async def broadcast_to_users(self, message: dict, user_ids: List[str], exclude_user: Optional[str] = None):
        """Broadcast a message to specific users."""
        for user_id in user_ids:
            if user_id != exclude_user:
                await self.send_personal_message(message, user_id)
    
    async def broadcast_to_all(self, message: dict, exclude_user: Optional[str] = None):
        """Broadcast a message to all connected users."""
        all_users = list(self.active_connections.keys())
        await self.broadcast_to_users(message, all_users, exclude_user)


# Create a connection manager instance
manager = ConnectionManager()


async def verify_token(token: str) -> Optional[dict]:
    """Verify Firebase auth token."""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return None


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="Firebase auth token")
):
    """
    WebSocket endpoint for real-time communication.
    
    Clients must provide a valid Firebase auth token as a query parameter.
    
    Message format:
    {
        "type": "message_type",
        "data": {...}
    }
    
    Supported message types:
    - ping: Keep-alive message
    - challenge_updated: Challenge state changed
    - challenge_created: New challenge created
    - number_submitted: Player submitted a number
    - challenge_completed: Challenge finished
    """
    # Verify token
    user_data = await verify_token(token)
    if not user_data:
        await websocket.close(code=4001, reason="Invalid authentication token")
        return
    
    user_id = user_data["uid"]
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Handle different message types
            message_type = data.get("type")
            
            if message_type == "ping":
                # Respond with pong
                await websocket.send_json({"type": "pong", "data": None})
            
            elif message_type == "challenge_created":
                # Broadcast to the challenged user
                challenge_data = data.get("data", {})
                to_user = challenge_data.get("to_user")
                if to_user:
                    await manager.send_personal_message({
                        "type": "challenge_created",
                        "data": challenge_data
                    }, to_user)
            
            elif message_type == "challenge_updated":
                # Broadcast to both users involved in the challenge
                challenge_data = data.get("data", {})
                from_user = challenge_data.get("from_user")
                to_user = challenge_data.get("to_user")
                
                users_to_notify = [u for u in [from_user, to_user] if u and u != user_id]
                if users_to_notify:
                    await manager.broadcast_to_users({
                        "type": "challenge_updated",
                        "data": challenge_data
                    }, users_to_notify)
            
            elif message_type == "number_submitted":
                # Notify the other player
                challenge_data = data.get("data", {})
                from_user = challenge_data.get("from_user")
                to_user = challenge_data.get("to_user")
                
                # Notify the other user
                other_user = to_user if user_id == from_user else from_user
                if other_user:
                    await manager.send_personal_message({
                        "type": "number_submitted",
                        "data": {
                            "challengeId": challenge_data.get("challengeId"),
                            "userId": user_id
                        }
                    }, other_user)
            
            elif message_type == "challenge_completed":
                # Broadcast completion to both users
                challenge_data = data.get("data", {})
                from_user = challenge_data.get("from_user")
                to_user = challenge_data.get("to_user")
                
                users_to_notify = [u for u in [from_user, to_user] if u]
                await manager.broadcast_to_users({
                    "type": "challenge_completed",
                    "data": challenge_data
                }, users_to_notify)
            
            else:
                logger.warning(f"Unknown message type: {message_type}")
    
    except WebSocketDisconnect:
        is_offline = manager.disconnect(websocket, user_id)
        if is_offline:
            # Notify others that user is offline
            await manager.broadcast_to_all({
                "type": "user_offline",
                "data": {"userId": user_id}
            })
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)


# Helper functions to send messages from other parts of the application

async def notify_challenge_created(from_user: str, to_user: str, challenge_data: dict):
    """Notify users about a new challenge."""
    await manager.send_personal_message({
        "type": "challenge_created",
        "data": challenge_data
    }, to_user)


async def notify_challenge_updated(challenge_data: dict):
    """Notify users about challenge updates."""
    from_user = challenge_data.get("from_user")
    to_user = challenge_data.get("to_user")
    
    if from_user and to_user:
        await manager.broadcast_to_users({
            "type": "challenge_updated",
            "data": challenge_data
        }, [from_user, to_user])


async def notify_challenge_completed(challenge_data: dict):
    """Notify users about challenge completion."""
    from_user = challenge_data.get("from_user")
    to_user = challenge_data.get("to_user")
    
    if from_user and to_user:
        await manager.broadcast_to_users({
            "type": "challenge_completed",
            "data": challenge_data
        }, [from_user, to_user])
