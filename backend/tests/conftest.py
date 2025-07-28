import pytest
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock

# Import your FastAPI app (this will need to be created)
# from app.main import app


# Mock Firebase dependencies
@pytest.fixture
def mock_firebase_auth():
    """Mock Firebase authentication service."""
    mock = Mock()
    mock.verify_id_token = Mock(
        return_value={
            "uid": "test-user-id",
            "email": "test@example.com",
            "email_verified": True,
        }
    )
    return mock


@pytest.fixture
def mock_firestore():
    """Mock Firestore database service."""
    mock = Mock()
    mock.collection = Mock()
    mock.document = Mock()
    return mock


@pytest.fixture
def mock_user_data():
    """Mock user data for testing."""
    return {
        "uid": "test-user-id",
        "email": "test@example.com",
        "display_name": "Test User",
        "created_at": "2025-01-01T00:00:00Z",
        "last_login": "2025-01-01T10:00:00Z",
    }


@pytest.fixture
def mock_challenge_data():
    """Mock challenge data for testing."""
    return {
        "id": "test-challenge-id",
        "title": "Test Challenge",
        "description": "This is a test challenge",
        "creator_id": "test-user-id",
        "target_number": 42,
        "range_min": 1,
        "range_max": 100,
        "created_at": "2025-01-01T10:00:00Z",
        "expires_at": "2025-01-02T10:00:00Z",
        "status": "active",
        "participants": [],
        "responses": [],
    }


@pytest.fixture
def test_client():
    """Create test client for FastAPI app."""
    # This will need to be uncommented when we have the FastAPI app
    # with TestClient(app) as client:
    #     yield client

    # For now, return a mock
    return Mock()


@pytest.fixture
async def async_client():
    """Create async test client for FastAPI app."""
    # This will need to be uncommented when we have the FastAPI app
    # async with AsyncClient(app=app, base_url="http://test") as client:
    #     yield client

    # For now, return a mock
    return AsyncMock()


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# Database fixtures
@pytest.fixture
async def clean_database():
    """Clean database before and after each test."""
    # Clear test database before test
    yield
    # Clear test database after test


@pytest.fixture
def mock_redis():
    """Mock Redis cache service."""
    mock = Mock()
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock(return_value=True)
    mock.delete = AsyncMock(return_value=True)
    mock.exists = AsyncMock(return_value=False)
    return mock


# Authentication fixtures
@pytest.fixture
def authenticated_user_headers():
    """Headers for authenticated user requests."""
    return {
        "Authorization": "Bearer mock-firebase-token",
        "Content-Type": "application/json",
    }


@pytest.fixture
def mock_admin_user():
    """Mock admin user data."""
    return {
        "uid": "admin-user-id",
        "email": "admin@example.com",
        "display_name": "Admin User",
        "role": "admin",
        "permissions": ["read", "write", "delete", "admin"],
    }


# API response fixtures
@pytest.fixture
def api_success_response():
    """Standard successful API response format."""
    return {
        "success": True,
        "data": {},
        "message": "Operation completed successfully",
        "timestamp": "2025-01-01T10:00:00Z",
    }


@pytest.fixture
def api_error_response():
    """Standard error API response format."""
    return {
        "success": False,
        "error": "Test error message",
        "code": "TEST_ERROR",
        "timestamp": "2025-01-01T10:00:00Z",
    }


# Test data generators
@pytest.fixture
def challenge_generator():
    """Generate challenge data for testing."""

    def _generate(count: int = 1, **overrides):
        challenges = []
        for i in range(count):
            challenge = {
                "id": f"challenge-{i}",
                "title": f"Challenge {i}",
                "description": f"Test challenge number {i}",
                "creator_id": "test-user-id",
                "target_number": 42 + i,
                "range_min": 1,
                "range_max": 100,
                "created_at": "2025-01-01T10:00:00Z",
                "expires_at": "2025-01-02T10:00:00Z",
                "status": "active",
                **overrides,
            }
            challenges.append(challenge)
        return challenges if count > 1 else challenges[0]

    return _generate
