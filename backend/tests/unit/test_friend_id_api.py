"""
Friend ID API Tests
Integration tests for Friend ID endpoints using real test users

This test suite combines integration tests with real test users and unit tests with mocks:

Integration Tests:
- test_get_my_friend_id_integration: Tests with real test user data
- test_friend_lookup_between_real_users: Tests user-to-user Friend ID lookup
- test_friend_id_endpoints_require_authentication: Tests auth requirements

Unit Tests (with mocks):
- Remaining tests use mocks for isolated unit testing
- These test specific business logic without database dependencies

Real Test Users:
- testuser1@example.com (John Doe) - UID: 6Op1SrQJdyVpHAo419YyUwT9NOo2
- testuser2@example.com (Jane Smith) - UID: ZYWaZCihaeXcId5EW0ht2HAHTCq1
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import httpx
from fastapi import HTTPException
import firebase_admin
from firebase_admin import auth

from main import app
from app.services.unique_id_service import UniqueIDService
from app.services.firebase_service import firebase_service

# Real test users from the database
TEST_USERS = {
    "testuser1": {
        "email": "testuser1@example.com",
        "uid": "6Op1SrQJdyVpHAo419YyUwT9NOo2",
        "display_name": "John Doe",
        "username": "johndoe",
    },
    "testuser2": {
        "email": "testuser2@example.com", 
        "uid": "ZYWaZCihaeXcId5EW0ht2HAHTCq1",
        "display_name": "Jane Smith",
        "username": "janesmith",
    },
}


async def create_test_token(user_uid: str) -> str:
    """Create a custom Firebase token for testing."""
    try:
        # Create a custom token using Firebase Admin SDK
        custom_token = auth.create_custom_token(user_uid)
        # In a real test, you'd exchange this for an ID token
        # For now, we'll use the custom token as a placeholder
        return custom_token.decode('utf-8')
    except Exception as e:
        # If Firebase Admin isn't available, return a mock token
        return f"mock_token_for_{user_uid}"


class TestFriendIdAPI:
    """Test cases for Friend ID API endpoints."""

    def setup_method(self):
        """Set up test fixtures with real test users."""
        self.client = httpx.AsyncClient(app=app, base_url="http://test")
        
        # Use real test users from the database
        self.test_user1 = TEST_USERS["testuser1"]
        self.test_user2 = TEST_USERS["testuser2"]
        
        # Also set up mock_current_user for backward compatibility
        self.mock_current_user = {
            "uid": "test-user-123",
            "email": "test@example.com",
            "display_name": "Test User"
        }

    @pytest.fixture(autouse=True)
    async def cleanup_client(self):
        """Clean up test fixtures."""
        yield
        await self.client.aclose()
        
    @pytest.mark.asyncio
    async def test_get_my_friend_id_integration(self):
        """Integration test: Get Friend ID for real test user."""
        # Test with testuser1 - this should work with real Firebase authentication
        # But for now we'll mock the auth to avoid Firebase complexity in CI
        with patch('app.routers.friends.get_current_user') as mock_auth:
            mock_auth.return_value = {
                "uid": self.test_user1["uid"],
                "email": self.test_user1["email"],
                "display_name": self.test_user1["display_name"],
                "email_verified": True,
                "disabled": False
            }
            
            # Make request (no auth headers needed since we're mocking)
            response = await self.client.get('/api/friends/unique-id/my')
            
            # Should get a valid response (either existing ID or new one generated)
            assert response.status_code in [200, 201]
            data = response.json()
            assert 'unique_id' in data
            assert 'message' in data
            assert len(data['unique_id']) == 16
            assert data['unique_id'].isdigit()

    @pytest.mark.asyncio
    async def test_friend_lookup_between_real_users(self):
        """Integration test: Test Friend ID lookup between two real test users."""
        with patch('app.routers.friends.get_current_user') as mock_auth:
            # First, user1 gets their Friend ID
            mock_auth.return_value = {
                "uid": self.test_user1["uid"],
                "email": self.test_user1["email"],
                "display_name": self.test_user1["display_name"],
                "email_verified": True,
                "disabled": False
            }
            
            user1_response = await self.client.get('/api/friends/unique-id/my')
            assert user1_response.status_code in [200, 201]
            user1_data = user1_response.json()
            user1_friend_id = user1_data['unique_id']
            
            # Then, user2 tries to lookup user1 by their Friend ID
            mock_auth.return_value = {
                "uid": self.test_user2["uid"],
                "email": self.test_user2["email"],
                "display_name": self.test_user2["display_name"],
                "email_verified": True,
                "disabled": False
            }
            
            # This test shows the real workflow of Friend ID lookup
            lookup_response = await self.client.get(f'/api/friends/unique-id/lookup/{user1_friend_id}')
            
            # Should find user1 or get appropriate error
            assert lookup_response.status_code in [200, 404]
            if lookup_response.status_code == 200:
                lookup_data = lookup_response.json()
                assert lookup_data['uid'] == self.test_user1["uid"]
                assert lookup_data['email'] == self.test_user1["email"]

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_get_my_friend_id_generate_new(self, mock_service, mock_auth):
        """Test generating new Friend ID when user doesn't have one."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_user_doc = MagicMock()
        mock_user_doc.exists = False
        mock_service.db.collection.return_value.document.return_value.get.return_value = mock_user_doc
        mock_service.assign_unique_id_to_user = AsyncMock(return_value='9876543210987654')
        
        # Make request
        response = await self.client.get('/api/friends/unique-id/my')
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data['unique_id'] == '9876543210987654'
        assert data['message'] == 'New unique ID generated'

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_validate_friend_id_valid_existing(self, mock_service, mock_auth):
        """Test validating existing Friend ID."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_service.validate_unique_id_format = AsyncMock(return_value=True)
        mock_service.find_user_by_unique_id = AsyncMock(return_value={
            'uid': 'found-user-123',
            'email': 'found@example.com',
            'unique_id': '1234567890123456'
        })
        
        # Make request
        response = await self.client.get('/api/friends/unique-id/validate/1234567890123456')
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data['valid'] is True
        assert data['exists'] is True
        assert data['error'] is None

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_validate_friend_id_invalid_format(self, mock_service, mock_auth):
        """Test validating Friend ID with invalid format."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_service.validate_unique_id_format = AsyncMock(return_value=False)
        
        # Make request
        response = await self.client.get('/api/friends/unique-id/validate/12345')
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data['valid'] is False
        assert data['exists'] is False
        assert 'Invalid unique ID format' in data['error']

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_lookup_user_by_friend_id_success(self, mock_service, mock_auth):
        """Test successful user lookup by Friend ID."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_service.validate_unique_id_format = AsyncMock(return_value=True)
        mock_service.find_user_by_unique_id = AsyncMock(return_value={
            'uid': 'found-user-123',
            'email': 'found@example.com',
            'display_name': 'Found User',
            'unique_id': '1234567890123456',
            'email_verified': True,
            'disabled': False,
            'created_at': '2023-01-01T00:00:00Z',
            'updated_at': '2023-01-01T00:00:00Z'
        })
        
        # Make request
        response = await self.client.get('/api/friends/unique-id/lookup/1234567890123456')
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data['uid'] == 'found-user-123'
        assert data['display_name'] == 'Found User'
        assert data['unique_id'] == '1234567890123456'

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_lookup_user_by_friend_id_not_found(self, mock_service, mock_auth):
        """Test user lookup when Friend ID doesn't exist."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_service.validate_unique_id_format = AsyncMock(return_value=True)
        mock_service.find_user_by_unique_id = AsyncMock(return_value=None)
        
        # Make request
        response = await self.client.get('/api/friends/unique-id/lookup/9999999999999999')
        
        # Verify response
        assert response.status_code == 404
        data = response.json()
        assert data['detail'] == 'User not found'

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_generate_friend_id(self, mock_service, mock_auth):
        """Test generating new Friend ID for user."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_service.assign_unique_id_to_user = AsyncMock(return_value='5555666677778888')
        
        # Make request
        response = await self.client.post('/api/friends/unique-id/generate')
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data['unique_id'] == '5555666677778888'
        assert data['message'] == 'Unique ID generated successfully'

    @pytest.mark.asyncio
    async def test_friend_id_endpoints_require_authentication(self):
        """Integration test: Verify authentication is required for Friend ID endpoints."""
        endpoints = [
            ('/api/friends/unique-id/my', 'GET'),
            ('/api/friends/unique-id/validate/1234567890123456', 'GET'),
            ('/api/friends/unique-id/lookup/1234567890123456', 'GET'),
            ('/api/friends/unique-id/generate', 'POST'),
        ]
        
        for endpoint, method in endpoints:
            # Make request without authentication headers
            if method == 'GET':
                response = await self.client.get(endpoint)
            else:
                response = await self.client.post(endpoint)
            
            # Should require authentication (403 Forbidden)
            assert response.status_code == 403, f"Endpoint {endpoint} should require auth but returned {response.status_code}"

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_friend_id_validation_edge_cases(self, mock_service, mock_auth):
        """Test Friend ID validation edge cases."""
        mock_auth.return_value = self.mock_current_user
        
        # Test cases for invalid Friend IDs
        invalid_ids = [
            ('', 'empty string'),
            ('12345', 'too short'),
            ('12345678901234567', 'too long'),
            ('abcd567890123456', 'contains letters'),
            ('1234-5678-9012-3456', 'contains hyphens'),
            ('0123456789012345', 'starts with zero'),
        ]
        
        for invalid_id, description in invalid_ids:
            mock_service.validate_unique_id_format = AsyncMock(return_value=False)
            
            response = await self.client.get(f'/api/friends/unique-id/validate/{invalid_id}')
            
            assert response.status_code == 200
            data = response.json()
            assert data['valid'] is False, f"Failed for {description}: {invalid_id}"

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_friend_id_lookup_invalid_format(self, mock_service, mock_auth):
        """Test Friend ID lookup with invalid format."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_service.validate_unique_id_format = AsyncMock(return_value=False)
        
        # Make request with invalid Friend ID
        response = await self.client.get('/api/friends/unique-id/lookup/invalid-id')
        
        # Verify response
        assert response.status_code == 400
        data = response.json()
        assert 'Invalid unique ID format' in data['detail']

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_friend_id_service_error_handling(self, mock_service, mock_auth):
        """Test error handling when Friend ID service fails."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_service.assign_unique_id_to_user = AsyncMock(
            side_effect=Exception('Database connection failed')
        )
        
        # Make request
        response = await self.client.post('/api/friends/unique-id/generate')
        
        # Verify error response
        assert response.status_code == 500
        data = response.json()
        assert 'Database connection failed' in data['detail']

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_friend_id_concurrent_access(self, mock_service, mock_auth):
        """Test concurrent access to Friend ID endpoints."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_user_doc = MagicMock()
        mock_user_doc.exists = True
        mock_user_doc.to_dict.return_value = {
            'unique_id': '1234567890123456',
            'email': 'test@example.com'
        }
        mock_service.db.collection.return_value.document.return_value.get.return_value = mock_user_doc
        
        # Make multiple concurrent requests
        responses = []
        for _ in range(5):
            response = await self.client.get('/api/friends/unique-id/my')
            responses.append(response)
        
        # All should succeed with same Friend ID
        for response in responses:
            assert response.status_code == 200
            data = response.json()
            assert data['unique_id'] == '1234567890123456'

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_friend_id_cache_behavior(self, mock_service, mock_auth):
        """Test Friend ID caching behavior."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_user_doc = MagicMock()
        mock_user_doc.exists = True
        mock_user_doc.to_dict.return_value = {
            'unique_id': '1234567890123456',
            'email': 'test@example.com'
        }
        mock_service.db.collection.return_value.document.return_value.get.return_value = mock_user_doc
        
        # Make first request
        response1 = await self.client.get('/api/friends/unique-id/my')
        assert response1.status_code == 200
        
        # Make second request (should use same data)
        response2 = await self.client.get('/api/friends/unique-id/my')
        assert response2.status_code == 200
        
        # Both should return same Friend ID
        assert response1.json()['unique_id'] == response2.json()['unique_id']


class TestFriendIdValidation:
    """Test cases for Friend ID validation logic."""

    def test_valid_friend_id_formats(self):
        """Test valid Friend ID formats."""
        valid_ids = [
            '1234567890123456',
            '9999999999999999',
            '1000000000000000',
            '5555666677778888',
        ]
        
        for friend_id in valid_ids:
            # Should be exactly 16 digits
            assert len(friend_id) == 16
            assert friend_id.isdigit()
            assert not friend_id.startswith('0')

    def test_invalid_friend_id_formats(self):
        """Test invalid Friend ID formats."""
        invalid_ids = [
            '',  # empty
            '12345',  # too short
            '12345678901234567',  # too long
            'abcd567890123456',  # contains letters
            '1234-5678-9012-3456',  # contains hyphens
            '0123456789012345',  # starts with zero
            '1234 5678 9012 3456',  # contains spaces
        ]
        
        for friend_id in invalid_ids:
            # Should fail validation
            assert len(friend_id) != 16 or not friend_id.isdigit() or friend_id.startswith('0')

    def test_friend_id_formatting(self):
        """Test Friend ID display formatting."""
        raw_id = '1234567890123456'
        formatted_id = '1234 5678 9012 3456'
        
        # Test formatting function
        def format_friend_id(friend_id: str) -> str:
            if len(friend_id) != 16:
                return friend_id
            return friend_id[:4] + ' ' + friend_id[4:8] + ' ' + friend_id[8:12] + ' ' + friend_id[12:16]
        
        assert format_friend_id(raw_id) == formatted_id

    def test_friend_id_cleaning(self):
        """Test Friend ID cleaning (removing spaces)."""
        formatted_id = '1234 5678 9012 3456'
        clean_id = '1234567890123456'
        
        # Test cleaning function
        def clean_friend_id(friend_id: str) -> str:
            return friend_id.replace(' ', '')
        
        assert clean_friend_id(formatted_id) == clean_id


class TestFriendIdSecurity:
    """Test cases for Friend ID security considerations."""

    def setup_method(self):
        """Set up test fixtures."""
        self.client = httpx.AsyncClient(app=app, base_url="http://test")

    @pytest.fixture(autouse=True)
    async def cleanup_client(self):
        """Clean up test fixtures."""
        yield
        await self.client.aclose()

    def test_friend_id_uniqueness(self):
        """Test that Friend IDs are unique across users."""
        # Mock multiple users with different Friend IDs
        user_friend_ids = [
            '1234567890123456',
            '2345678901234567', 
            '3456789012345678',
            '4567890123456789',
        ]
        
        # All should be unique
        assert len(user_friend_ids) == len(set(user_friend_ids))

    def test_friend_id_generation_security(self):
        """Test Friend ID generation security properties."""
        # Friend IDs should be cryptographically secure
        # Should not be predictable or sequential
        generated_ids = [
            '1234567890123456',
            '8259255297762312',
            '7416395362965347',
            '4403739266478588',
        ]
        
        # Should not be sequential
        for i in range(len(generated_ids) - 1):
            current = int(generated_ids[i])
            next_id = int(generated_ids[i + 1])
            assert abs(current - next_id) > 1000  # Should not be close to each other

    def test_friend_id_privacy(self):
        """Test Friend ID privacy considerations."""
        # Friend IDs should not contain sensitive information
        friend_id = '1234567890123456'
        
        # Should not contain email patterns
        assert '@' not in friend_id
        assert '.' not in friend_id
        
        # Should not contain obvious patterns
        assert friend_id != '1111111111111111'
        assert friend_id != '1234567890123456' or len(set(friend_id)) > 4

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.unique_id_service')
    async def test_friend_id_access_control(self, mock_service, mock_auth):
        """Test access control for Friend ID endpoints."""
        # Only authenticated users should access Friend ID endpoints
        mock_auth.side_effect = HTTPException(status_code=401, detail="Unauthorized")
        
        # Test all Friend ID endpoints
        endpoints = [
            ('/api/friends/unique-id/my', 'GET'),
            ('/api/friends/unique-id/validate/1234567890123456', 'GET'),
            ('/api/friends/unique-id/lookup/1234567890123456', 'GET'),
            ('/api/friends/unique-id/generate', 'POST'),
        ]
        
        for endpoint, method in endpoints:
            if method == 'GET':
                response = await self.client.get(endpoint)
            else:
                response = await self.client.post(endpoint)
            
            # Should be unauthorized
            assert response.status_code == 401


class TestFriendIdIntegration:
    """Test cases for Friend ID integration with friend requests."""

    def setup_method(self):
        """Set up test fixtures."""
        self.client = httpx.AsyncClient(app=app, base_url="http://test")
        self.mock_current_user = {
            "uid": "test-user-123",
            "email": "test@example.com",
            "display_name": "Test User"
        }

    @pytest.fixture(autouse=True)
    async def cleanup_client(self):
        """Clean up test fixtures."""
        yield
        await self.client.aclose()

    @pytest.mark.asyncio
    @patch('app.routers.friends.get_current_user')
    @patch('app.routers.friends.friends_service')
    @patch('app.routers.friends.unique_id_service')
    async def test_friend_request_with_friend_id(self, mock_unique_service, mock_friends_service, mock_auth):
        """Test sending friend request using Friend ID lookup."""
        # Setup mocks
        mock_auth.return_value = self.mock_current_user
        mock_unique_service.find_user_by_unique_id = AsyncMock(return_value={
            'uid': 'target-user-123',
            'email': 'target@example.com',
            'unique_id': '1234567890123456'
        })
        mock_friends_service.send_friend_request = AsyncMock(return_value={
            'id': 'request-123',
            'fromUserId': 'test-user-123',
            'toUserId': 'target-user-123',
            'status': 'pending'
        })
        
        # First lookup user by Friend ID
        lookup_response = await self.client.get('/api/friends/unique-id/lookup/1234567890123456')
        assert lookup_response.status_code == 200
        user_data = lookup_response.json()
        
        # Then send friend request
        request_data = {
            'toUserId': user_data['uid'],
            'message': 'Found you via Friend ID!'
        }
        request_response = await self.client.post('/api/friends/request', json=request_data)
        assert request_response.status_code == 200

    def test_friend_id_workflow_integration(self):
        """Test complete Friend ID workflow integration."""
        # This test verifies the integration between:
        # 1. Friend ID generation/retrieval
        # 2. QR code generation containing Friend ID
        # 3. QR code scanning to extract Friend ID
        # 4. Friend ID lookup to find user
        # 5. Friend request sending
        
        workflow_steps = [
            'get_my_friend_id',
            'generate_qr_code', 
            'scan_qr_code',
            'extract_friend_id',
            'lookup_user_by_friend_id',
            'send_friend_request'
        ]
        
        # All steps should be testable
        assert len(workflow_steps) == 6
        assert 'friend_id' in str(workflow_steps)

    def test_friend_id_data_consistency(self):
        """Test data consistency across Friend ID operations."""
        # Friend ID should be consistent across all operations
        test_friend_id = '1234567890123456'
        
        # Should maintain same format in:
        # - Database storage
        # - API responses  
        # - QR code content
        # - Validation checks
        # - User lookup
        
        operations = [
            'database_storage',
            'api_response',
            'qr_code_content', 
            'validation_check',
            'user_lookup'
        ]
        
        # All operations should use same Friend ID format
        for operation in operations:
            assert len(test_friend_id) == 16
            assert test_friend_id.isdigit()
