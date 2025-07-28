"""
Unit Tests for Firebase Service
Test Firebase Admin SDK integration and operations
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime

from app.services.firebase_service import FirebaseService


@pytest.fixture
def firebase_service():
    """Create a FirebaseService instance for testing."""
    with patch('app.services.firebase_service.firebase_admin'):
        with patch('app.services.firebase_service.firestore'):
            service = FirebaseService()
            yield service


@pytest.fixture
def mock_firebase_admin():
    """Mock Firebase Admin SDK."""
    with patch('app.services.firebase_service.firebase_admin') as mock:
        mock.get_app.side_effect = ValueError("No app initialized")
        yield mock


@pytest.fixture
def mock_firestore():
    """Mock Firestore client."""
    with patch('app.services.firebase_service.firestore') as mock:
        mock.client.return_value = Mock()
        yield mock


class TestFirebaseService:
    """Test cases for FirebaseService class."""
    
    @patch('app.services.firebase_service.settings')
    def test_initialization_with_service_account(self, mock_settings, mock_firebase_admin, mock_firestore):
        """Test Firebase initialization with service account credentials."""
        # Mock settings
        mock_settings.firebase_private_key = "test_private_key"
        mock_settings.firebase_client_email = "test@example.com"
        mock_settings.firebase_project_id = "test-project"
        mock_settings.firebase_private_key_id = "test_key_id"
        mock_settings.firebase_client_id = "test_client_id"
        mock_settings.firebase_auth_uri = "https://accounts.google.com/o/oauth2/auth"
        mock_settings.firebase_token_uri = "https://oauth2.googleapis.com/token"
        mock_settings.firebase_auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
        mock_settings.firebase_client_x509_cert_url = "https://www.googleapis.com/robot/v1/metadata/x509/test"
        
        # Mock Firebase Admin
        mock_firebase_admin.get_app.side_effect = ValueError("No app initialized")
        mock_cred = Mock()
        mock_firebase_admin.credentials.Certificate.return_value = mock_cred
        mock_firebase_admin.initialize_app.return_value = Mock()
        
        # Create service
        service = FirebaseService()
        
        # Assertions
        mock_firebase_admin.credentials.Certificate.assert_called_once()
        mock_firebase_admin.initialize_app.assert_called_once_with(mock_cred)
        assert service.db is not None
    
    @patch('app.services.firebase_service.settings')
    def test_initialization_with_default_credentials(self, mock_settings, mock_firebase_admin, mock_firestore):
        """Test Firebase initialization with default credentials."""
        # Mock settings without service account
        mock_settings.firebase_private_key = None
        mock_settings.firebase_client_email = None
        mock_settings.firebase_project_id = "test-project"
        
        # Mock Firebase Admin
        mock_firebase_admin.get_app.side_effect = ValueError("No app initialized")
        mock_firebase_admin.initialize_app.return_value = Mock()
        
        # Create service
        service = FirebaseService()
        
        # Assertions
        mock_firebase_admin.initialize_app.assert_called_once()
        assert service.db is not None
    
    @patch('app.services.firebase_service.settings')
    def test_initialization_already_initialized(self, mock_settings, mock_firebase_admin, mock_firestore):
        """Test Firebase initialization when already initialized."""
        # Mock settings
        mock_settings.firebase_project_id = "test-project"
        
        # Mock Firebase Admin as already initialized
        mock_firebase_admin.get_app.return_value = Mock()
        
        # Create service
        service = FirebaseService()
        
        # Assertions
        mock_firebase_admin.initialize_app.assert_not_called()
        assert service.db is not None


class TestFirebaseServiceAuthentication:
    """Test cases for Firebase authentication methods."""
    
    @pytest.mark.asyncio
    async def test_verify_id_token_success(self, firebase_service):
        """Test successful ID token verification."""
        # Mock Firebase Auth
        with patch('app.services.firebase_service.auth') as mock_auth:
            mock_auth.verify_id_token.return_value = {
                "uid": "test_uid",
                "email": "test@example.com",
                "email_verified": True,
                "name": "Test User",
                "picture": "https://example.com/photo.jpg"
            }
            
            # Test
            result = await firebase_service.verify_id_token("test_token")
            
            # Assertions
            mock_auth.verify_id_token.assert_called_once_with("test_token")
            assert result["uid"] == "test_uid"
            assert result["email"] == "test@example.com"
            assert result["email_verified"] is True
    
    @pytest.mark.asyncio
    async def test_verify_id_token_failure(self, firebase_service):
        """Test ID token verification failure."""
        # Mock Firebase Auth
        with patch('app.services.firebase_service.auth') as mock_auth:
            from firebase_admin.exceptions import FirebaseError
            mock_auth.verify_id_token.side_effect = FirebaseError("Invalid token")
            
            # Test
            with pytest.raises(FirebaseError):
                await firebase_service.verify_id_token("invalid_token")
    
    @pytest.mark.asyncio
    async def test_get_user_by_uid_success(self, firebase_service):
        """Test successful user retrieval by UID."""
        # Mock Firebase Auth
        with patch('app.services.firebase_service.auth') as mock_auth:
            mock_user = Mock()
            mock_user.uid = "test_uid"
            mock_user.email = "test@example.com"
            mock_user.email_verified = True
            mock_user.display_name = "Test User"
            mock_user.photo_url = "https://example.com/photo.jpg"
            mock_user.disabled = False
            
            mock_auth.get_user.return_value = mock_user
            
            # Test
            result = await firebase_service.get_user_by_uid("test_uid")
            
            # Assertions
            mock_auth.get_user.assert_called_once_with("test_uid")
            assert result["uid"] == "test_uid"
            assert result["email"] == "test@example.com"
            assert result["email_verified"] is True
    
    @pytest.mark.asyncio
    async def test_get_user_by_uid_not_found(self, firebase_service):
        """Test user retrieval when user not found."""
        # Mock Firebase Auth
        with patch('app.services.firebase_service.auth') as mock_auth:
            from firebase_admin.exceptions import FirebaseError
            mock_auth.get_user.side_effect = FirebaseError("User not found")
            
            # Test
            result = await firebase_service.get_user_by_uid("nonexistent_uid")
            
            # Assertions
            assert result is None


class TestFirebaseServiceFirestore:
    """Test cases for Firestore database operations."""
    
    @pytest.mark.asyncio
    async def test_create_document_success(self, firebase_service):
        """Test successful document creation."""
        # Mock Firestore
        mock_collection = Mock()
        mock_doc_ref = Mock()
        mock_doc_ref.id = "test_doc_id"
        mock_collection.add.return_value = (None, mock_doc_ref)
        firebase_service.db.collection.return_value = mock_collection
        
        # Test
        result = await firebase_service.create_document("test_collection", {"test": "data"})
        
        # Assertions
        assert result == "test_doc_id"
        mock_collection.add.assert_called_once_with({"test": "data"})
    
    @pytest.mark.asyncio
    async def test_create_document_with_custom_id(self, firebase_service):
        """Test document creation with custom ID."""
        # Mock Firestore
        mock_collection = Mock()
        mock_doc_ref = Mock()
        firebase_service.db.collection.return_value = mock_collection
        mock_collection.document.return_value = mock_doc_ref
        
        # Test
        result = await firebase_service.create_document(
            "test_collection", 
            {"test": "data"}, 
            document_id="custom_id"
        )
        
        # Assertions
        assert result == "custom_id"
        mock_collection.document.assert_called_once_with("custom_id")
        mock_doc_ref.set.assert_called_once_with({"test": "data"})
    
    @pytest.mark.asyncio
    async def test_get_document_success(self, firebase_service):
        """Test successful document retrieval."""
        # Mock Firestore
        mock_collection = Mock()
        mock_doc_ref = Mock()
        mock_doc = Mock()
        mock_doc.exists = True
        mock_doc.id = "test_doc_id"
        mock_doc.to_dict.return_value = {"test": "data"}
        mock_doc_ref.get.return_value = mock_doc
        mock_collection.document.return_value = mock_doc_ref
        firebase_service.db.collection.return_value = mock_collection
        
        # Test
        result = await firebase_service.get_document("test_collection", "test_doc_id")
        
        # Assertions
        assert result["id"] == "test_doc_id"
        assert result["test"] == "data"
    
    @pytest.mark.asyncio
    async def test_get_document_not_found(self, firebase_service):
        """Test document retrieval when document doesn't exist."""
        # Mock Firestore
        mock_collection = Mock()
        mock_doc_ref = Mock()
        mock_doc = Mock()
        mock_doc.exists = False
        mock_doc_ref.get.return_value = mock_doc
        mock_collection.document.return_value = mock_doc_ref
        firebase_service.db.collection.return_value = mock_collection
        
        # Test
        result = await firebase_service.get_document("test_collection", "nonexistent_id")
        
        # Assertions
        assert result is None
    
    @pytest.mark.asyncio
    async def test_update_document_success(self, firebase_service):
        """Test successful document update."""
        # Mock Firestore
        mock_collection = Mock()
        mock_doc_ref = Mock()
        mock_collection.document.return_value = mock_doc_ref
        
        # Test
        result = await firebase_service.update_document(
            "test_collection", 
            "test_doc_id", 
            {"updated": "data"}
        )
        
        # Assertions
        assert result is True
        mock_doc_ref.update.assert_called_once_with({"updated": "data"})
    
    @pytest.mark.asyncio
    async def test_delete_document_success(self, firebase_service):
        """Test successful document deletion."""
        # Mock Firestore
        mock_collection = Mock()
        mock_doc_ref = Mock()
        mock_collection.document.return_value = mock_doc_ref
        
        # Test
        result = await firebase_service.delete_document("test_collection", "test_doc_id")
        
        # Assertions
        assert result is True
        mock_doc_ref.delete.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_query_documents_success(self, firebase_service):
        """Test successful document querying."""
        # Mock Firestore
        mock_collection = Mock()
        mock_query = Mock()
        mock_docs = [
            Mock(id="doc1", to_dict=lambda: {"field": "value1"}),
            Mock(id="doc2", to_dict=lambda: {"field": "value2"}),
        ]
        mock_collection.where.return_value = mock_query
        mock_query.stream.return_value = mock_docs
        firebase_service.db.collection.return_value = mock_collection
        
        # Test
        result = await firebase_service.query_documents("test_collection", "field", "==", "value")
        
        # Assertions
        assert len(result) == 2
        assert result[0]["id"] == "doc1"
        assert result[0]["field"] == "value1"
        assert result[1]["id"] == "doc2"
        assert result[1]["field"] == "value2"


class TestFirebaseServiceFCM:
    """Test cases for Firebase Cloud Messaging operations."""
    
    @pytest.mark.asyncio
    async def test_send_notification_success(self, firebase_service):
        """Test successful notification sending."""
        # Mock Firebase Messaging
        with patch('app.services.firebase_service.messaging') as mock_messaging:
            mock_messaging.Message.return_value = Mock()
            mock_messaging.send.return_value = "message_id"
            
            # Test
            result = await firebase_service.send_notification(
                "test_token",
                "Test Title",
                "Test Body",
                {"key": "value"}
            )
            
            # Assertions
            assert result is True
            mock_messaging.send.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_send_notification_to_topic_success(self, firebase_service):
        """Test successful topic notification sending."""
        # Mock Firebase Messaging
        with patch('app.services.firebase_service.messaging') as mock_messaging:
            mock_messaging.Message.return_value = Mock()
            mock_messaging.send.return_value = "message_id"
            
            # Test
            result = await firebase_service.send_notification_to_topic(
                "test_topic",
                "Test Title",
                "Test Body",
                {"key": "value"}
            )
            
            # Assertions
            assert result is True
            mock_messaging.send.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_subscribe_to_topic_success(self, firebase_service):
        """Test successful topic subscription."""
        # Mock Firebase Messaging
        with patch('app.services.firebase_service.messaging') as mock_messaging:
            mock_messaging.subscribe_to_topic.return_value = Mock()
            
            # Test
            result = await firebase_service.subscribe_to_topic(
                ["token1", "token2"],
                "test_topic"
            )
            
            # Assertions
            assert result is True
            mock_messaging.subscribe_to_topic.assert_called_once_with(
                ["token1", "token2"],
                "test_topic"
            )
    
    @pytest.mark.asyncio
    async def test_unsubscribe_from_topic_success(self, firebase_service):
        """Test successful topic unsubscription."""
        # Mock Firebase Messaging
        with patch('app.services.firebase_service.messaging') as mock_messaging:
            mock_messaging.unsubscribe_from_topic.return_value = Mock()
            
            # Test
            result = await firebase_service.unsubscribe_from_topic(
                ["token1", "token2"],
                "test_topic"
            )
            
            # Assertions
            assert result is True
            mock_messaging.unsubscribe_from_topic.assert_called_once_with(
                ["token1", "token2"],
                "test_topic"
            ) 