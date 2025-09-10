"""
Test cases for user lookup API endpoints.
Tests the fix for issue #50: Challenge activity shows user ID instead of username.
"""

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import get_current_user

client = TestClient(app)


class TestUsersAPI:
    """Test cases for user lookup API endpoints."""

    @pytest.fixture
    def mock_current_user(self):
        """Mock current user for authentication."""
        return {
            "uid": "test_user_123",
            "email": "test@example.com",
            "email_verified": True,
            "display_name": "Test User",
            "photo_url": "https://example.com/photo.jpg",
            "disabled": False,
        }

    @pytest.fixture
    def mock_firebase_service(self):
        """Mock Firebase service for user lookups."""
        with patch('app.routers.users.firebase_service') as mock_service:
            yield mock_service

    @patch('app.routers.users.get_current_user')
    async def test_get_user_success_with_username(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test successful user lookup with username as display name."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(return_value={
            "uid": "user123",
            "username": "johndoe",
            "displayName": "John Doe",
            "display_name": "Johnny Doe",
            "first_name": "John",
            "firstName": "Johnny",
            "email": "john@example.com",
            "photoURL": "https://example.com/photo.jpg"
        })

        # Make request
        response = client.get("/api/users/user123")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "user123"
        assert data["displayName"] == "johndoe"  # username should be preferred
        assert data["username"] == "johndoe"
        assert data["email"] == "john@example.com"
        assert data["photoURL"] == "https://example.com/photo.jpg"

    @patch('app.routers.users.get_current_user')
    async def test_get_user_fallback_to_display_name(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test user lookup falling back to displayName when username is not available."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(return_value={
            "uid": "user123",
            "displayName": "John Doe",
            "display_name": "Johnny Doe",
            "first_name": "John",
            "email": "john@example.com"
        })

        # Make request
        response = client.get("/api/users/user123")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["displayName"] == "John Doe"  # displayName should be preferred

    @patch('app.routers.users.get_current_user')
    async def test_get_user_fallback_to_display_name_snake_case(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test user lookup falling back to display_name (snake_case) when other fields are not available."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(return_value={
            "uid": "user123",
            "display_name": "Jane Smith",
            "first_name": "Jane",
            "email": "jane@example.com"
        })

        # Make request
        response = client.get("/api/users/user123")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["displayName"] == "Jane Smith"  # display_name should be used

    @patch('app.routers.users.get_current_user')
    async def test_get_user_fallback_to_first_name(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test user lookup falling back to first_name when other display fields are not available."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(return_value={
            "uid": "user123",
            "first_name": "Alice",
            "email": "alice@example.com"
        })

        # Make request
        response = client.get("/api/users/user123")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["displayName"] == "Alice"  # first_name should be used

    @patch('app.routers.users.get_current_user')
    async def test_get_user_fallback_to_first_name_camel_case(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test user lookup falling back to firstName (camelCase) when other fields are not available."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(return_value={
            "uid": "user123",
            "firstName": "Bob",
            "email": "bob@example.com"
        })

        # Make request
        response = client.get("/api/users/user123")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["displayName"] == "Bob"  # firstName should be used

    @patch('app.routers.users.get_current_user')
    async def test_get_user_fallback_to_email_prefix(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test user lookup falling back to email prefix when no display fields are available."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(return_value={
            "uid": "user123",
            "email": "charlie@example.com"
        })

        # Make request
        response = client.get("/api/users/user123")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["displayName"] == "charlie"  # email prefix should be used

    @patch('app.routers.users.get_current_user')
    async def test_get_user_fallback_to_user_id(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test user lookup falling back to user ID when no user data is available."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(return_value={
            "uid": "user123"
        })

        # Make request
        response = client.get("/api/users/user123")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["displayName"] == "User user123..."  # fallback to user ID

    @patch('app.routers.users.get_current_user')
    async def test_get_user_not_found_returns_fallback(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test user lookup when user is not found returns fallback instead of 404."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(return_value=None)

        # Make request
        response = client.get("/api/users/nonexistent_user")

        # Verify response
        assert response.status_code == 200  # Should return 200 with fallback, not 404
        data = response.json()
        assert data["uid"] == "nonexistent_user"
        assert data["displayName"] == "User nonexistent_user..."

    @patch('app.routers.users.get_current_user')
    async def test_get_user_handles_exception_gracefully(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test user lookup handles exceptions gracefully with fallback."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(side_effect=Exception("Database error"))

        # Make request
        response = client.get("/api/users/user123")

        # Verify response
        assert response.status_code == 200  # Should return 200 with fallback, not 500
        data = response.json()
        assert data["uid"] == "user123"
        assert data["displayName"] == "User user123..."

    @patch('app.routers.users.get_current_user')
    async def test_lookup_users_batch_success(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test successful batch user lookup."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(side_effect=[
            {
                "uid": "user1",
                "username": "johndoe",
                "email": "john@example.com"
            },
            {
                "uid": "user2",
                "displayName": "Jane Smith",
                "email": "jane@example.com"
            }
        ])

        # Make request
        response = client.post("/api/users/lookup", json={
            "user_ids": ["user1", "user2"]
        })

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert len(data["users"]) == 2
        assert data["users"][0]["uid"] == "user1"
        assert data["users"][0]["displayName"] == "johndoe"
        assert data["users"][1]["uid"] == "user2"
        assert data["users"][1]["displayName"] == "Jane Smith"
        assert data["errors"] == []

    @patch('app.routers.users.get_current_user')
    async def test_lookup_users_batch_partial_failure(self, mock_auth, mock_firebase_service, mock_current_user):
        """Test batch user lookup with partial failures."""
        # Setup mocks
        mock_auth.return_value = mock_current_user
        mock_firebase_service.get_user_by_uid = AsyncMock(side_effect=[
            {
                "uid": "user1",
                "username": "johndoe",
                "email": "john@example.com"
            },
            None,  # user2 not found
            Exception("Database error")  # user3 error
        ])

        # Make request
        response = client.post("/api/users/lookup", json={
            "user_ids": ["user1", "user2", "user3"]
        })

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert len(data["users"]) == 3
        assert data["users"][0]["displayName"] == "johndoe"
        assert data["users"][1]["displayName"] == "User user2..."
        assert data["users"][2]["displayName"] == "User user3..."
        assert len(data["errors"]) == 2
        assert "User user2 not found" in data["errors"]
        assert "Failed to lookup user user3" in data["errors"]

    @patch('app.routers.users.get_current_user')
    async def test_lookup_users_empty_list(self, mock_auth, mock_current_user):
        """Test batch user lookup with empty user list."""
        # Setup mocks
        mock_auth.return_value = mock_current_user

        # Make request
        response = client.post("/api/users/lookup", json={
            "user_ids": []
        })

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["users"] == []
        assert data["errors"] == []

    def test_lookup_users_requires_authentication(self):
        """Test that user lookup requires authentication."""
        # Make request without authentication
        response = client.post("/api/users/lookup", json={
            "user_ids": ["user1"]
        })

        # Verify response
        assert response.status_code == 401

    def test_get_user_requires_authentication(self):
        """Test that single user lookup requires authentication."""
        # Make request without authentication
        response = client.get("/api/users/user123")

        # Verify response
        assert response.status_code == 401
