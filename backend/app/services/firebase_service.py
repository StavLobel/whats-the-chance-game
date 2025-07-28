"""
Firebase Service Module
Firebase Admin SDK Integration for Backend Operations

This module provides Firebase Admin SDK integration for:
- User authentication and token validation
- Firestore database operations
- Firebase Cloud Messaging (FCM) for push notifications
"""

import json
import logging
from typing import Any, Dict, List, Optional, Union

import firebase_admin
from firebase_admin import auth, credentials, firestore, messaging
from firebase_admin.exceptions import FirebaseError
from google.cloud.firestore_v1.base_document import DocumentSnapshot
from google.cloud.firestore_v1.base_query import FieldFilter

from app.core.config import settings

logger = logging.getLogger(__name__)


class FirebaseService:
    """Firebase Admin SDK service for backend operations."""
    
    def __init__(self):
        """Initialize Firebase Admin SDK."""
        self._initialize_firebase()
        self.db = firestore.client()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK with credentials."""
        try:
            # Check if Firebase app is already initialized
            firebase_admin.get_app()
            logger.info("Firebase Admin SDK already initialized")
        except ValueError:
            # Initialize Firebase Admin SDK
            if all([
                settings.firebase_private_key,
                settings.firebase_client_email,
                settings.firebase_project_id
            ]):
                # Use service account credentials
                cred_dict = {
                    "type": "service_account",
                    "project_id": settings.firebase_project_id,
                    "private_key_id": settings.firebase_private_key_id,
                    "private_key": settings.firebase_private_key,
                    "client_email": settings.firebase_client_email,
                    "client_id": settings.firebase_client_id,
                    "auth_uri": settings.firebase_auth_uri,
                    "token_uri": settings.firebase_token_uri,
                    "auth_provider_x509_cert_url": settings.firebase_auth_provider_x509_cert_url,
                    "client_x509_cert_url": settings.firebase_client_x509_cert_url,
                }
                
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized with service account")
            else:
                # Use default credentials (for development)
                firebase_admin.initialize_app()
                logger.info("Firebase Admin SDK initialized with default credentials")
    
    # Authentication Methods
    async def verify_id_token(self, id_token: str) -> Dict[str, Any]:
        """
        Verify Firebase ID token and return user information.
        
        Args:
            id_token: Firebase ID token from client
            
        Returns:
            Dict containing user information
            
        Raises:
            FirebaseError: If token is invalid
        """
        try:
            decoded_token = auth.verify_id_token(id_token)
            return {
                "uid": decoded_token["uid"],
                "email": decoded_token.get("email"),
                "email_verified": decoded_token.get("email_verified", False),
                "name": decoded_token.get("name"),
                "picture": decoded_token.get("picture"),
            }
        except FirebaseError as e:
            logger.error(f"Failed to verify ID token: {e}")
            raise
    
    async def get_user_by_uid(self, uid: str) -> Optional[Dict[str, Any]]:
        """
        Get user information by UID.
        
        Args:
            uid: Firebase user UID
            
        Returns:
            User information dict or None if not found
        """
        try:
            user_record = auth.get_user(uid)
            return {
                "uid": user_record.uid,
                "email": user_record.email,
                "email_verified": user_record.email_verified,
                "display_name": user_record.display_name,
                "photo_url": user_record.photo_url,
                "disabled": user_record.disabled,
            }
        except FirebaseError as e:
            logger.error(f"Failed to get user by UID {uid}: {e}")
            return None
    
    # Firestore Database Methods
    def _get_collection(self, collection_name: str):
        """Get Firestore collection with optional prefix."""
        full_name = f"{settings.firestore_collection_prefix}{collection_name}"
        return self.db.collection(full_name)
    
    async def create_document(
        self, 
        collection_name: str, 
        data: Dict[str, Any],
        document_id: Optional[str] = None
    ) -> str:
        """
        Create a new document in Firestore.
        
        Args:
            collection_name: Name of the collection
            data: Document data
            document_id: Optional custom document ID
            
        Returns:
            Document ID of the created document
        """
        try:
            collection = self._get_collection(collection_name)
            if document_id:
                doc_ref = collection.document(document_id)
                doc_ref.set(data)
                return document_id
            else:
                doc_ref = collection.add(data)[1]
                return doc_ref.id
        except Exception as e:
            logger.error(f"Failed to create document in {collection_name}: {e}")
            raise
    
    async def get_document(
        self, 
        collection_name: str, 
        document_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a document from Firestore.
        
        Args:
            collection_name: Name of the collection
            document_id: Document ID
            
        Returns:
            Document data or None if not found
        """
        try:
            doc_ref = self._get_collection(collection_name).document(document_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return {"id": doc.id, **doc.to_dict()}
            return None
        except Exception as e:
            logger.error(f"Failed to get document {document_id} from {collection_name}: {e}")
            raise
    
    async def update_document(
        self, 
        collection_name: str, 
        document_id: str, 
        data: Dict[str, Any]
    ) -> bool:
        """
        Update a document in Firestore.
        
        Args:
            collection_name: Name of the collection
            document_id: Document ID
            data: Data to update
            
        Returns:
            True if successful, False otherwise
        """
        try:
            doc_ref = self._get_collection(collection_name).document(document_id)
            doc_ref.update(data)
            return True
        except Exception as e:
            logger.error(f"Failed to update document {document_id} in {collection_name}: {e}")
            return False
    
    async def delete_document(self, collection_name: str, document_id: str) -> bool:
        """
        Delete a document from Firestore.
        
        Args:
            collection_name: Name of the collection
            document_id: Document ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            doc_ref = self._get_collection(collection_name).document(document_id)
            doc_ref.delete()
            return True
        except Exception as e:
            logger.error(f"Failed to delete document {document_id} from {collection_name}: {e}")
            return False
    
    async def query_documents(
        self, 
        collection_name: str, 
        field: str, 
        operator: str, 
        value: Any
    ) -> List[Dict[str, Any]]:
        """
        Query documents in Firestore.
        
        Args:
            collection_name: Name of the collection
            field: Field to query on
            operator: Query operator (==, !=, >, <, >=, <=, in, not-in, array-contains, etc.)
            value: Value to compare against
            
        Returns:
            List of matching documents
        """
        try:
            collection = self._get_collection(collection_name)
            query = collection.where(field, operator, value)
            docs = query.stream()
            
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            logger.error(f"Failed to query documents in {collection_name}: {e}")
            raise
    
    async def query_documents_multiple(
        self, 
        collection_name: str, 
        filters: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Query documents with multiple filters.
        
        Args:
            collection_name: Name of the collection
            filters: List of filter dicts with 'field', 'operator', 'value' keys
            
        Returns:
            List of matching documents
        """
        try:
            collection = self._get_collection(collection_name)
            query = collection
            
            for filter_dict in filters:
                field = filter_dict["field"]
                operator = filter_dict["operator"]
                value = filter_dict["value"]
                query = query.where(field, operator, value)
            
            docs = query.stream()
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            logger.error(f"Failed to query documents with multiple filters in {collection_name}: {e}")
            raise
    
    # Firebase Cloud Messaging (FCM) Methods
    async def send_notification(
        self, 
        token: str, 
        title: str, 
        body: str, 
        data: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Send push notification to a specific device.
        
        Args:
            token: FCM device token
            title: Notification title
            body: Notification body
            data: Optional data payload
            
        Returns:
            True if successful, False otherwise
        """
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                token=token
            )
            
            response = messaging.send(message)
            logger.info(f"Successfully sent notification: {response}")
            return True
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return False
    
    async def send_notification_to_topic(
        self, 
        topic: str, 
        title: str, 
        body: str, 
        data: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Send push notification to a topic.
        
        Args:
            topic: FCM topic name
            title: Notification title
            body: Notification body
            data: Optional data payload
            
        Returns:
            True if successful, False otherwise
        """
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                topic=topic
            )
            
            response = messaging.send(message)
            logger.info(f"Successfully sent notification to topic {topic}: {response}")
            return True
        except Exception as e:
            logger.error(f"Failed to send notification to topic {topic}: {e}")
            return False
    
    async def subscribe_to_topic(self, tokens: List[str], topic: str) -> bool:
        """
        Subscribe devices to a topic.
        
        Args:
            tokens: List of FCM device tokens
            topic: Topic name to subscribe to
            
        Returns:
            True if successful, False otherwise
        """
        try:
            response = messaging.subscribe_to_topic(tokens, topic)
            logger.info(f"Successfully subscribed {len(tokens)} devices to topic {topic}")
            return True
        except Exception as e:
            logger.error(f"Failed to subscribe devices to topic {topic}: {e}")
            return False
    
    async def unsubscribe_from_topic(self, tokens: List[str], topic: str) -> bool:
        """
        Unsubscribe devices from a topic.
        
        Args:
            tokens: List of FCM device tokens
            topic: Topic name to unsubscribe from
            
        Returns:
            True if successful, False otherwise
        """
        try:
            response = messaging.unsubscribe_from_topic(tokens, topic)
            logger.info(f"Successfully unsubscribed {len(tokens)} devices from topic {topic}")
            return True
        except Exception as e:
            logger.error(f"Failed to unsubscribe devices from topic {topic}: {e}")
            return False


# Create global Firebase service instance
firebase_service = FirebaseService() 