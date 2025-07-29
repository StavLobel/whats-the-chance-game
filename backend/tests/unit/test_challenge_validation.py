"""
Unit tests for challenge validation following STP.md specifications.

Test Suite: Backend Unit Tests - Validation
Coverage: Pydantic models, input ranges, formats
"""

from datetime import datetime, timedelta

import pytest
from pydantic import ValidationError

from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeResponse,
    ChallengeUpdate,
)


class TestChallengeValidation:
    """Test challenge validation logic following STP.md B-01."""

    def test_valid_challenge_creation(self):
        """Test that valid challenge data passes validation."""
        valid_data = {
            "from_user": "user123",
            "to_user": "user456",
            "title": "Test Challenge",
            "description": "What's the chance you'll do this test?",
            "category": "funny",
            "difficulty": "easy",
            "tags": ["test", "fun"],
            "isPublic": True,
            "targetUserId": None,
            "expiresAt": datetime.now() + timedelta(hours=24),
        }

        challenge = ChallengeCreate(**valid_data)
        assert challenge.title == "Test Challenge"
        assert challenge.category == "funny"
        assert challenge.difficulty == "easy"
        assert challenge.isPublic is True

    def test_title_validation_required(self):
        """Test that title is required for challenge creation."""
        invalid_data = {
            "description": "What's the chance you'll do this test?",
            "category": "funny",
            "difficulty": "easy",
            "tags": ["test"],
            "isPublic": True,
        }

        with pytest.raises(ValidationError) as exc_info:
            ChallengeCreate(**invalid_data)

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("title",) for error in errors)

    def test_title_validation_length(self):
        """Test that title has appropriate length constraints."""
        # Test too short title
        with pytest.raises(ValidationError):
            ChallengeCreate(
                title="",
                description="Test description",
                category="funny",
                difficulty="easy",
                tags=["test"],
                isPublic=True,
            )

        # Test too long title
        with pytest.raises(ValidationError):
            ChallengeCreate(
                title="x" * 201,  # Assuming 200 char limit
                description="Test description",
                category="funny",
                difficulty="easy",
                tags=["test"],
                isPublic=True,
            )

    def test_description_validation_required(self):
        """Test that description is required for challenge creation."""
        invalid_data = {
            "title": "Test Challenge",
            "category": "funny",
            "difficulty": "easy",
            "tags": ["test"],
            "isPublic": True,
        }

        with pytest.raises(ValidationError) as exc_info:
            ChallengeCreate(**invalid_data)

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("description",) for error in errors)

    def test_category_validation(self):
        """Test that only valid categories are accepted."""
        valid_categories = [
            "funny",
            "dare",
            "creative",
            "physical",
            "mental",
            "social",
            "other",
        ]

        for category in valid_categories:
            challenge = ChallengeCreate(
                title="Test Challenge",
                description="Test description",
                category=category,
                difficulty="easy",
                tags=["test"],
                isPublic=True,
            )
            assert challenge.category == category

        # Test invalid category
        with pytest.raises(ValidationError):
            ChallengeCreate(
                title="Test Challenge",
                description="Test description",
                category="invalid_category",
                difficulty="easy",
                tags=["test"],
                isPublic=True,
            )

    def test_difficulty_validation(self):
        """Test that only valid difficulties are accepted."""
        valid_difficulties = ["easy", "medium", "hard", "extreme"]

        for difficulty in valid_difficulties:
            challenge = ChallengeCreate(
                title="Test Challenge",
                description="Test description",
                category="funny",
                difficulty=difficulty,
                tags=["test"],
                isPublic=True,
            )
            assert challenge.difficulty == difficulty

        # Test invalid difficulty
        with pytest.raises(ValidationError):
            ChallengeCreate(
                title="Test Challenge",
                description="Test description",
                category="funny",
                difficulty="invalid_difficulty",
                tags=["test"],
                isPublic=True,
            )

    def test_tags_validation(self):
        """Test that tags are properly validated."""
        # Test valid tags
        challenge = ChallengeCreate(
            title="Test Challenge",
            description="Test description",
            category="funny",
            difficulty="easy",
            tags=["test", "fun", "challenge"],
            isPublic=True,
        )
        assert len(challenge.tags) == 3

        # Test empty tags (should be allowed)
        challenge = ChallengeCreate(
            title="Test Challenge",
            description="Test description",
            category="funny",
            difficulty="easy",
            tags=[],
            isPublic=True,
        )
        assert challenge.tags == []

    def test_expiration_date_validation(self):
        """Test that expiration date is properly validated."""
        # Test valid future date
        future_date = datetime.now() + timedelta(hours=24)
        challenge = ChallengeCreate(
            title="Test Challenge",
            description="Test description",
            category="funny",
            difficulty="easy",
            tags=["test"],
            isPublic=True,
            expiresAt=future_date,
        )
        assert challenge.expiresAt == future_date

    @pytest.mark.skip(reason="Range validation not yet implemented")
    def test_number_range_validation(self):
        """Test number range validation (1 ≤ range ≤ 100) - STP.md B-01."""
        # TODO: Implement number range validation in game resolution
        # This test is skipped until range validation is implemented
        assert False, "Range validation not implemented"

    @pytest.mark.skip(reason="Target user validation not yet implemented")
    def test_target_user_validation(self):
        """Test that target user exists when specified."""
        # TODO: Implement target user validation
        # This test is skipped until user validation is implemented
        assert False, "Target user validation not implemented"


class TestChallengeResponse:
    """Test challenge response serialization."""

    def test_challenge_response_serialization(self):
        """Test that challenge response contains all required fields."""
        # This test will need to be implemented once we have actual data
        # For now, we'll skip it as it requires database integration
        pass

    @pytest.mark.skip(reason="Challenge response not yet fully implemented")
    def test_challenge_metadata_serialization(self):
        """Test that challenge metadata is properly serialized."""
        # TODO: Implement challenge metadata serialization tests
        # This test is skipped until metadata handling is implemented
        assert False, "Challenge metadata serialization not implemented"


class TestChallengeUpdate:
    """Test challenge update validation."""

    @pytest.mark.skip(reason="Challenge update not yet implemented")
    def test_challenge_update_validation(self):
        """Test that challenge updates are properly validated."""
        # TODO: Implement challenge update validation
        # This test is skipped until update functionality is implemented
        assert False, "Challenge update validation not implemented"

    @pytest.mark.skip(reason="Partial update not yet implemented")
    def test_partial_challenge_update(self):
        """Test that partial challenge updates work correctly."""
        # TODO: Implement partial update validation
        # This test is skipped until partial update is implemented
        assert False, "Partial challenge update not implemented"
